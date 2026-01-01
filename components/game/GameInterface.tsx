'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ActiveBuffer, CalculationData, Card, GameState, Player, LogEntry, VisualEffect, ReactionResult, CardType } from '@/types';
import { calculateReaction, createDeck, initializeGame, applySaltEffect, calculateBufferedPHChange } from '@/lib/gameLogic';
import { elementCards, sintesisCards, garamCards, REACTION_LIBRARY, PH_COLOR_MAP } from '@/lib/gameData';
import { soundManager } from '@/lib/audio';
import { X, Loader2, RotateCw } from 'lucide-react';
import { useGameSettings } from '@/lib/SettingsContext';
import { GeminiService, OpponentAI } from '@/lib/ai';
import { MatchmakingService } from '@/lib/matchmaking';
import { TouchDragPolyfill } from './TouchPolyfill';

// UI Components
import { triggerPHAnimation } from '@/lib/phEvents';
import { VisualEffectsLayer } from './VisualEffectsLayer';
import { Perpustakaan } from './Perpustakaan';
import { MainMenu, Lobby } from './Menus';
import { PauseMenu, TutorialModal, AskChemistModal, ProfileSelector, SettingsModal } from './Modals';
import { GameHeader } from './layout/GameHeader';
import { GameSidebar } from './layout/GameSidebar';
import { OpponentZone } from './layout/OpponentZone';
import { PlayerZone } from './layout/PlayerZone';

export default function GameInterface() {
    const { settings } = useGameSettings();

    // App State
    const [appState, setAppState] = useState<'menu' | 'lobby' | 'game' | 'pvp'>('menu');
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [showProfileSelector, setShowProfileSelector] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Game State
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [myRole, setMyRole] = useState<'player1' | 'player2'>('player1'); // Host is always player1 initially

    // UI State
    const [paused, setPaused] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showAskChemist, setShowAskChemist] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
    const [lobbyError, setLobbyError] = useState<string>('');

    // Refs for AI/Subscriptions
    const channelRef = useRef<any>(null);

    // --- MOBILE SCALING LOGIC ---
    // Fixed height anchor (Design Reference)
    const BASE_HEIGHT = 768;

    // Dynamic dimensions state
    const [dimensions, setDimensions] = useState({ width: 1366, height: BASE_HEIGHT });
    const [scale, setScale] = useState(1);
    const [isNarrow, setIsNarrow] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;

            // 1. Calculate Aspect Ratio
            const currentRatio = w / h;
            // Use Game Interface Base Width (1366) as the threshold
            const narrow = w < 1366;
            setIsNarrow(narrow);
            // Ultrawide: 21:9 ≈ 2.33

            // 2. Determine Target Base Width
            let targetBaseWidth = BASE_HEIGHT * currentRatio;

            // 3. Clamp constraints
            // Min: 1366 (Standard 16:9) - Don't squish elements
            // Max: 1792 (approx 21:9) - Don't let it get too wide or UI breaks
            targetBaseWidth = Math.max(1366, Math.min(targetBaseWidth, 1800));

            setDimensions({ width: targetBaseWidth, height: BASE_HEIGHT });

            // 4. Calculate Scale
            // Determine scale factor needed to fit this new Target Box into the actual Window
            // Since we matched the ratio (mostly), specific dimension scale should align.
            // We use the 'contain' logic but with our custom width.
            const scaleX = w / targetBaseWidth;
            const scaleY = h / BASE_HEIGHT;

            // Use the smaller scale to ensure it fits (safeguard), though they should be close.
            setScale(Math.min(scaleX, scaleY));
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- AUDIO ---
    useEffect(() => {
        soundManager.setMasterVolume(settings.masterVolume);
        soundManager.setBGMVolume(settings.bgmVolume);
        soundManager.setSFXVolume(settings.sfxVolume);
        if (appState === 'menu') soundManager.playBGM('menu');
        else if (appState === 'game' || appState === 'pvp') soundManager.playBGM('battle');
        else soundManager.stopBGM();
    }, [appState, settings.masterVolume, settings.bgmVolume, settings.sfxVolume]);

    // --- INITIALIZATION ---
    useEffect(() => {
        const savedProfile = localStorage.getItem('kimia_profile');
        if (savedProfile) {
            try { setCurrentProfile(JSON.parse(savedProfile)); } catch (e) { }
        } else {
            // Guest Profile
            setCurrentProfile({
                id: `guest-${Math.floor(Math.random() * 10000)}`,
                name: `Tetamu${Math.floor(Math.random() * 100)}`,
                wins: 0,
                losses: 0,
                isGuest: true
            });
        }
    }, []);

    const handleStartGame = (mode: 'pve' | 'pvp') => {
        soundManager.playSFX('start');
        if (mode === 'pve') {
            const newState = initializeGame(currentProfile?.name || 'Pemain', 'AI Opponent');
            setGameState(newState);
            setMyRole('player1');
            setAppState('game');
        } else {
            if (!currentProfile || currentProfile.isGuest) {
                setNotification({ message: 'Sila Log Masuk untuk bermain dalam talian.', type: 'info' });
                // Optional: Flash the login button or show a modal?
                // For now, notification is enough or we could redirect if we had a router here.
                return;
            }
            setAppState('lobby');
        }
    };

    // --- MATCHMAKING & REALTIME ---
    const connectToMatch = async (roomCode: string, role: 'player1' | 'player2') => {
        setRoomId(roomCode);
        setMyRole(role);
        setSocketStatus('connected');
        setLobbyError('');

        // Clean existing
        if (channelRef.current) supabase.removeChannel(channelRef.current);

        const channel = supabase.channel(`game:${roomCode} `, {
            config: {
                broadcast: { self: true }
            }
        });

        channel
            .on('broadcast', { event: 'game_state_update' }, (payload) => {
                if (payload.payload) {
                    setGameState(payload.payload);
                    setAppState('pvp');
                }
            })
            .on('broadcast', { event: 'action_request' }, (payload) => {
                // Only HOST (Player 1) processes requests
                if (role === 'player1') {
                    handleRemoteAction(payload.payload);
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to room ${roomCode} as ${role} `);
                    // If Host, initialize and broadcast start
                    if (role === 'player1') {
                        const newState = initializeGame(currentProfile?.name || 'Host', 'Lawan');
                        setGameState(newState);
                        setAppState('pvp');
                        channel.send({ type: 'broadcast', event: 'game_state_update', payload: newState });
                    }
                } else {
                    setSocketStatus('disconnected');
                    setLobbyError('Connection failure.');
                }
            });

        channelRef.current = channel;
    };

    // Handle incoming action from Guest (executed on Host)
    const handleRemoteAction = (action: any) => {
        if (!gameState) return;

        let newState = { ...gameState };
        const p2Name = 'Lawan';

        // Helper to update state safely
        const updateAndSync = (state: GameState, logMsg: string) => {
            const newLog: LogEntry = {
                id: Date.now(),
                message: logMsg,
                turn: state.turnNumber,
                privateMsg: logMsg,
                publicMsg: logMsg,
                actorId: 'player2',
                type: 'info'
            };
            state.gameLog = [...state.gameLog, newLog];
            setGameState(state);
            channelRef.current?.send({ type: 'broadcast', event: 'game_state_update', payload: state });
        };

        if (action.type === 'draw') {
            if (gameState.currentPlayer !== 'player2') return;
            if (newState.player2.deck.length > 0 && newState.player2.currentE >= 1) {
                const card = newState.player2.deck.pop()!;
                newState.player2.hand.push(card);
                newState.player2.currentE -= 1;
                updateAndSync(newState, `${p2Name} menarik kad(-1E).`);
            }
        }
        else if (action.type === 'endTurn') {
            if (gameState.currentPlayer !== 'player2') return;
            newState.player2.currentE = Math.min(newState.player2.maxE, newState.player2.currentE + 2);
            newState.player2.currentM = Math.min(newState.player2.maxM, newState.player2.currentM + 1);
            newState.currentPlayer = 'player1';
            newState.turnNumber += 1;
            updateAndSync(newState, `Giliran tamat.Giliran ${newState.player1.name}.`);
        }
        else if (action.type === 'attack') {
            if (gameState.currentPlayer !== 'player2') return;
            const { card, index } = action.payload;

            const actualCard = newState.player2.hand.find(c => c.id === card.id);
            if (!actualCard) return;

            const defender = newState.player1;
            const defendingCard = defender.trapSlot || { id: 'def-p1', name: 'Tiada', type: 'Element', formula: 'None', description: 'Tiada pertahanan', eCost: 0, mCost: 0, power: 0 };
            const result = calculateReaction(actualCard, defendingCard);

            newState.player1.hp -= result.damageDealt;
            newState.player1.trapSlot = result.message.includes('PERANGKAP') ? null : newState.player1.trapSlot;

            newState.player2.hand = newState.player2.hand.filter(c => c.id !== actualCard.id);
            newState.player2.currentE -= (actualCard.eCost || 0);

            updateAndSync(newState, `${p2Name} menyerang! ${result.message} `);
            addVisualEffect('damage', result.damageDealt, result.message);
        }
    };

    const sendAction = (type: string, payload?: any) => {
        if (appState === 'game') return;

        if (myRole === 'player1') {
            // Host logic handled locally
        } else {
            channelRef.current?.send({
                type: 'broadcast',
                event: 'action_request',
                payload: { type, payload }
            });
        }
    };

    // --- LOBBY ACTIONS ---
    const handleCreateRoom = async (code: string) => {
        if (!currentProfile) return;
        const { data, error } = await MatchmakingService.createRoom(currentProfile.id, code);
        if (error) { setLobbyError(error); return; }
        if (data) connectToMatch(data.room_code, 'player1');
    };

    const handleJoinCustomRoom = async (code: string) => {
        if (!currentProfile) return;
        const { data, error } = await MatchmakingService.joinRoom(currentProfile.id, code);
        if (error) { setLobbyError(error); return; }
        if (data) connectToMatch(data.room_code, 'player2');
    };

    const handleRandomMatch = async () => {
        if (!currentProfile) return;
        const { data, role, error } = await MatchmakingService.findRandomMatch(currentProfile.id);
        if (error) { setLobbyError(JSON.stringify(error)); return; }
        if (data) connectToMatch(data.room_code, role);
    };

    // --- HELPERS ---
    const createLog = (turn: number, privateMsg: string, publicMsg?: string, actorId: 'player1' | 'player2' | 'system' = 'system', type: any = 'info', calculation?: string, calculationData?: CalculationData): LogEntry => {
        return {
            id: Date.now() + Math.random(),
            turn,
            privateMsg,
            publicMsg: publicMsg || privateMsg, // Default to same if not hidden
            actorId,
            type,
            calculation,
            calculationData,
            message: privateMsg // Legacy support
        };
    };

    const addVisualEffect = (type: VisualEffect['type'], value: number | string, desc: string, pos?: { x: number, y: number }) => {
        const effect: VisualEffect = { id: Date.now(), type, value, description: desc, position: pos || { x: 50, y: 50 }, duration: 1000 };
        setGameState(prev => prev ? { ...prev, activeVisualEffects: [...prev.activeVisualEffects, effect] } : null);
        setTimeout(() => setGameState(prev => prev ? { ...prev, activeVisualEffects: prev.activeVisualEffects.filter(e => e.id !== effect.id) } : null), 1000);
    };

    const syncState = (newState: GameState) => {
        setGameState(newState);
        if (appState === 'pvp' && channelRef.current && myRole === 'player1') {
            channelRef.current.send({ type: 'broadcast', event: 'game_state_update', payload: newState });
        }
    };

    const endGame = (win: boolean) => {
        addVisualEffect(win ? 'info' : 'damage', 0, win ? 'MENANG!' : 'KALAH!', { x: 50, y: 50 });
        soundManager.playSFX(win ? 'success' : 'error');
        if (currentProfile) supabase.from('profiles').update(win ? { wins: currentProfile.wins + 1 } : { losses: currentProfile.losses + 1 }).eq('id', currentProfile.id).then();
        setTimeout(() => { setAppState('menu'); setGameState(null); }, 5000);
    };

    const handleQuitGame = () => {
        setAppState('menu'); setGameState(null); setRoomId(null);
        if (channelRef.current) supabase.removeChannel(channelRef.current);
    };

    // --- NOTIFICATION TIMEOUT ---
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 2500); // 2.5s duration
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- GAME HANDLERS ---

    // Draw
    const handleDrawCard = () => {
        if (!gameState) return;
        // If local PVE or Host P1
        if (myRole === 'player1') {
            if (gameState.currentPlayer !== 'player1') return;
            const player = gameState.player1;
            const currentDraws = player.drawsThisTurn || 0;

            if (currentDraws >= 3) {
                setNotification({ message: 'Had tarik kad dicapai (3/3 kali).', type: 'error' });
                return;
            }

            if (player.currentE < 1 || player.deck.length === 0) {
                setNotification({ message: 'Gagal menarik kad.', type: 'error' });
                return;
            }
            const newDeck = [...player.deck];
            const newHand = [...player.hand, newDeck.pop()!];

            const newState = {
                ...gameState,
                player1: {
                    ...player,
                    hand: newHand,
                    deck: newDeck,
                    currentE: player.currentE - 1,
                    drawsThisTurn: currentDraws + 1
                }
            };
            const log = createLog(gameState.turnNumber, `Anda menarik kad baru.`, `Lawan menarik kad.`, 'player1', 'draw');
            const newStateWithLog = { ...newState, gameLog: [...gameState.gameLog, log] };

            soundManager.playSFX('click');
            syncState(newStateWithLog);
        } else {
            sendAction('draw');
        }
    };

    const handleEndTurn = () => {
        if (!gameState) return;
        if (myRole === 'player1') {
            if (gameState.currentPlayer !== 'player1') return;
            const newPlayer1 = {
                ...gameState.player1,
                // Deck and Hand unchanged here (handled in processAITurn on turn increment)
                currentE: Math.min(gameState.player1.maxE, gameState.player1.currentE + 2),
                currentM: Math.min(gameState.player1.maxM, gameState.player1.currentM + 1),
                // Reset counters
                drawsThisTurn: 0
            };

            // --- PASSIVE RESOURCE BONUS (pH Stability) ---
            // "if ph is perfectly neutral (7.0) ... +2 E and +2 M"
            // "if around 6 to 8 excluding 7 ... +1 E and +1 M"
            let bonusE = 0;
            let bonusM = 0;
            let bonusMsg = '';

            const currentPH = gameState.player1.ph;

            if (currentPH === 7.0) {
                bonusE = 2;
                bonusM = 2;
                bonusMsg = 'Stabiliti pH Sempurna (7.0): Bonus +2 E & +2 M!';
            } else if (currentPH >= 6.0 && currentPH <= 8.0) {
                bonusE = 1;
                bonusM = 1;
                bonusMsg = 'Stabiliti pH Baik: Bonus +1 E & +1 M.';
            }

            if (bonusE > 0) {
                newPlayer1.currentE = Math.min(newPlayer1.maxE, newPlayer1.currentE + bonusE);
                newPlayer1.currentM = Math.min(newPlayer1.maxM, newPlayer1.currentM + bonusM);
                setNotification({ message: bonusMsg, type: 'success' });
            }
            // ---------------------------------------------
            const newPlayer2 = {
                ...gameState.player2,
                drawsThisTurn: 0 // Reset counter
            };

            const newState = {
                ...gameState,
                player1: newPlayer1,
                player2: newPlayer2,
                currentPlayer: 'player2' as const,
                turnNumber: gameState.turnNumber
                // Existing code: turnNumber: gameState.turnNumber.
                // Wait, existing code `processAITurn` increments turnNumber (line 476).
                // So P1 end turn -> P2 turn (same number or +0.5?).
                // If `processAITurn` increments it, then current flow is P1->AI(inc)->P1.
                // If I draw 2 on P1 End Turn, that happens before AI plays? Or does user mean "Start of Turn"?
                // "When each time turn counter increase both player get 2 card".
                // If AI increments it, that's when it should happen?
                // But if AI is logic, we control logic here.
                // Let's implement it here as "End of Round" or "Start of Next Turn".
                // Since AI is immediate-response here (PVE), maybe we do it at `processAITurn` completion (Start of P1 turn again)?
                // User: "turn counter increase... both player get 2".
                // My AI logic increments turn number at end of AI turn (line 476). So Start of P1 Turn.
                // But wait, what if P1 passes to P2? Does turn counter increase?
                // Current code: `GameInterface` line 301: `turnNumber: gameState.turnNumber` (No change).
                // So currently turn number ONLY increments when AI finishes.
                // So I should implement the "Draw 2" logic inside `processAITurn` right before `syncState`.
                // BUT, user assumes P1->P2 is a turn?
                // "Turn Counter" is visible.
                // Let's put logic in `processAITurn` for easier management if that's where increment happens.
                // Wait, looking at `handleEndTurn`: it prepares state for P2.
                // The prompt "When each time turn counter increase".
                // I will implement "Both Draw 2" where `turnNumber` actually changes.
                // That is in `processAITurn` (line 476 in original, likely similar now).
                // Let's check `processAITurn`.
            };
            // Reset Logic: If I verify `processAITurn` handles increment, I should put Draw 2 THERE.
            // BUT `handleEndTurn` sets `drawsThisTurn = 0` for P1's NEXT turn is debatable.
            // Let's stick to the "Draw Limit" logic changes first here in `handleEndTurn` (resetting counters).
            // Actually, if I reset here, P1 starts next turn with 0. Correct.

            // Wait, I will modify `handleEndTurn` to reset P1's count.
            // Use `processAITurn` to Draw Cards? Or `handleEndTurn`?
            // User said: "turn counter increase".
            // Let's assume Turn Increment = Start of New Round (P1 Turn).
            // So `processAITurn` is the place.
            // I will do that in a separate chunk. Here I focus on `handleDrawCard` limit and UI.

            const log = createLog(gameState.turnNumber, `Giliran tamat.`, `Lawan menamatkan giliran.`, 'player1', 'system');
            const newStateWithLog = { ...newState, gameLog: [...gameState.gameLog, log] };

            syncState(newStateWithLog);
            if (appState === 'game') setTimeout(() => processAITurn(newState), 1500);
        } else {
            sendAction('endTurn');
        }
    };

    const handleMoveCardToZone = (card: Card, source: 'hand' | 'synthesisZone', index: number) => {
        if (!gameState) return;
        if (myRole === 'player1') {
            const player = gameState.player1;
            if (source === 'hand') {
                const newHand = [...player.hand];
                newHand.splice(index, 1);
                const newZone = [...player.synthesisZone, card];
                const log = createLog(gameState.turnNumber, `Anda memindahkan ${card.name} ke zon sintesis.`, `Pemain memindahkan kad ke zon sintesis.`, 'player1', 'moveCard');
                const newState = { ...gameState, player1: { ...player, hand: newHand, synthesisZone: newZone }, gameLog: [...gameState.gameLog, log] };
                soundManager.playSFX('click');
                syncState(newState);
            }
        }
    };

    const handleMoveCardToHand = (index: number) => {
        if (!gameState) return;
        if (myRole === 'player1') {
            const player = gameState.player1;
            const newZone = [...player.synthesisZone];
            const card = newZone[index];
            newZone.splice(index, 1);
            const newState = { ...gameState, player1: { ...player, synthesisZone: newZone, hand: [...player.hand, card] }, gameLog: [...gameState.gameLog, createLog(gameState.turnNumber, `Anda memindahkan ${card.name} ke tangan.`, `Pemain memindahkan kad ke tangan.`, 'player1', 'moveCard')] };
            soundManager.playSFX('click');
            syncState(newState);
        }
    };

    const handleSetTrap = (card: Card, source: 'hand', index: number) => {
        if (!gameState) return;
        if (myRole === 'player1') {
            const player = gameState.player1;
            if (player.trapSlot) {
                setNotification({ message: 'Slot pertahanan penuh!', type: 'error' });
                return;
            }
            // NEW RULE: Taktikal / Defense placement is FREE (0 E).
            // But we still ensure player isn't in negative (though unlikely to block unless debuffed below 0).
            // Actually, user said: "inserting the card into slot pertahanan dont requied any E point".
            // So we just allow it.

            const newHand = [...player.hand];
            newHand.splice(index, 1);
            const log = createLog(gameState.turnNumber, `${player.name} pasang Perangkap / Pertahanan.`, `${player.name} pasang Perangkap / Pertahanan.`, 'player1', 'trap');
            // NO E deduction here
            const newState = { ...gameState, player1: { ...player, hand: newHand, trapSlot: card }, gameLog: [...gameState.gameLog, log] };
            soundManager.playSFX('click');
            syncState(newState);
        }
    };

    const handleRecycleCard = (card: Card, source: 'hand', index: number) => {
        if (!gameState) return; // P2 recycle not implemented remote yet
        if (myRole === 'player1') {
            const player = gameState.player1;
            const newHand = [...player.hand];
            const recycled = newHand.splice(index, 1)[0];
            const energyGain = (recycled.type === 'Sintesis' || recycled.type === 'Garam') ? 3 : 1;
            const log = createLog(gameState.turnNumber, `${player.name} kitar semula ${recycled.name}.`, `${player.name} kitar semula kad.`, 'player1', 'recycle', ` + ${energyGain} E`);
            const newState = { ...gameState, player1: { ...player, hand: newHand, currentE: Math.min(player.maxE, player.currentE + energyGain), timbunanBuang: [...player.timbunanBuang, recycled] }, gameLog: [...gameState.gameLog, log] };
            soundManager.playSFX('click');
            syncState(newState);
        }
    };

    const handleSynthesize = (targetCard: Card, cost: number) => {
        if (!gameState) return;
        if (myRole === 'player1') {
            const player = gameState.player1;
            let finalECost = targetCard.eCost || 0;
            const newZone = [...player.synthesisZone];
            let catalystConsumed = false;

            // Check Zone for Catalyst
            const catZoneIdx = newZone.findIndex(c => c.symbol === 'CAT');
            if (catZoneIdx !== -1) {
                newZone.splice(catZoneIdx, 1);
                finalECost = Math.max(0, finalECost - 2);
                catalystConsumed = true;
            } else {
                // Check Hand for Catalyst if not in Zone
                const catHandIdx = player.hand.findIndex(c => c.symbol === 'CAT');
                if (catHandIdx !== -1) {
                    // We will remove from hand later when creating newPlayer
                    finalECost = Math.max(0, finalECost - 2);
                    catalystConsumed = true;
                    // Need to track this to remove from hand below
                }
            }

            // Calculate consumption
            let requirements = targetCard.requirements;
            if (!requirements && targetCard.source) {
                const parts = targetCard.source.split(' + ');
                requirements = parts.map(p => ({ element: p, count: 1 }));
            }

            // Validation: Check E and M
            if (player.currentE < finalECost) {
                setNotification({ message: `Tenaga tidak mencukupi! Perlu ${finalECost} E, ada ${player.currentE} E.`, type: 'error' });
                return;
            }
            if (player.currentM < cost) {
                setNotification({ message: `Jisim tidak mencukupi! Perlu ${cost} M, ada ${player.currentM} M.`, type: 'error' });
                return;
            }

            // const newZone = [...player.synthesisZone]; // Moved up
            if (requirements) {
                requirements.forEach(req => {
                    for (let i = 0; i < (req.count || 1); i++) {
                        const idx = newZone.findIndex(c => c.symbol === req.element || c.formula === req.element);
                        if (idx !== -1) newZone.splice(idx, 1);
                    }
                });
            }

            const newPlayer = { ...player };
            if (catalystConsumed && newZone.length === player.synthesisZone.length) {
                // Means we didn't remove from Zone (length unchanged), so must have been in Hand
                const catHandIdx = newPlayer.hand.findIndex(c => c.symbol === 'CAT');
                if (catHandIdx !== -1) newPlayer.hand.splice(catHandIdx, 1);
            }
            newPlayer.currentE -= finalECost;
            newPlayer.currentM -= cost;
            newPlayer.synthesisZone = newZone; // Update with filtered zone

            const newCard = { ...targetCard, id: `syn-${Date.now()}` };
            newPlayer.hand.push(newCard);
            const log = createLog(gameState.turnNumber, `${player.name} sintesis ${targetCard.name}!`, `${player.name} sintesis kad baru!`, 'player1', 'synthesize');
            const newState = { ...gameState, player1: newPlayer, gameLog: [...gameState.gameLog, log] };

            addVisualEffect('synthesis', 0, 'SINTESIS!', { x: 50, y: 50 });
            soundManager.playSFX('synthesize');
            syncState(newState);
        }
    };

    const handleTrapSet = (card: Card, source: string, index: number) => {
        if (!gameState || myRole !== gameState.currentPlayer) return;

        // Validation done in component drop logic, but double check type
        if (card.type !== 'Sintesis' && card.type !== 'Garam') {
            setNotification({ type: 'error', message: "Hanya Sintesis atau Garam boleh dijadikan pertahanan." });
            return;
        }

        const newState = { ...gameState };
        const player = newState.currentPlayer === 'player1' ? newState.player1 : newState.player2;

        // If slot occupied, prevent (or replace logic if desired, but user said 'keep until used')
        if (player.trapSlot) {
            setNotification({ type: 'error', message: "Slot Pertahanan Penuh!" });
            return;
        }

        // Place card
        player.trapSlot = card;

        // Remove from hand
        player.hand.splice(index, 1);
        // player.currentE -= (card.eCost || 0); // REMOVED cost for defense

        const log = createLog(gameState.turnNumber, `${player.name} memasang Pertahanan.`, `${player.name} memasang Pertahanan.`, gameState.currentPlayer, 'trap', card.type === 'Garam' ? 'Garam' : 'Sintesis');
        newState.gameLog = [...newState.gameLog, log];

        soundManager.playSFX('click');
        syncState(newState);
    };

    const handleAttack = (card: Card, index: number) => {
        if (!gameState) return;
        if (myRole === 'player1') {
            if (gameState.currentPlayer !== 'player1') return;
            const attacker = gameState.player1;
            const defender = gameState.player2;
            const defendingCard = defender.trapSlot || { id: 'def-0', name: 'Tiada', type: 'Neutral', description: '', eCost: 0, mCost: 0, power: 0 } as any;

            const attackCost = 1; // "attacking requied 1 E point at leats"

            if (attacker.currentE < attackCost) {
                setNotification({ message: `Tenaga tidak mencukupi untuk menyerang! Perlu 1 E.`, type: 'error' });
                return;
            }

            let result: ReactionResult;
            if (card.type === 'Garam') {
                result = applySaltEffect(card);
            } else {
                result = calculateReaction(card, defendingCard);
            }

            // --- pH DAMAGE MULTIPLIER (Active Vulnerability) ---
            let pHEffectMultiplier = 1.0;
            const targetPH = defender.ph;

            // Acidic Vulnerability (Low pH takes more Acid Dmg)
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
            // ---------------------------------------------------

            let newOpponentHP = defender.hp - result.damageDealt;
            let newSelfHP = attacker.hp - result.recoilDamage;

            // Status Effects Logic
            let newDefenderStatusEffects = [...(defender.statusEffects || [])];
            if (result.message.includes('Buta')) newDefenderStatusEffects.push({ name: 'Buta', duration: 1 });
            if (result.message.includes('Stun') || result.message.includes('Beku')) newDefenderStatusEffects.push({ name: 'Stun', duration: 1 });
            if (result.message.includes('Weakness')) newDefenderStatusEffects.push({ name: 'Weakness', duration: 2 });
            if (result.message.includes('Kering')) newDefenderStatusEffects.push({ name: 'Kering', duration: 3 });

            // Logic: If defense card existed (id != def-0) AND it was a reaction (NOT Garam play), it is consumed.
            const defenseConsumed = card.type !== 'Garam' && defendingCard.id !== 'def-0';

            // Logic: If reaction produced a card (Salt), defender gets it.
            const newDefenderHand = result.cardGenerated ? [...defender.hand, result.cardGenerated] : defender.hand;

            // NEW RULE: Attack consumes 1 E.
            // Also Card is consumed (played from hand).
            const newAttacker = {
                ...attacker,
                hp: Math.max(0, newSelfHP),
                hand: attacker.hand.filter((_, i) => i !== index),
                currentE: attacker.currentE - attackCost, // Deduct 1 E
                timbunanBuang: [...attacker.timbunanBuang, card]
            };
            const newDefender = {
                ...defender,
                hp: Math.max(0, newOpponentHP),
                trapSlot: defenseConsumed ? null : defender.trapSlot,
                hand: newDefenderHand,
                statusEffects: newDefenderStatusEffects
            };

            if (result.cardGenerated) {
                const log = createLog(gameState.turnNumber, `REAKSI HASILKAN: ${result.cardGenerated.name}!`, `REAKSI HASILKAN: ${result.cardGenerated.name}!`, 'system', 'info', `+1 Kad ke tangan ${defender.name}`);
                gameState.gameLog = [...gameState.gameLog, log];
            }

            let calcLogString = '';
            let calcData: CalculationData | null = null;
            let finalPHChange = result.pHChange || 0;

            // HANDLE BUFFER ACTIVATION (Target: Defender or Attacker? Usually Defensive Buffers on Defender, but logic says Card Effect. Buffer cards usually 'Sintesis' placed on field? Or executed? Card.type is 'Sintesis' or 'Garam'. If it's a buffer, it helps owner?
            // "Menentang perubahan pH". If I play it, it protects ME.
            // But handleAttack is "I attack YOU". 
            // If Result.isBuffer, is it a defensive Reaction from Trap? 
            // Or is it a Salt produced that gives Buffer?
            // If Attacker attacks, and result is Buffer...
            // Let's assume Buffer is a status on the DEFENDER (who survived/reacted?).
            // Actually, if I play "Garam Buffer", I want it on ME.
            // But handleAttack is primarily Attack.
            // Let's look at Game Logic: "Buffer activated" usually from specific cards.
            // If I attack, and result says "Buffer", maybe I gained it?
            // For now, let's attach Buffer to DEFENDER if it's a defensive reaction, or ATTACKER if it's a self-buff?
            // Simplified: Attach to Defender for now (Reaction-based).

            let newDefenderBuffers = [...(defender.activeBuffers || [])];
            if (result.isBuffer) {
                const buffId = `buff-${Date.now()}`;
                newDefenderBuffers.push({
                    id: buffId,
                    name: card.name,
                    multiplier: card.bufferMultiplier || 0.1,
                    turnsRemaining: card.bufferDuration || 3,
                    description: `Menentang perubahan pH (x${card.bufferMultiplier || 0.1})`
                });
                gameState.gameLog.push(createLog(gameState.turnNumber, `BUFFER DIAKTIFKAN: ${card.name}`, `BUFFER DIAKTIFKAN: ${card.name}`, 'player2', 'info'));
            }

            // CALCULATE PH CHANGE WITH BUFFERS (For Defender)
            if (finalPHChange !== 0) {
                // If it's a direct attack, we use the Card pH if available for log, else fallback
                const attackingSubstancePH = card.pH !== undefined ? card.pH : (card.sintesisType === 'Asid' ? 1.0 : 14.0); // Rough fallback if undefined
                const bufferedCalc = calculateBufferedPHChange(finalPHChange, newDefenderBuffers, attackingSubstancePH);

                // Subtract the Delta from Current pH for the Final Result Logic?
                // `calculateReaction` returns positive delta for Acid (6.5). If we subtract 6.5 from 7.0 -> 0.5.
                // WE MUST SUBTRACT.
                // But `finalPHChange` from calculateReaction is 6.5?
                // Let's verify calculateReaction: returns `7.0 - substancePH` (e.g. 6.5).
                // So here we should use `current - bufferedChange`.

                finalPHChange = bufferedCalc.finalChange;
                calcLogString = bufferedCalc.calculationSteps.join('\n');
                calcData = bufferedCalc.calculationData;

                // We want to show the FINAL pH in step 4 of ActiveCalculation
                const predictedPH = Math.max(0, Math.min(14, defender.ph - finalPHChange));
                calcData.finalResult = `pH Akhir = ${predictedPH.toFixed(2)}`;
            }

            const mainLog = createLog(
                gameState.turnNumber,
                card.type === 'Garam' ? `GARAM: ${result.message}` : `REAKSI: ${result.message}`,
                card.type === 'Garam' ? `GARAM: ${result.message}` : `REAKSI: ${result.message}`,
                'player1',
                'attack',
                calcLogString,
                calcData || undefined
            );

            // New pH Logic: SUBTRACT the Delta
            const newPH = Math.max(0, Math.min(14, defender.ph - finalPHChange));

            const newState = {
                ...gameState,
                player1: newAttacker,
                player2: {
                    ...newDefender,
                    activeBuffers: newDefenderBuffers,
                    ph: newPH
                },
                gameLog: [...gameState.gameLog, mainLog]
            };

            if (calcData) triggerPHAnimation(calcData); // Show animation
            addVisualEffect(result.effectType || 'damage', result.damageDealt, result.message, { x: 75, y: 30 });
            soundManager.playSFX('attack');
            syncState(newState);
            if (newDefender.hp <= 0) endGame(true);
            else if (newAttacker.hp <= 0) endGame(false);
        } else {
            sendAction('attack', { card, index });
        }
    };

    const handleSelfApply = (card: Card, source: string, index: number) => {
        if (!gameState) return;
        if (myRole !== 'player1') return; // Only local/host can self-apply for now

        const player = gameState.player1;

        // 1. Calculate Delta Logic: 7.0 - pH
        // If card.pH is undefined, use fallback based on type
        const substPH = card.pH !== undefined ? card.pH : (card.sintesisType === 'Asid' ? 1.0 : (card.sintesisType === 'Bes' ? 14.0 : 7.0));
        const rawDelta = 7.0 - substPH;

        // 2. Buffer Calculation (Self)
        const bufferedCalc = calculateBufferedPHChange(rawDelta, player.activeBuffers, substPH);
        const finalDelta = bufferedCalc.finalChange;

        // 3. Apply: Current - Delta
        const newPH = Math.max(0, Math.min(14, player.ph - finalDelta));

        // 4. Update Steps for UI
        const finalCalculationData = {
            ...bufferedCalc.calculationData,
            finalResult: `pH Akhir = ${newPH.toFixed(2)}`
        };

        // Remove Card Logic
        const newHand = [...player.hand];
        const newSynthesisZone = [...player.synthesisZone];

        if (source === 'hand') {
            newHand.splice(index, 1);
        } else if (source === 'synthesisZone') {
            newSynthesisZone.splice(index, 1);
        }

        // Add Log
        const log = createLog(
            gameState.turnNumber,
            `RAWAT DIRI: ${card.name} digunakan.`,
            `Pemain merawat diri dengan ${card.name}.`,
            'player1',
            'info',
            bufferedCalc.calculationSteps.join('\n'),
            finalCalculationData
        );

        const newState = {
            ...gameState,
            player1: {
                ...player,
                hand: newHand,
                synthesisZone: newSynthesisZone,
                ph: newPH
            },
            gameLog: [...gameState.gameLog, log]
        };

        triggerPHAnimation(finalCalculationData); // Via Event Bus
        addVisualEffect('heal', 0, 'pH Update', { x: 20, y: 80 });
        soundManager.playSFX('synthesize'); // Use synthesize sound for "Use"
        syncState(newState);
    };

    // --- AI LOGIC ---
    const processAITurn = async (currentState: GameState) => {
        // Safe deep clone to prevent reference issues during the loop
        let activeState = JSON.parse(JSON.stringify(currentState));

        const startLog = createLog(activeState.turnNumber, "AI memulakan giliran...", "AI memulakan giliran...", 'system');
        activeState.gameLog.push(startLog);
        syncState(activeState);

        try {
            let endTimestamp = Date.now() + 8000; // Strict 8-second timer
            let turnContinued = true;
            let actionCount = 0;
            const MAX_ACTIONS = 6;

            while (turnContinued && actionCount < MAX_ACTIONS) {
                const remaining = endTimestamp - Date.now();
                if (remaining <= 0) break; // Hard stop

                // @ts-ignore
                const aiPromise = OpponentAI.calculateMove(activeState);
                const timeoutPromise = new Promise<{ action: 'end' }>((resolve) => setTimeout(() => resolve({ action: 'end' }), remaining));

                const move = await Promise.race([aiPromise, timeoutPromise]);
                if (move.action === 'end') {
                    turnContinued = false;
                    const endLog = createLog(activeState.turnNumber, "AI Menamatkan Giliran (Timer/End).", "AI Menamatkan Giliran.", 'player2', 'system');
                    activeState.gameLog.push(endLog);
                    break;
                }

                // Check Timer


                let isMeaningfulMove = false; // Flag to check if we reset timer

                if (move.action === 'synthesize' && move.card) {
                    const recipe = move.card;
                    const ai = activeState.player2;

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

                    const log = createLog(activeState.turnNumber, `AI Sintesis: ${recipe.name}`, `AI Sintesis: ${recipe.name}`, 'player2', 'synthesize');
                    activeState.gameLog.push(log);

                    soundManager.playSFX('synthesize');
                    addVisualEffect('synthesis', 0, 'AI SINTESIS!', { x: 25, y: 30 });
                    actionCount++;
                    isMeaningfulMove = true;

                } else if (move.action === 'attack' && move.card) {
                    const attacker = activeState.player2; const defender = activeState.player1; const card = move.card;
                    const defendingCard = defender.trapSlot || { id: 'def-p1', name: 'Tiada', type: 'Element', description: '' } as any;
                    const result = calculateReaction(card, defendingCard);

                    // --- pH DAMAGE MULTIPLIER (AI Attack) ---
                    let pHEffectMultiplier = 1.0;
                    const targetPH = activeState.player1.ph; // Player 1 is defender

                    if (card.sintesisType === 'Asid') {
                        if (targetPH < 1.0) pHEffectMultiplier = 2.0;
                        else if (targetPH >= 1.0 && targetPH < 2.0) pHEffectMultiplier = 1.5;
                        else if (targetPH >= 2.0 && targetPH < 3.0) pHEffectMultiplier = 1.25;
                        else if (targetPH >= 3.0 && targetPH <= 5.0) pHEffectMultiplier = 1.10;
                    }
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
                    // ----------------------------------------

                    activeState.player1.hp -= result.damageDealt;
                    if (result.effectType === 'heal') activeState.player2.hp += Math.abs(result.damageDealt);

                    activeState.player2.hand = activeState.player2.hand.filter((c: any) => c.id !== card.id);
                    // activeState.player2.currentE -= (card.eCost || 0); // Removed cost

                    const defenseConsumed = card.type !== 'Garam' && defender.trapSlot;
                    if (defenseConsumed) activeState.player1.trapSlot = null;

                    // Handle Generated Card (e.g. Salt from Neutralization)
                    if (result.cardGenerated) {
                        activeState.player1.hand.push(result.cardGenerated);
                        const saltLog = createLog(activeState.turnNumber, `REAKSI HASILKAN: ${result.cardGenerated.name}!`, `REAKSI HASILKAN: ${result.cardGenerated.name}!`, 'system', 'info', `+1 Kad ke tangan ${activeState.player1.name}`);
                        activeState.gameLog.push(saltLog);
                    }

                    // --- pH CALCULATION START ---
                    let finalPHChange = result.pHChange || 0;
                    let calcLogString = '';
                    let calcData: CalculationData | undefined;

                    // Handle Buffer Activation (AI Self-Buff or Defender Buff? Let's assume AI gets buffer if generated)
                    if (result.isBuffer) {
                        const buffId = `buff-ai-${Date.now()}`;
                        if (!activeState.player2.activeBuffers) activeState.player2.activeBuffers = [];
                        activeState.player2.activeBuffers.push({
                            id: buffId,
                            name: card.name,
                            multiplier: card.bufferMultiplier || 0.1,
                            turnsRemaining: card.bufferDuration || 3,
                            description: `Menentang perubahan pH (x${card.bufferMultiplier || 0.1})`
                        });
                        activeState.gameLog.push(createLog(activeState.turnNumber, `BUFFER AI DIAKTIFKAN: ${card.name}`, `AI BUFFER DIAKTIFKAN: ${card.name}`, 'player2', 'info'));
                    }

                    // Calculate Buffer Effect (On Defender = Player 1)
                    if (finalPHChange !== 0) {
                        const bufferedCalc = calculateBufferedPHChange(finalPHChange, activeState.player1.activeBuffers || []);
                        finalPHChange = bufferedCalc.finalChange;
                        calcLogString = bufferedCalc.calculationSteps.join('\n');
                        calcData = bufferedCalc.calculationData;
                    }

                    // Update Defender pH (Player 1)
                    // Logic: New pH = Current - Change
                    // Acid (Change +6) -> 7 - 6 = 1.
                    // Base (Change -7) -> 7 - (-7) = 14.
                    activeState.player1.ph = Math.max(0, Math.min(14, activeState.player1.ph - finalPHChange));
                    // --- pH CALCULATION END ---

                    const log = createLog(
                        activeState.turnNumber,
                        `AI Serang guna ${card.name} (${result.damageDealt} HP)`,
                        `AI Serang guna ${card.name} (${result.damageDealt} HP)`,
                        'player2',
                        'attack',
                        calcLogString,
                        calcData
                    );
                    activeState.gameLog.push(log);

                    if (calcData) triggerPHAnimation(calcData); // Trigger Animation via Event Bus

                    addVisualEffect(result.effectType as any || 'damage', result.damageDealt, result.message, { x: 25, y: 70 });
                    soundManager.playSFX('attack');
                    actionCount++;
                    isMeaningfulMove = true;

                } else if (move.action === 'trap' && move.card) {
                    activeState.player2.trapSlot = move.card;
                    activeState.player2.hand = activeState.player2.hand.filter((c: any) => c.id !== move.card!.id);
                    // activeState.player2.currentE -= (move.card!.eCost || 0); // Removed cost

                    const log = createLog(activeState.turnNumber, "AI pasang Perangkap: " + move.card.name, "AI pasang Perangkap.", 'player2', 'trap');
                    activeState.gameLog.push(log);
                    actionCount++;
                    isMeaningfulMove = true;

                } else if (move.action === 'draw') {
                    if (activeState.player2.deck.length > 0) activeState.player2.hand.push(activeState.player2.deck.pop()!);
                    activeState.player2.currentE -= 1;

                    const log = createLog(activeState.turnNumber, "AI tarik kad.", "AI tarik kad.", 'player2', 'draw');
                    activeState.gameLog.push(log);
                    actionCount++;
                    isMeaningfulMove = true; // User approved Draw as meaningful

                } else if ((move as any).action === 'recycle' && (move as any).card) {
                    const card = (move as any).card;
                    const ai = activeState.player2;
                    activeState.player2.hand = ai.hand.filter((c: any) => c.id !== card.id);
                    activeState.player2.timbunanBuang.push(card);

                    const energyGain = (card.type === 'Sintesis' || card.type === 'Garam') ? 3 : 1;
                    activeState.player2.currentE = Math.min(ai.maxE, ai.currentE + energyGain);

                    const log = createLog(activeState.turnNumber, `AI Kitar Semula ${card.name}.`, `AI Kitar Semula kad (+${energyGain}E).`, 'player2', 'recycle');
                    activeState.gameLog.push(log);
                    actionCount++;
                    isMeaningfulMove = true;
                }

                if (isMeaningfulMove) {
                    endTimestamp = Date.now() + 8000; // Reset Timer to 8s
                }

                // Sync intermediate state so user sees updates!
                syncState(activeState);

                // Delay AFTER the move to allow UI to render and user to see the action
                if (isMeaningfulMove) {
                    await new Promise(r => setTimeout(r, 1500)); // 1.5s delay for comfortable pacing
                }
            }
        } catch (error) {
            console.error("AI Turn Error:", error);
            const errLog = createLog(activeState.turnNumber, "AI Error. Skip giliran.", "AI Error. Skip giliran.", 'system', 'error');
            activeState.gameLog.push(errLog);
        }

        // HANDLE BUFFER DURATION (Decrement BOTH players)
        ['player1', 'player2'].forEach(pid => {
            const p = activeState[pid];
            if (p.activeBuffers && p.activeBuffers.length > 0) {
                const updated = p.activeBuffers.map((b: any) => ({ ...b, turnsRemaining: b.turnsRemaining - 1 }));
                const active = updated.filter((b: any) => b.turnsRemaining > 0);
                const expired = updated.filter((b: any) => b.turnsRemaining <= 0);

                expired.forEach((b: any) => {
                    activeState.gameLog.push(createLog(activeState.turnNumber, `Buffer ${b.name} (${p.name}) tamat.`, `Buffer tamat.`, 'system', 'info'));
                });
                p.activeBuffers = active;
            }
        });

        // TURN INCREMENT
        // Ensure this happens even if AI errors out, so Player 1 gets their turn back.
        const deck1 = activeState.player1.deck;
        const deck2 = activeState.player2.deck;
        for (let i = 0; i < 2; i++) { if (deck1.length) activeState.player1.hand.push(deck1.pop()!); }
        for (let i = 0; i < 2; i++) { if (deck2.length) activeState.player2.hand.push(deck2.pop()!); }

        const turnLog = createLog(activeState.turnNumber, "Pusingan Baru: +2 Kad setiap pemain.", "Pusingan Baru: +2 Kad setiap pemain.", 'system');
        activeState.gameLog.push(turnLog);

        activeState.player2.currentE = Math.min(activeState.player2.maxE, activeState.player2.currentE + 2);
        activeState.player2.currentM = Math.min(activeState.player2.maxM, activeState.player2.currentM + 1);

        activeState.currentPlayer = 'player1';
        activeState.turnNumber += 1;

        activeState.player1.drawsThisTurn = 0;
        activeState.player2.drawsThisTurn = 0;

        syncState(activeState);
        if (activeState.player1.hp <= 0) endGame(false);
    };

    // --- RENDER HELPERS ---
    const safeGameState = gameState ? (gameState as GameState) : null;
    const me = safeGameState ? (myRole === 'player1' ? safeGameState.player1 : safeGameState.player2) : null;
    const opponent = safeGameState ? (myRole === 'player1' ? safeGameState.player2 : safeGameState.player1) : null;
    const isMyTurnRender = safeGameState ? safeGameState.currentPlayer === myRole : false;

    // --- HELPER: Synthesis Logic ---
    const getAvailableSynthesis = (player: Player) => {
        const zoneCards = player.synthesisZone;
        const available: any[] = [];

        // Combine regular recipes and salt recipes
        const allRecipes = [...sintesisCards, ...garamCards];

        allRecipes.forEach(recipe => {
            let requirements = recipe.requirements;

            // If no explicit requirements but has source (Salt), parse it
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                requirements = parts.map(p => ({ element: p, count: 1 }));
            }

            if (!requirements) return;

            // Check if zone has ingredients
            // Clone zone to simulate consumption
            let tempZone = [...zoneCards];
            let possible = true;
            // let moleCost = 0; // Salts usually 0 cost but let's keep logic

            for (const req of requirements) {
                // Check Element Symbol OR Compound Formula
                const foundIndex = tempZone.findIndex(c => (c.symbol === req.element || c.formula === req.element));

                if (foundIndex !== -1) {
                    tempZone.splice(foundIndex, 1);
                } else {
                    possible = false;
                    break;
                }
            }

            if (possible) {
                available.push({ card: recipe, moleCost: recipe.mCost || 0 });
            }
        });

        return available;
    };

    // --- RENDER ---
    return (
        <div className={`fixed inset-0 bg-black flex items-center justify-center select-none ${isNarrow ? 'overflow-y-auto items-start' : 'overflow-hidden'}`}>
            <TouchDragPolyfill />

            {/* SCALED GAME CONTAINER */}
            <div
                style={{
                    width: dimensions.width,
                    height: isNarrow ? 'auto' : dimensions.height,
                    minHeight: isNarrow ? dimensions.height : undefined,
                    transform: `scale(${scale})`,
                    transformOrigin: isNarrow ? 'top center' : 'center',
                    marginBottom: isNarrow ? '50vh' : 0
                }}
                className={`relative bg-slate-950 shadow-2xl flex flex-col transition-transform duration-300 ${isNarrow ? '' : 'origin-center overflow-hidden'}`}
            >
                {/* GLOBAL OVERLAYS (Rendered on top of everything) */}
                {notification && <div className={`fixed top - 20 left - 1 / 2 - translate - x - 1 / 2 px - 6 py - 3 rounded - full text - white font - bold shadow - xl border animate -in slide -in -from - top - 4 z - [100] ${notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} `}>{notification.message}</div>}

                {/* Pages based on AppState */}
                {appState === 'menu' && (
                    <MainMenu
                        onStartGame={handleStartGame}
                        onOpenLibrary={() => setShowLibrary(true)}
                        onOpenTutorial={() => setShowTutorial(true)}
                        onOpenSettings={() => setShowSettings(true)}
                        onChangeProfile={() => setShowProfileSelector(true)}
                        currentProfile={currentProfile}
                    />
                )}

                {appState === 'lobby' && (
                    <Lobby
                        onJoinRoom={handleJoinCustomRoom}
                        onCreateRoom={handleCreateRoom}
                        onRandomMatch={handleRandomMatch}
                        onCancel={() => setAppState('menu')}
                        socketStatus={socketStatus}
                    />
                )}

                {(appState === 'game' || appState === 'pvp') && !gameState && (
                    <div className="flex items-center justify-center h-screen bg-slate-900 text-white"><Loader2 className="animate-spin mr-2" /> Memuatkan Permainan...</div>
                )}

                {(appState === 'game' || appState === 'pvp') && gameState && safeGameState && me && opponent && (
                    <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black pointer-events-none" />
                        <VisualEffectsLayer
                            effects={safeGameState.activeVisualEffects}
                            currentPH={me.ph} // Pass Player's pH for vignette
                        />

                        {/* HEADER */}
                        <GameHeader
                            turnNumber={safeGameState.turnNumber}
                            isMyTurn={isMyTurnRender}
                            onPause={() => setPaused(true)}
                            onShowLibrary={() => setShowLibrary(true)}
                            onShowAskChemist={() => setShowAskChemist(true)}
                            onShowTutorial={() => setShowTutorial(true)}
                        />

                        {/* MAIN BATTLEFIELD */}
                        <main className={`flex-1 flex relative ${isNarrow ? 'flex-col' : 'flex-row'}`}>
                            {/* SIDEBAR: LOGS & METERS */}
                            {/* In Narrow Mode, this becomes the Header Band */}
                            <GameSidebar
                                playerPH={me.ph}
                                onSelfApply={handleSelfApply}
                                gameLog={safeGameState.gameLog}
                                myId={myRole}
                                isNarrow={isNarrow}
                            />

                            {/* CENTER: PLAY AREA */}
                            <section className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
                                {/* OPPONENT AREA */}
                                <OpponentZone opponent={opponent} />

                                {/* MIDDLE: BATTLE ZONE (Visual only) */}
                                <div className="flex-1 flex items-center justify-center relative">
                                    <div className="text-slate-800 font-bold text-4xl tracking-widest uppercase opacity-20 pointer-events-none select-none">VS</div>
                                </div>

                                {/* PLAYER AREA */}
                                <PlayerZone
                                    player={me}
                                    isMyTurn={isMyTurnRender}
                                    isNarrow={isNarrow}
                                    availableSynthesis={getAvailableSynthesis(me)}
                                    onEndTurn={handleEndTurn}
                                    onDropToZone={(c, s, i) => handleMoveCardToZone(c, s as 'hand' | 'synthesisZone', i)}
                                    onClearSynthesis={() => me.synthesisZone.forEach((_, i) => handleMoveCardToHand(0))}
                                    onSynthesize={handleSynthesize}
                                    onMoveCardToHand={handleMoveCardToHand}
                                    onNotify={setNotification}
                                    onAttack={handleAttack}
                                    onSetTrap={handleTrapSet}
                                    onRecycle={(c, s, i) => handleRecycleCard(c, s as 'hand', i)}
                                    onDrawCard={handleDrawCard}
                                />
                            </section>
                        </main>
                    </>
                )}

                {/* SHARED MODALS & OVERLAYS */}
                {paused && <PauseMenu onResume={() => setPaused(false)} onSettings={() => setShowSettings(true)} onQuit={handleQuitGame} />}
                {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
                {showLibrary && <Perpustakaan onClose={() => setShowLibrary(false)} />}
                {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
                {showAskChemist && gameState && <AskChemistModal onClose={() => setShowAskChemist(false)} gameState={gameState} />}
                {showAskChemist && !gameState && null /* Don't show AskChemist in menu yet if it depends on gameState */}
                {showProfileSelector && <ProfileSelector onSelectProfile={(p: any) => { setCurrentProfile(p); setShowProfileSelector(false); localStorage.setItem('kimia_profile', JSON.stringify(p)); }} onCancel={() => setShowProfileSelector(false)} />}

                {lobbyError && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900 border-red-500 text-white p-6 rounded-xl z-[110]">{lobbyError} <button onClick={() => setLobbyError('')} className="ml-4 underline">Tutup</button></div>}
            </div>
        </div>
    );
}
