import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { updateMatchState, getMatchState, subscribeToMatch } from '@/lib/supabaseService';
import { Card, GameState, Player } from '@/types';
import { initializeGame as initGameLogic, calculateReaction, applySaltEffect, calculateBufferedPHChange } from '@/lib/gameLogic';
import { elementCards, sintesisCards, garamCards } from '@/lib/gameData';

const INITIAL_PLAYER_STATE: Player = {
    id: '',
    name: 'Player',
    hp: 100,
    maxHP: 100,
    currentE: 10,
    maxE: 10,
    currentM: 10,
    maxM: 10,
    hand: [],
    makmal: [],
    synthesisZone: [],
    bukuFormula: [],
    timbunanBuang: [],
    statusEffects: [],
    deck: [],
    trapSlot: null,
    ph: 7.0,
    activeBuffers: [],
    drawCount: 0
};

export const usePVPState = (matchId: number, myPlayerId: string) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial fetch and role assignment
    useEffect(() => {
        if (!matchId || !myPlayerId) return;

        const init = async () => {
            setLoading(true);
            const data = await getMatchState(matchId);
            if (data) {
                const role = data.player1_id === myPlayerId ? 'player1' :
                    data.player2_id === myPlayerId ? 'player2' : null;
                setPlayerRole(role);

                if (data.game_state) {
                    const loadedState = data.game_state as GameState;
                    setGameState(loadedState);
                    setIsMyTurn(loadedState.currentPlayer === role);
                } else {
                    // Initialize new game state if null (HOST only)
                    if (role === 'player1') {
                        const initialState: GameState = {
                            currentPlayer: 'player1',
                            turnNumber: 1,
                            gameLog: [],
                            activeVisualEffects: [],
                            player1: { ...INITIAL_PLAYER_STATE, id: data.player1_id, name: 'Player 1' },
                            player2: { ...INITIAL_PLAYER_STATE, id: data.player2_id || 'Waiting...', name: 'Player 2' },
                        };

                        // Give starting cards (Example)
                        // In real impl, would shuffle deck etc.

                        await updateMatchState(matchId, initialState);
                        setGameState(initialState);
                        setIsMyTurn(true);
                    }
                }
            }
            setLoading(false);
        };

        init();
    }, [matchId, myPlayerId]);

    // Subscription
    useEffect(() => {
        if (!matchId) return;

        const sub = subscribeToMatch(matchId, (payload) => {
            if (payload.new && payload.new.game_state) {
                const newState = payload.new.game_state as GameState;
                setGameState(newState);
                // Update turn status
                if (playerRole) {
                    setIsMyTurn(newState.currentPlayer === playerRole);
                }
            }
        });

        return () => {
            sub.unsubscribe();
        };
    }, [matchId, playerRole]);

    const sendAction = useCallback(async (actionType: string, payload: any) => {
        if (!gameState || !playerRole || !isMyTurn) return;

        // Clone state
        const nextState = JSON.parse(JSON.stringify(gameState));
        const me = nextState[playerRole];
        const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
        const opponent = nextState[opponentRole];

        if (actionType === 'END_TURN') {
            nextState.currentPlayer = opponentRole;
            nextState.turnNumber++;

            // Resource Regen
            const nextPlayerObj = nextState[nextState.currentPlayer];
            nextPlayerObj.currentE = Math.min(nextPlayerObj.maxE, nextPlayerObj.currentE + 2);
            nextPlayerObj.currentM = Math.min(nextPlayerObj.maxM, nextPlayerObj.currentM + 2);
            nextPlayerObj.drawCount = 0;

            nextState.gameLog.push({
                id: Date.now().toString(),
                turn: nextState.turnNumber,
                actorId: me.id,
                message: `Menamatkan giliran.`,
                timestamp: Date.now(),
                type: 'system',
                publicMsg: `${me.name} menamatkan giliran.`
            });

        } else if (actionType === 'ATTACK') {
            const { card, index } = payload;

            // 0. Energy Validation (Fixed Cost: 1)
            const attackCost = 1;
            if (me.currentE < attackCost) {
                // Fail silently for now
                return;
            }

            // 1. Calculate Reaction
            // Create defending card (Dummy/Neutral) if no trap is present
            const defendingCard = opponent.trapSlot || { id: 'def-0', name: 'Tiada', type: 'Neutral', eCost: 0, mCost: 0, power: 0 } as any;
            const result = calculateReaction(card, defendingCard);

            // 2. pH Multipliers
            let pHEffectMultiplier = 1.0;
            const targetPH = opponent.ph;

            if (card.sintesisType === 'Asid') {
                if (targetPH < 1.0) pHEffectMultiplier = 2.0;
                else if (targetPH >= 1.0 && targetPH < 2.0) pHEffectMultiplier = 1.5;
                else if (targetPH >= 2.0 && targetPH < 3.0) pHEffectMultiplier = 1.25;
                else if (targetPH >= 3.0 && targetPH <= 5.0) pHEffectMultiplier = 1.10;
            } else if (card.sintesisType === 'Bes') {
                if (targetPH > 13.0) pHEffectMultiplier = 2.0;
                else if (targetPH > 12.0 && targetPH <= 13.0) pHEffectMultiplier = 1.5;
                else if (targetPH > 11.0 && targetPH <= 12.0) pHEffectMultiplier = 1.25;
                else if (targetPH >= 9.0 && targetPH <= 11.0) pHEffectMultiplier = 1.10;
            }

            if (pHEffectMultiplier > 1.0) {
                result.damageDealt = Math.floor(result.damageDealt * pHEffectMultiplier);
                result.message += ` (VULNERABLE x${pHEffectMultiplier}!)`;
            }

            // 3. Update Stats
            me.currentE -= attackCost;
            opponent.hp = Math.max(0, opponent.hp - result.damageDealt);
            me.hp = Math.max(0, me.hp - result.recoilDamage);
            opponent.ph = Math.max(0, Math.min(14, opponent.ph + (result.pHChange || 0)));

            // 4. Consume Card
            me.hand.splice(index, 1);
            me.timbunanBuang.push(card);

            if (opponent.trapSlot && card.type !== 'Garam') {
                opponent.trapSlot = null;
            }

            // 5. Side Effects
            if (result.cardGenerated) opponent.hand.push(result.cardGenerated);
            if (result.extraCard) opponent.hand.push(result.extraCard);

            // 6. Log
            nextState.gameLog.push({
                id: Date.now().toString(),
                turn: nextState.turnNumber,
                actorId: me.id,
                message: `Serang: ${result.message}`,
                timestamp: Date.now(),
                type: 'attack',
                publicMsg: `${me.name} serang: ${result.message}`
            });

            if (opponent.hp <= 0) {
                nextState.gameLog.push({
                    id: (Date.now() + 1).toString(),
                    turn: nextState.turnNumber,
                    actorId: 'system',
                    message: "PERMAINAN TAMAT!",
                    timestamp: Date.now(),
                    type: 'system',
                    publicMsg: `${me.name} MENANG!`
                });
            }

        } else if (actionType === 'SYNTHESIZE') {
            const { targetCard, cost } = payload;

            // 1. Consume Resources
            if (me.currentE < cost) return; // Should be validated by UI too
            me.currentE -= cost;

            // 2. Remove Ingredients (Logic needs to know WHICH ingredients to remove)
            // Ideally payload sends 'ingredientsIndices'. 
            // For MVP simplifiction: We assume UI validated ingredients. 
            // We need to look at 'synthesisZone' and remove matching cards?
            // Current PVE logic is implicit. Let's assume we clear the Synthesis Zone of matching ingredients.
            // Simplified: Just clear the zone for now as the PVE does on success.
            const recipe = [...sintesisCards, ...garamCards].find(c => c.id === targetCard.id);

            // Clear Synthesis Zone (ingredients used)
            me.synthesisZone = [];

            // 3. Add Result to Hand
            // Need to generate a unique ID instance? Or just push the Card Object.
            const newCard = { ...targetCard, id: `${targetCard.id}_${Date.now()}` };
            me.hand.push(newCard);

            nextState.gameLog.push({
                id: Date.now().toString(),
                turn: nextState.turnNumber,
                actorId: me.id,
                message: `Sintesis berjaya: ${targetCard.name}`,
                timestamp: Date.now(),
                type: 'synthesis',
                publicMsg: `${me.name} mensintesis ${targetCard.name}.`
            });
        } else if (actionType === 'DROP_ZONE') {
            const { card, source, index } = payload;
            if (source === 'hand') {
                me.hand.splice(index, 1);
                me.synthesisZone.push(card);
            }
        } else if (actionType === 'MOVE_TO_HAND') {
            const { index } = payload;
            const card = me.synthesisZone[index];
            if (card) {
                me.synthesisZone.splice(index, 1);
                me.hand.push(card);
            }
        }

        // Send to DB
        await updateMatchState(matchId, nextState);
    }, [gameState, matchId, playerRole, isMyTurn]);

    return {
        gameState,
        isMyTurn,
        playerRole,
        loading,
        sendAction
    };
};
