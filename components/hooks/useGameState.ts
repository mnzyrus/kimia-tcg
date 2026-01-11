"use client";
// Force Rebuild 1

import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Card, LogEntry } from '../../types';
import { initializeGame as initGameLogic, calculateReaction, applySaltEffect, calculateBufferedPHChange } from '../../lib/gameLogic';
import { sintesisCards, garamCards } from '../../lib/gameData';
import { OpponentAI, GeminiService } from '../../lib/ai';
import { soundManager } from '../../lib/audio';
import { useGameSettings } from '../../lib/SettingsContext';
import { triggerPHAnimation } from '../../lib/phEvents';

export function useGameState() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myId, setMyId] = useState<string>('player1');
    const [myRole, setMyRole] = useState<'player1' | 'player2' | null>('player1'); // Default to P1 for dev
    const [socketStatus, setSocketStatus] = useState<string>('disconnected');
    const [notification, setNotification] = useState<{ message: string, type: 'info' | 'error' | 'success' } | null>(null);

    // Settings for AI Key
    const { settings } = useGameSettings();

    const onNotify = (n: { message: string, type: 'info' | 'error' | 'success' }) => {
        setNotification(n);
        setTimeout(() => setNotification(null), 3000);
    };

    const initializeGame = (p1Name: string, p2Name: string) => {
        const state = initGameLogic(p1Name, p2Name);
        setGameState(state);
        setMyRole('player1');
        return state;
    };

    // --- GAME ACTIONS (Simulated for PVE/Local) ---
    // In a real app, these would emit Socket events.
    // For now, we update local state directly for PVE.

    const handleCardPlay = (card: Card, index: number, targetZone: 'synthesis' | 'defense') => {
        if (!gameState) return;
        // Basic Local Implementation Stubs
        console.log("Playing Card:", card.name, targetZone);
        // TODO: fully implement local state mutation if needed for Offline PVE
    };

    // handleAttack is now implemented at bottom of file

    const handleEndTurn = () => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            if (!prev) return null;
            // if (prev.currentPlayer !== 'player1') return prev; // Removed restriction to allow AI to end turn

            const isP1 = prev.currentPlayer === 'player1';
            const pCurrent = isP1 ? { ...prev.player1 } : { ...prev.player2 };

            // 1. Reset Counters
            pCurrent.drawCount = 0;

            // 2. PASSIVE BONUS (pH Stability + Turn Rule)
            // Rule 1: Flat +3 Energy start of turn (Turn Rule).
            // Rule 2: +1/2 E & M if pH is stable (Passive Bonus).

            let bonusE = 0;
            let bonusM = 0;
            let bonusMsg = '';

            const currentPH = pCurrent.ph;
            if (currentPH === 7.0) {
                bonusE = 2; bonusM = 2;
                bonusMsg = 'Stabiliti pH Sempurna (7.0): +2 E & +2 M!';
            } else if (currentPH >= 6.0 && currentPH <= 8.0) {
                bonusE = 1; bonusM = 1;
                bonusMsg = 'Stabiliti pH Baik: +1 E & +1 M.';
            }

            if (bonusE > 0 || bonusM > 0) {
                pCurrent.currentE = Math.min(pCurrent.maxE, pCurrent.currentE + bonusE);
                pCurrent.currentM = Math.min(pCurrent.maxM, pCurrent.currentM + bonusM);
                onNotify({ message: bonusMsg, type: 'success' });
            }

            // 3. Prepare Next Player (P2) -> Give +3 Energy & +4 Mass
            const pNext = isP1 ? { ...prev.player2 } : { ...prev.player1 };
            pNext.currentE = Math.min(pNext.maxE, pNext.currentE + 3);
            pNext.currentM = Math.min(pNext.maxM, pNext.currentM + 4);
            pNext.drawCount = 0;

            // Increment Turn Number ONLY when P2 ends turn (Round complete) ? Or every switch?
            // Usually Turn 1: P1 -> P2. Turn 2: P1...
            // Standard TCG: Turn increments when it gets back to Start Player?
            // Existing logic incremented turn inside "AI Loop".
            // Let's standardise: Turn Number increments when P2 ends turn (Round End).

            let nextTurnNum = prev.turnNumber;
            if (!isP1) {
                nextTurnNum += 1;
                // Draw for both at start of round (as per previous Restore Point logic)?
                // "When turn counter increases, BOTH players get 2 cards"
                for (let i = 0; i < 2; i++) {
                    if (pCurrent.deck.length > 0) pCurrent.hand.push(pCurrent.deck.pop()!); // P2 (just ended)
                    if (pNext.deck.length > 0) pNext.hand.push(pNext.deck.pop()!); // P1 (about to start)
                }
            }

            const newState = {
                ...prev,
                player1: isP1 ? pCurrent : pNext,
                player2: isP1 ? pNext : pCurrent,
                currentPlayer: (isP1 ? 'player2' : 'player1') as 'player1' | 'player2',
                turnNumber: nextTurnNum,
                gameLog: [...prev.gameLog, {
                    id: Date.now(),
                    message: isP1 ? "Giliran tamat. AI berfikir..." : `Pusingan ${nextTurnNum} bermula.`,
                    privateMsg: "",
                    publicMsg: "",
                    actorId: (isP1 ? 'player1' : 'player2') as 'player1' | 'player2' | 'system',
                    turn: prev.turnNumber,
                    type: 'system' as const,
                    timestamp: Date.now()
                }]
            };
            return newState;
        });
        soundManager.playSFX('click');
    };

    // --- GAME ACTIONS RESTORED ---

    const handleDrawCard = () => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const isP1 = prev.currentPlayer === 'player1';

            // Allow if it IS my role OR if I am the host (P1) running the AI (P2)
            // If I am P1, and it is P2's turn (AI), I MUST allow this function to run.
            // If I am P2 (Network Client), and it is P1's turn, I block.
            // Simplified: If it is NOT my turn, AND I am not the host running AI, block.
            if (myRole === 'player1' && !isP1 && prev.currentPlayer !== 'player2') return prev; // Wait, AI is 'player2'. logic is tricky.
            // Correct Logic:
            // If Local Game: P1 controls P1. P1 (System) controls P2 (AI).
            // So if I am P1, I can run this for P1 AND P2.
            // If Network Game: P1 controls P1. P2 controls P2.
            // Current strict check: `if ((myRole === 'player1' && !isP1) || ...)` BLOCKS AI.
            // FIX: Remove strict role check for local/AI actions, or checking 'actorId' context.
            // Since this is called by AI loop (running on P1 client), we should trust the call or check if `gameState.winner` is set.

            // For now, removing strict 'myRole' check here because AI calls this directly.
            // In a secured MP game, we'd check `socket.id`.


            const p = isP1 ? { ...prev.player1 } : { ...prev.player2 };

            const DRAW_COST = 1;
            const DRAW_LIMIT = 3;

            if ((p.drawCount || 0) >= DRAW_LIMIT) {
                onNotify({ message: "Had Tarik Kad Dicapai (Max 3/Giliran)", type: 'error' });
                return prev;
            }
            if (p.currentE < DRAW_COST) {
                onNotify({ message: "Tenaga tidak mencukupi (Perlu 1 E)", type: 'error' });
                return prev;
            }
            if (p.deck.length === 0) {
                onNotify({ message: "Deck telah kosong!", type: 'error' });
                return prev;
            }

            // Execute Draw
            // Clone arrays to prevent state mutation
            p.deck = [...p.deck];
            p.hand = [...p.hand];

            // Execute Draw (Lucky Draw System)
            // Probabilities: 1(80%), 2(18%), 3(1.5%), 4(0.45%), 5(0.05%)
            p.currentE -= DRAW_COST;
            p.drawCount = (p.drawCount || 0) + 1;

            const rng = Math.random() * 100;
            let drawCount = 1;
            if (rng > 99.95) drawCount = 5;
            else if (rng > 99.5) drawCount = 4;
            else if (rng > 98.0) drawCount = 3;
            else if (rng > 80.0) drawCount = 2; // Verified: 98 - 80 = 18% Chance

            console.log(`[Draw] RNG: ${rng.toFixed(2)}, Count: ${drawCount}`);

            const drawnCards = [];
            for (let i = 0; i < drawCount; i++) {
                if (p.deck.length > 0) {
                    const newCard = p.deck.pop()!;
                    p.hand.push(newCard);
                    drawnCards.push(newCard);
                }
            }

            // Jackpot Sound & Message
            let drawMsg = `${p.name} tarik ${drawnCards.length} kad!`;
            if (drawCount > 1) drawMsg += " (LUCKY DRAW!)";
            if (drawCount >= 3) drawMsg += " (JACKPOT!)";

            return {
                ...prev,
                player1: isP1 ? p : prev.player1,
                player2: !isP1 ? p : prev.player2,
                gameLog: [...prev.gameLog, {
                    id: Date.now(),
                    message: drawMsg,
                    privateMsg: '',
                    publicMsg: '',
                    actorId: p.id as 'player1' | 'player2',
                    turn: prev.turnNumber,
                    type: 'draw' as const,
                    timestamp: Date.now()
                }]
            };
        });
        soundManager.playSFX('click');
    };

    const handleReaction = (card: Card, index: number) => {
        // Placeholder for future PVP reaction logic
        console.log("Reaction declared:", card.name);
    };

    const handleSelfApply = (card: Card, source: string, index: number) => {
        if (!gameState) return;

        // [Refactor] Calculate EVERYTHING derived from current state BEFORE setGameState
        // This avoids side effects inside the reducer and allows pure logic
        const isP1 = gameState.currentPlayer === 'player1';
        const p = isP1 ? gameState.player1 : gameState.player2; // Read specific player state

        let msgParts: string[] = [];
        let success = false;
        const config = card.reactionConfig;

        // Temp variables to hold calculation results
        let finalPH = p.ph;
        let finalHP = p.hp;
        let animData: import('@/types').CalculationData | undefined = undefined;

        // 1. Effects
        if (config?.type === 'heal') {
            const heal = config.value || 200;
            finalHP = Math.min(p.maxHP, p.hp + heal);
            msgParts.push(`(+${heal} HP)`);
            success = true;
        }

        if (config?.type === 'status') {
            msgParts.push(`(${config.statusName})`);
            success = true;
        }

        // 2. Water / pH
        if (card.id === 'sin-water' || card.name.includes('Air (H₂O)')) {
            finalPH = 7.0;
            msgParts.push("pH Reset ke 7.0 (Neutral)");
            success = true;
        } else {
            const substancePH = card.pH !== undefined ? card.pH : (card.sintesisType === 'Asid' ? 3.0 : (card.sintesisType === 'Bes' ? 11.0 : 7.0));
            const rawDelta = 7.0 - substancePH;

            if (Math.abs(rawDelta) >= 0.1 || card.isBuffer) {
                const { finalChange, calculationData } = calculateBufferedPHChange(rawDelta, p.activeBuffers, substancePH);
                animData = calculationData;

                // FIX: Add change (Acid returns negative delta, Base returns positive delta)
                finalPH = Math.max(0, Math.min(14, p.ph + finalChange));

                const changeVal = Math.abs(finalPH - p.ph).toFixed(2);
                const changeDir = finalPH > p.ph ? "meningkat" : "berkurang";

                if (parseFloat(changeVal) > 0) {
                    msgParts.push(`pH ${changeDir} ${changeVal}`);
                    success = true;
                }
            } else if (!success) {
                onNotify({ message: "Kad ini neutral (Tiada kesan).", type: 'info' });
                return;
            }
        }

        // Apply Side Effects safely outside
        if (success) {
            if (isP1 && animData) {
                triggerPHAnimation(animData);
            }
            if (soundManager) soundManager.playSFX('success');

            // Now Update State Purely
            setGameState(prev => {
                if (!prev) return null;
                // Re-fetch player references potentially (though safe in this turn)
                // We apply the PRE-CALCULATED values to ensure sync
                const currP = isP1 ? prev.player1 : prev.player2;

                // Copy
                const updatedP = { ...currP };
                updatedP.hp = finalHP;
                updatedP.ph = finalPH;

                // Handle Hand
                const newHand = [...updatedP.hand];
                if (newHand[index] && newHand[index].id === card.id) {
                    newHand.splice(index, 1);
                } else {
                    const idx = newHand.findIndex(c => c.id === card.id);
                    if (idx !== -1) newHand.splice(idx, 1);
                }
                updatedP.hand = newHand;
                updatedP.timbunanBuang.push(card);

                const msg = `${updatedP.name} guna ${card.name} ${msgParts.join(', ')}`;

                // Add Float Animation
                let newEffects = [...prev.activeVisualEffects];
                if (msgParts.some(m => m.includes('pH'))) {
                    const changePart = msgParts.find(m => m.includes('pH'));
                    if (changePart) {
                        newEffects.push({
                            id: Date.now(),
                            type: changePart.includes('meningkat') ? 'reaction_good' : 'reaction_bad',
                            description: changePart,
                            value: changePart,
                            position: { x: 50, y: 50 },
                            createdAt: Date.now(),
                            duration: 2000
                        });
                    }
                }

                return {
                    ...prev,
                    player1: isP1 ? updatedP : prev.player1,
                    player2: !isP1 ? updatedP : prev.player2,
                    activeVisualEffects: newEffects,
                    gameLog: [...prev.gameLog, {
                        id: Date.now(),
                        message: msg,
                        privateMsg: '',
                        publicMsg: '',
                        actorId: updatedP.id as 'player1' | 'player2',
                        turn: prev.turnNumber,
                        type: 'heal' as const,
                        timestamp: Date.now()
                    }]
                };
            });
        }
    };

    // --- LOBBY ACTIONS ---
    const handleJoinCustomRoom = (roomId: string) => {
        console.log("Join Room:", roomId);
        setSocketStatus('connected');
    };

    const handleCreateRoom = (roomId: string) => {
        console.log("Create Room:", roomId);
        setSocketStatus('connected');
    };

    const handleRandomMatch = () => {
        console.log("Random Match");
    };

    // --- CARD MOVEMENT HANDLERS ---

    const handleDropToZone = (card: Card, source: string, index: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const p = prev.currentPlayer === 'player1' ? { ...prev.player1 } : { ...prev.player2 };

            // Clone arrays to avoid mutating previous state
            const newHand = [...p.hand];
            const newZone = [...p.synthesisZone];

            // Limit check
            if (newZone.length >= 5) {
                onNotify({ message: 'Kebuk Sintesis penuh (Max 5)!', type: 'error' });
                return prev;
            }

            // Safety: Checking if card actually exists in hand
            // UPDATED: Find by ID to prevent Index Drift / Duplication Glitch
            let foundIndex = -1;
            if (newHand[index] && newHand[index].id === card.id) {
                foundIndex = index;
            } else {
                foundIndex = newHand.findIndex(c => c.id === card.id);
            }

            if (foundIndex === -1) return prev; // Card not found in source! Abort.

            // Remove from hand check
            const [movedCard] = newHand.splice(foundIndex, 1);
            if (movedCard) {
                newZone.push(movedCard);
            }

            p.hand = newHand;
            p.synthesisZone = newZone;

            return {
                ...prev,
                player1: prev.currentPlayer === 'player1' ? p : prev.player1,
                player2: prev.currentPlayer === 'player2' ? p : prev.player2
            };
        });
        soundManager.playSFX('click');
    };

    const handleMoveCardToHand = (index: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const p = prev.currentPlayer === 'player1' ? { ...prev.player1 } : { ...prev.player2 };

            const newHand = [...p.hand];
            const newZone = [...p.synthesisZone];

            if (!p.synthesisZone[index]) return prev;

            // Remove from Zone - Strict Check
            const [movedCard] = newZone.splice(index, 1);
            if (movedCard) {
                newHand.push(movedCard);
            } else {
                // Should not happen if validation passes, but fail safe.
                return prev;
            }

            p.hand = newHand;
            p.synthesisZone = newZone;

            return {
                ...prev,
                player1: prev.currentPlayer === 'player1' ? p : prev.player1,
                player2: prev.currentPlayer === 'player2' ? p : prev.player2
            };
        });
        soundManager.playSFX('click');
    };

    const handleClearSynthesis = () => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const p = prev.currentPlayer === 'player1' ? { ...prev.player1 } : { ...prev.player2 };

            const newHand = [...p.hand];
            const newZone = [...p.synthesisZone];

            // Move all back to hand
            if (newZone.length > 0) {
                newHand.push(...newZone);
                p.synthesisZone = [];
                p.hand = newHand;
            }

            return {
                ...prev,
                player1: prev.currentPlayer === 'player1' ? p : prev.player1,
                player2: prev.currentPlayer === 'player2' ? p : prev.player2
            };
        });
        soundManager.playSFX('click');
    };

    const handleRecycle = (card: Card, source: string, index: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const p = prev.currentPlayer === 'player1' ? { ...prev.player1 } : { ...prev.player2 };

            const newHand = [...p.hand];
            const newTimbunan = [...p.timbunanBuang];

            if (!newHand[index]) return prev;

            const [removed] = newHand.splice(index, 1);
            if (removed) {
                p.currentE = Math.min(p.maxE, p.currentE + 1);
                newTimbunan.push(removed);
                // Log and notify logic
            }

            p.hand = newHand;
            p.timbunanBuang = newTimbunan;

            return {
                ...prev,
                player1: prev.currentPlayer === 'player1' ? p : prev.player1,
                player2: prev.currentPlayer === 'player2' ? p : prev.player2,
                gameLog: [...prev.gameLog, { id: Date.now(), message: `${p.name} kitar semula ${card.name} (+1 Tenaga)`, privateMsg: '', publicMsg: '', actorId: p.id as 'player1' | 'player2', turn: prev.turnNumber, type: 'info' as const, timestamp: Date.now() }]
            };
        });
        soundManager.playSFX('click');
        onNotify({ message: `+1 Tenaga (Kitar Semula ${card.name})`, type: 'success' });
    };

    // handleSynthesize implemented at bottom

    // Stubs for missing PlayerZone props
    const handleSetTrap = (card: Card, source: string, index: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const isP1 = prev.currentPlayer === 'player1';
            const p = isP1 ? { ...prev.player1 } : { ...prev.player2 };

            // Logic: Defensive Slot can hold 1 card
            // If dragging to defense, we replace or invalid if full?
            // Let's assume replace for now, or just swap.

            const newHand = [...p.hand];

            // Remove from hand check
            if (!newHand[index]) return prev;

            const oldTrap = p.trapSlot;
            const newTrap = newHand[index];

            // Allow placing 'Taktikal', 'Trap', or 'Garam' (Defense Mode)
            // Or just any card as a shield? Let's restrict to reasonable types.
            // For now: Allow all, but maybe show warning if useless.

            newHand.splice(index, 1);
            if (oldTrap) {
                newHand.push(oldTrap); // Swap
            }

            p.trapSlot = newTrap;
            p.hand = newHand;

            return {
                ...prev,
                player1: isP1 ? p : prev.player1,
                player2: !isP1 ? p : prev.player2,
                gameLog: [...prev.gameLog, {
                    id: Date.now(),
                    message: `${p.name} pasang pertahanan: ${newTrap.name}`,
                    privateMsg: '',
                    publicMsg: '',
                    actorId: p.id as 'player1' | 'player2',
                    turn: prev.turnNumber,
                    type: 'info',
                    timestamp: Date.now()
                }]
            };
        });
        soundManager.playSFX('click');
    };

    // --- ATTACK LOGIC (RESTORED FROM BACKUP) ---
    const handleAttack = (card: Card, index: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const isP1 = prev.currentPlayer === 'player1';
            const attacker = isP1 ? { ...prev.player1 } : { ...prev.player2 };
            const defender = isP1 ? { ...prev.player2 } : { ...prev.player1 };

            // 0. Energy Validation
            const attackCost = 1;
            if (attacker.currentE < attackCost) {
                onNotify({ message: "Tidak cukup tenaga untuk menyerang (1 E)!", type: 'error' });
                return prev;
            }

            // 1. Calculate Base Damage
            const defendingCard = defender.trapSlot || { id: 'def-0', name: 'Tiada', type: 'Neutral', eCost: 0, mCost: 0, power: 0 } as any;
            let result = calculateReaction(card, defendingCard);

            // 2. pH Damage Multipliers (Vulnerability)
            let pHEffectMultiplier = 1.0;
            const targetPH = defender.ph;

            // Acidic Vulnerability (Low pH takes more Acid Dmg)
            if (card.sintesisType === 'Asid') {
                if (targetPH < 1.0) pHEffectMultiplier = 2.0;
                else if (targetPH >= 1.0 && targetPH < 2.0) pHEffectMultiplier = 1.5;
                else if (targetPH >= 2.0 && targetPH < 3.0) pHEffectMultiplier = 1.25;
                else if (targetPH >= 3.0 && targetPH <= 5.0) pHEffectMultiplier = 1.10;
            }
            // Basic Vulnerability (High pH takes more Base Dmg)
            else if (card.sintesisType === 'Bes') {
                if (targetPH > 13.0) pHEffectMultiplier = 2.0;
                else if (targetPH > 12.0 && targetPH <= 13.0) pHEffectMultiplier = 1.5;
                else if (targetPH > 11.0 && targetPH <= 12.0) pHEffectMultiplier = 1.25;
                else if (targetPH >= 9.0 && targetPH <= 11.0) pHEffectMultiplier = 1.10;
            }

            if (pHEffectMultiplier > 1.0) {
                result.damageDealt = Math.floor(result.damageDealt * pHEffectMultiplier);
                result.message += ` (VULNERABLE x${pHEffectMultiplier}!)`;
            }

            // 3. Status Effects
            let newDefenderStatusEffects = [...(defender.statusEffects || [])];
            if (result.message.includes('Buta')) newDefenderStatusEffects.push({ name: 'Buta', duration: 1 });
            if (result.message.includes('Stun') || result.message.includes('Beku')) newDefenderStatusEffects.push({ name: 'Stun', duration: 1 });
            if (result.message.includes('Weakness')) newDefenderStatusEffects.push({ name: 'Weakness', duration: 2 });
            if (result.message.includes('Kering')) newDefenderStatusEffects.push({ name: 'Kering', duration: 3 });

            // 4. Apply Damage & Stats
            let newOpponentHP = defender.hp - result.damageDealt;
            let newSelfHP = attacker.hp - result.recoilDamage;

            // 5. Consume Cards
            const defenseConsumed = card.type !== 'Garam' && defendingCard.id !== 'def-0'; // Garam doesn't consume trap normally unless specified
            let newDefenderHand = result.cardGenerated ? [...defender.hand, result.cardGenerated] : defender.hand;

            // [NEW] Add Extra Card (Water)
            if (result.extraCard) {
                newDefenderHand.push(result.extraCard);
            }

            // 6. Buffer Logic (New)
            if (result.isBuffer) {
                const buffId = `buff-${Date.now()}`;
                if (!defender.activeBuffers) defender.activeBuffers = [];
                defender.activeBuffers.push({
                    id: buffId,
                    name: card.name,
                    multiplier: card.bufferMultiplier || 0.1,
                    turnsRemaining: card.bufferDuration || 3,
                    description: `Menentang perubahan pH (x${card.bufferMultiplier || 0.1})`
                });
            }

            // 7. Update State Objects
            const newAttacker = {
                ...attacker,
                hp: Math.max(0, newSelfHP),
                hand: attacker.hand.filter((_, i) => i !== index),
                currentE: attacker.currentE - attackCost,
                timbunanBuang: [...attacker.timbunanBuang, card]
            };

            const newDefender = {
                ...defender,
                hp: Math.max(0, newOpponentHP),
                trapSlot: defenseConsumed ? null : defender.trapSlot,
                hand: newDefenderHand,
                statusEffects: newDefenderStatusEffects,
                ph: Math.max(0, Math.min(14, defender.ph - (result.pHChange || 0))) // Apply pH change
            };

            return {
                ...prev,
                player1: isP1 ? newAttacker : newDefender,
                player2: !isP1 ? newAttacker : newDefender,
                gameLog: [...prev.gameLog, {
                    id: Date.now(),
                    message: `${attacker.name} serang: ${result.message}`,
                    privateMsg: "",
                    publicMsg: "",
                    actorId: attacker.id as 'player1' | 'player2',
                    turn: prev.turnNumber,
                    type: 'attack',
                    timestamp: Date.now()
                }]
            };
        });
        soundManager.playSFX('attack');
    };

    // --- SYNTHESIS LOGIC (RESTORED) ---
    const handleSynthesize = (targetCard: Card, cost: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const isP1 = prev.currentPlayer === 'player1';
            const p = isP1 ? { ...prev.player1 } : { ...prev.player2 };

            let finalECost = targetCard.eCost || 0;
            const newZone = [...p.synthesisZone];
            let catalystConsumed = false;

            // Catalyst Logic: Check Zone then Hand
            const catZoneIdx = newZone.findIndex(c => c.symbol === 'CAT');
            if (catZoneIdx !== -1) {
                newZone.splice(catZoneIdx, 1);
                finalECost = Math.max(0, finalECost - 2);
                catalystConsumed = true;
            } else {
                const catHandIdx = p.hand.findIndex(c => c.symbol === 'CAT');
                if (catHandIdx !== -1) {
                    finalECost = Math.max(0, finalECost - 2);
                    catalystConsumed = true;
                    // Will remove from hand later
                }
            }

            if (p.currentE < finalECost || p.currentM < cost) {
                onNotify({ message: `Sumber tidak mencukupi (Perlu ${finalECost}E, ${cost}M)`, type: 'error' });
                return prev;
            }

            // Consume Ingredients
            // Consume Ingredients
            let requirements = targetCard.requirements;
            // [FIX] Parse source string for recipes lacking explicit requirements (e.g., Salts)
            if (!requirements && targetCard.source) {
                const parts = targetCard.source.split(' + ');
                // Count occurrences for stoichiometry (e.g. "HCl + HCl" -> 2x HCl)
                const counts: Record<string, number> = {};
                parts.forEach(pt => counts[pt] = (counts[pt] || 0) + 1);
                requirements = Object.entries(counts).map(([element, count]) => ({ element, count }));
            }

            if (requirements) {
                requirements.forEach(req => {
                    for (let i = 0; i < (req.count || 1); i++) {
                        const idx = newZone.findIndex(c => c && (c.symbol === req.element || c.formula === req.element));
                        if (idx !== -1) newZone.splice(idx, 1);
                    }
                });
            }

            const newHand = [...p.hand];
            if (catalystConsumed && newZone.length === p.synthesisZone.length) {
                // Removed from hand
                const catHandIdx = newHand.findIndex(c => c.symbol === 'CAT');
                if (catHandIdx !== -1) newHand.splice(catHandIdx, 1);
            }

            // Add Result
            const newCard = { ...targetCard, id: `syn-${Date.now()}` };
            newHand.push(newCard);

            // [NEW] Salt Synthesis Bonus (Acid + Base -> Salt + Water)
            if (targetCard.type === 'Garam') {
                // Synthesizing a Salt usually implies Neutralization rxn logic was simulated via cost
                // Grant Water Card
                const waterCard = sintesisCards.find(c => c.id === 'sin-water');
                if (waterCard) {
                    newHand.push({ ...waterCard, id: `water-bonus-${Date.now()}` });
                    onNotify({ message: "Sintesis Garam menghasilkan produk sampingan Air!", type: 'success' });
                }
            }

            p.currentE -= finalECost;
            p.currentM -= cost;
            p.synthesisZone = newZone;
            p.hand = newHand;

            return {
                ...prev,
                player1: p,
                gameLog: [...prev.gameLog, {
                    id: Date.now(),
                    turn: prev.turnNumber,
                    message: `Sintesis berjaya: ${targetCard.name}`,
                    privateMsg: "", publicMsg: "", actorId: isP1 ? 'player1' : 'player2', type: 'synthesize', timestamp: Date.now()
                }]
            };
        });
        soundManager.playSFX('synthesize');
    };

    // --- ADVANCED AI LOGIC (Ported & Upgraded) ---
    const processAITurn = async (startState: GameState) => {
        // Deep clone to prevent direct mutation during async steps
        let activeState = JSON.parse(JSON.stringify(startState));

        // Initial Log
        activeState.gameLog.push({
            id: Date.now() + Math.random(),
            turn: activeState.turnNumber,
            message: "AI memulakan giliran...",
            privateMsg: "",
            publicMsg: "",
            actorId: 'system',
            type: 'system'
        });
        setGameState(activeState);

        // Pre-Turn Pacing Delay (Simulate Thinking at start)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const MAX_ACTIONS = 6;
        let actionCount = 0;
        let turnContinued = true;
        // User requested 4 second watchdog
        let watchdogMs = 4000;
        let endTimestamp = Date.now() + watchdogMs;

        try {
            while (turnContinued && actionCount < MAX_ACTIONS) {
                // Check Timer
                const now = Date.now();
                if (now >= endTimestamp) {
                    console.log("AI Watchdog Timeout");
                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: "AI Menamatkan Giliran (Masa Tamat).",
                        privateMsg: "",
                        publicMsg: "",
                        actorId: 'system',
                        type: 'system'
                    });
                    turnContinued = false;
                    break;
                }

                // Race Condition: AI Calculation vs Timer
                const remaining = endTimestamp - now;
                const aiPromise = OpponentAI.calculateMove(activeState);
                const timerPromise = new Promise<{ action: 'end' }>((resolve) => setTimeout(() => resolve({ action: 'end' }), remaining));

                const move: any = await Promise.race([aiPromise, timerPromise]);

                if (move.action === 'end') {
                    turnContinued = false;
                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: "AI Menamatkan Giliran.",
                        privateMsg: "",
                        publicMsg: "",
                        actorId: 'player2',
                        type: 'system'
                    });
                    break;
                }

                let isMeaningfulMove = false;

                // --- EXECUTE MOVE UPDATE STATE ---
                // We must update 'activeState' locally to reflect changes for the NEXT iteration of the loop

                if (move.action === 'synthesize' && move.card) {
                    // Logic to consume resources and add card
                    const ai = activeState.player2;
                    const recipe = move.card;

                    const hasCatalystZone = ai.synthesisZone.findIndex((c: any) => c.symbol === 'CAT');
                    let hasCatalystHand = -1;
                    let eCost = recipe.eCost || 0;

                    if (hasCatalystZone !== -1) {
                        ai.synthesisZone.splice(hasCatalystZone, 1);
                        eCost = Math.max(0, eCost - 2);
                    } else {
                        hasCatalystHand = ai.hand.findIndex((c: any) => c.symbol === 'CAT');
                        if (hasCatalystHand !== -1) {
                            ai.hand.splice(hasCatalystHand, 1);
                            eCost = Math.max(0, eCost - 2);
                        }
                    }

                    ai.currentE -= eCost;
                    ai.currentM -= (move.moleCost || 0);

                    // Ingredients Consumption
                    let requirements = recipe.requirements;
                    if (!requirements && recipe.source) {
                        const parts = recipe.source.split(' + ');
                        requirements = parts.map((p: string) => ({ element: p, count: 1 }));
                    }

                    if (requirements) {
                        requirements.forEach((req: any) => {
                            for (let i = 0; i < (req.count || 1); i++) {
                                let idx = ai.synthesisZone.findIndex((c: any) => c.symbol === req.element || c.formula === req.element);
                                if (idx !== -1) {
                                    ai.synthesisZone.splice(idx, 1);
                                } else {
                                    idx = ai.hand.findIndex((c: any) => c.symbol === req.element || c.formula === req.element);
                                    if (idx !== -1) ai.hand.splice(idx, 1);
                                }
                            }
                        });
                    }

                    const newCard = { ...recipe, id: `ai-syn-${Date.now()}-${actionCount}` };
                    ai.hand.push(newCard);

                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: `AI Sintesis: ${recipe.name}`,
                        privateMsg: "", publicMsg: "", actorId: 'player2', type: 'synthesize'
                    });

                    if (soundManager) soundManager.playSFX('synthesize');
                    isMeaningfulMove = true;

                } else if (move.action === 'attack' && move.card) {
                    const attacker = activeState.player2;
                    const defender = activeState.player1;
                    const card = move.card;
                    const defendingCard = defender.trapSlot || { id: 'def-p1', name: 'Tiada', type: 'Element', eCost: 0, mCost: 0, power: 0 };

                    const result = calculateReaction(card, defendingCard);

                    // pH Vulnerability Logic (AI)
                    let pHEffectMultiplier = 1.0;
                    const targetPH = defender.ph;
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

                    activeState.player1.hp -= result.damageDealt;
                    // Recoil logic? result.recoilDamage usually 0 for attacker unless specified

                    // Consume Card
                    activeState.player2.hand = activeState.player2.hand.filter((c: any) => c.id !== card.id);
                    // activeState.player2.currentE -= 1; // Assuming cost taken in previous logic or here? Repo had explicitly commented out cost in some places but 1E in handleAttack. Let's enforce 1E if available.
                    if (activeState.player2.currentE >= 1) activeState.player2.currentE -= 1;

                    // Consume Trap
                    const defenseConsumed = card.type !== 'Garam' && defendingCard.id !== 'def-p1';
                    if (defenseConsumed) activeState.player1.trapSlot = null;

                    // Generated Card
                    if (result.cardGenerated) {
                        activeState.player1.hand.push(result.cardGenerated);
                    }

                    // pH Change
                    if (result.pHChange) {
                        // [NEW] Trigger Animation for Player when attacked
                        const substPH = card.pH !== undefined ? card.pH : (card.sintesisType === 'Asid' ? 1.0 : (card.sintesisType === 'Bes' ? 14.0 : 7.0));
                        const { calculationData } = calculateBufferedPHChange(result.pHChange, activeState.player1.activeBuffers, substPH);

                        triggerPHAnimation(calculationData);

                        activeState.player1.ph = Math.max(0, Math.min(14, activeState.player1.ph - result.pHChange));
                    }

                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: `AI Serang: ${result.message}`,
                        privateMsg: "", publicMsg: "", actorId: 'player2', type: 'attack'
                    });

                    if (soundManager) soundManager.playSFX('attack');
                    isMeaningfulMove = true;

                } else if (move.action === 'trap' && move.card) {
                    activeState.player2.trapSlot = move.card;
                    // Remove from hand
                    activeState.player2.hand = activeState.player2.hand.filter((c: any) => c.id !== move.card.id);

                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: "AI pasang Perangkap.",
                        privateMsg: "", publicMsg: "", actorId: 'player2', type: 'trap'
                    });
                    if (soundManager) soundManager.playSFX('click');
                    isMeaningfulMove = true;

                } else if (move.action === 'draw') {
                    // Lucky Draw System for AI (Parity with Player)
                    activeState.player2.currentE -= 1;
                    activeState.player2.drawsThisTurn = (activeState.player2.drawsThisTurn || 0) + 1;

                    const rng = Math.random() * 100;
                    let drawCount = 1;
                    if (rng > 99.95) drawCount = 5;
                    else if (rng > 99.5) drawCount = 4;
                    else if (rng > 98.0) drawCount = 3;
                    else if (rng > 80.0) drawCount = 2; // Verified 18% Chance

                    const drawnCards = [];
                    for (let i = 0; i < drawCount; i++) {
                        if (activeState.player2.deck.length > 0) {
                            const newCard = activeState.player2.deck.pop();
                            if (newCard) {
                                activeState.player2.hand.push(newCard);
                                drawnCards.push(newCard);
                            }
                        }
                    }

                    let drawMsg = `AI tarik ${drawnCards.length} kad!`;
                    if (drawCount > 1) drawMsg += " (LUCKY DRAW!)";
                    if (drawCount >= 3) drawMsg += " (JACKPOT!)";

                    activeState.gameLog.push({
                        id: Date.now() + Math.random(),
                        turn: activeState.turnNumber,
                        message: drawMsg,
                        privateMsg: "", publicMsg: "", actorId: 'player2', type: 'draw'
                    });
                    isMeaningfulMove = true;
                }

                if (isMeaningfulMove) {
                    actionCount++;
                    // Reset Watchdog
                    endTimestamp = Date.now() + watchdogMs;

                    // Sync State to UI
                    setGameState({ ...activeState });

                    // Pacing Delay
                    await new Promise(resolve => setTimeout(resolve, 2500));
                } else {
                    // Try next loop or break if stuck? 
                    // If AI keeps returning non-meaningful (e.g. failed synthesis), we might loop forever without consuming time properly?
                    // The 'timerPromise' ensures we don't stall, but if calculateMove is instant and returns 'skip', we might spin.
                    // But 'calculateMove' usually returns 'end' if nothing to do.
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small safety delay
                }
            }
        } catch (e) {
            console.error("AI Loop Error", e);
        }

        // --- END OF AI TURN ---

        // 1. Turn Increment & Draw 2 Cards for BOTH
        const p1 = activeState.player1;
        const p2 = activeState.player2;

        if (p1.deck.length >= 2) {
            p1.hand.push(p1.deck.pop()!);
            p1.hand.push(p1.deck.pop()!);
        } else if (p1.deck.length === 1) {
            p1.hand.push(p1.deck.pop()!);
        }

        if (p2.deck.length >= 2) {
            p2.hand.push(p2.deck.pop()!);
            p2.hand.push(p2.deck.pop()!);
        } else if (p2.deck.length === 1) {
            p2.hand.push(p2.deck.pop()!);
        }

        // 2. Resource Regeneration (P1 gets +3 Energy & +4 Mass)
        activeState.player1.currentE = Math.min(activeState.player1.maxE, activeState.player1.currentE + 3);
        activeState.player1.currentM = Math.min(activeState.player1.maxM, activeState.player1.currentM + 4);

        // 2b. AI Passive Bonus (pH Stability check for AI before turn end)
        const aiPH = activeState.player2.ph;
        let aiBonusE = 0; let aiBonusM = 0;
        if (aiPH === 7.0) { aiBonusE = 2; aiBonusM = 2; }
        else if (aiPH >= 6.0 && aiPH <= 8.0) { aiBonusE = 1; aiBonusM = 1; }

        if (aiBonusE > 0) {
            // Apply to AI (p2)
            activeState.player2.currentE = Math.min(activeState.player2.maxE, activeState.player2.currentE + aiBonusE);
            activeState.player2.currentM = Math.min(activeState.player2.maxM, activeState.player2.currentM + aiBonusM);
            activeState.gameLog.push({
                id: Date.now() + Math.random(),
                turn: activeState.turnNumber,
                message: "AI Bonus Stabiliti pH: +" + aiBonusE + "E/M",
                privateMsg: "", publicMsg: "", actorId: 'player2', type: 'info'
            });
        }

        // (Combined above)

        // 3. Switch Turn
        activeState.currentPlayer = 'player1';
        activeState.turnNumber += 1;
        activeState.player1.drawCount = 0;
        activeState.player2.drawCount = 0;

        activeState.gameLog.push({
            id: Date.now() + Math.random(),
            turn: activeState.turnNumber,
            message: `Pusingan ${activeState.turnNumber} Bermula (+2 Kad).`,
            privateMsg: "", publicMsg: "", actorId: 'system', type: 'system'
        });

        setGameState(activeState);
        setAiThinking(false);
    };

    const [aiThinking, setAiThinking] = useState(false);

    // --- WIN CONDITION CHECK ---
    useEffect(() => {
        if (!gameState || gameState.winner) return;

        let newWinner: 'player1' | 'player2' | 'draw' | null = null;
        if (gameState.player1.hp <= 0 && gameState.player2.hp <= 0) {
            newWinner = 'draw';
        } else if (gameState.player1.hp <= 0) {
            newWinner = 'player2';
        } else if (gameState.player2.hp <= 0) {
            newWinner = 'player1';
        }

        if (newWinner) {
            setGameState(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    winner: newWinner,
                    gameLog: [...prev.gameLog, {
                        id: Date.now(),
                        message: newWinner === 'draw' ? "Seksanya Seri!" : (newWinner === 'player1' ? "Player 1 Menang!" : "AI Menang!"),
                        privateMsg: "", publicMsg: "", actorId: 'system', type: 'system', turn: prev.turnNumber, timestamp: Date.now()
                    }]
                };
            });
            if (soundManager) soundManager.playSFX(newWinner === 'player1' ? 'success' : 'error');
        }
    }, [gameState?.player1.hp, gameState?.player2.hp]); // Only re-run when HP changes

    useEffect(() => {
        if (!gameState) return;

        // Ensure strictly only runs when it's P2's turn and NOT thinking
        if (gameState.currentPlayer === 'player2' && myRole === 'player1' && !gameState.winner && !aiThinking) {

            setAiThinking(true);
            processAITurn(gameState);
        }
    }, [gameState, aiThinking, settings.apiKey]);

    return {
        gameState,
        setGameState, // Expose setter for internal overrides if needed
        myId,
        setMyId,
        myRole,
        setMyRole,
        initializeGame,
        handleCardPlay,
        handleAttack,
        handleEndTurn,
        handleDrawCard,
        handleReaction,
        handleSelfApply,
        socketStatus,
        handleJoinCustomRoom,
        handleCreateRoom,
        handleRandomMatch,
        notification,
        onNotify,
        // New Handlers
        handleDropToZone,
        handleClearSynthesis,
        handleSynthesize,
        handleMoveCardToHand,
        handleSetTrap,
        handleRecycle
    };
}
