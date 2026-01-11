"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MainMenu, Lobby } from './Menus';
import { sintesisCards, garamCards } from '../../lib/gameData';
import { useGameState } from '../hooks/useGameState';
import { Card, Player, GameState, LogEntry } from '../../types';
import { DraggableCard, SynthesisZone } from './CardComponents';
import { OpponentZone } from './layout/OpponentZone';
import { PlayerZone } from './layout/PlayerZone';
import { GameSidebar } from './layout/GameSidebar';
import { GameHeader } from './layout/GameHeader';
import { StartTurnOverlay } from './Overlays';
import { GameOverOverlay } from './overlays/GameOverOverlay';
import { VisualEffectsLayer } from './VisualEffectsLayer';
import { Loader2 } from 'lucide-react';
import { SettingsModal, AskChemistModal, TutorialModal, ProfileSelector } from './Modals';
import { Perpustakaan as LibraryModal } from './Perpustakaan';
import { useGameSettings } from '../../lib/SettingsContext';
import { soundManager } from '../../lib/audio';
import { TouchDragPolyfill } from './TouchPolyfill';
import { LandscapeOverlay } from './LandscapeOverlay';
import { ErrorBoundary } from '../ErrorBoundary';

// --- FULL RESPONSIVE COMPONENT ---
export default function GameInterface() {
    return (
        <ErrorBoundary>
            <GameInterfaceContent />
        </ErrorBoundary>
    );
}

function GameInterfaceContent() {
    const {
        gameState,
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
        // Detailed Handlers
        handleDropToZone,
        handleClearSynthesis,
        handleSynthesize,
        handleMoveCardToHand,
        handleSetTrap,
        handleRecycle
    } = useGameState();

    const [paused, setPaused] = useState(false);
    const [appState, setAppState] = useState<'menu' | 'lobby' | 'game' | 'pvp'>('menu');
    const [showLibrary, setShowLibrary] = useState(false);
    const [showAskChemist, setShowAskChemist] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileSelector, setShowProfileSelector] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const { settings } = useGameSettings();
    const channelRef = useRef<any>(null);

    // --- MOBILE SCALING LOGIC ---
    // --- RESPONSIVE LAYOUT STATE ---
    const [isNarrow, setIsNarrow] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            // switch to mobile sidebar layout only on very small screens
            // User requested desktop layout on mobile landscape, so we keep threshold low
            setIsNarrow(window.innerWidth < 600);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- AUDIO ---
    // Volume is managed by SettingsContext. We only handle Play/Stop state here.
    useEffect(() => {
        if (appState === 'menu') soundManager.playBGM('menu');
        else if (appState === 'game' || appState === 'pvp') soundManager.playBGM('battle');
        else soundManager.stopBGM();
    }, [appState]);

    // --- INITIALIZATION ---
    useEffect(() => {
        const savedProfile = localStorage.getItem('kimia_profile');
        if (savedProfile) {
            try { setCurrentProfile(JSON.parse(savedProfile)); } catch (e) { }
        } else {
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
            setMyRole('player1');
            setAppState('game');
        } else {
            setAppState('lobby');
        }
    };

    const me = gameState && myRole ? gameState[myRole === 'player1' ? 'player1' : 'player2'] : null;
    const opponentRole = myRole === 'player1' ? 'player2' : 'player1';
    const opponent = gameState ? gameState[opponentRole] : null;

    const safeGameState = gameState as GameState;
    const isMyTurnRender = safeGameState?.currentPlayer === myRole;

    // [REVERTED] Staged Game Over Sequence removed.
    // Using simple effect to show overlay on win.
    useEffect(() => {
        if (safeGameState?.winner) {
            setShowGameOver(true);
        } else {
            setShowGameOver(false);
        }
    }, [safeGameState?.winner]);

    // --- SYNTHESIS LOGIC (Client Side Calculation) ---
    // Calculate what recipes are available based on Hand + Zone
    // RESTORED LOGIC: "One Card Per Type" + M-Cost Check
    const availableSynthesis = React.useMemo(() => {
        if (!me) return [];

        const allRecipes = [...sintesisCards, ...garamCards];
        // STRICT RULE: Only consider cards in Synthesis Zone for recipe detection
        const pool = [...me.synthesisZone];

        return allRecipes.filter(recipe => {
            // Check based on Requirements OR Source string
            let requirements = recipe.requirements;
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                const counts: Record<string, number> = {};
                parts.forEach(pt => counts[pt] = (counts[pt] || 0) + 1);
                requirements = Object.entries(counts).map(([element, count]) => ({ element, count }));
            }

            if (!requirements) return false;

            // RESTORED CHECK: Verify we have at least ONE of each required Element Type
            // Quantity (stoichiometry) determines COST, not CARD PRESENCE.
            for (const req of requirements) {
                const found = pool.some(c => c && (c.symbol === req.element || c.formula === req.element));
                if (!found) return false;
            }
            return true;
        }).map(recipe => {
            // Calculate Logic Cost
            let requirements = recipe.requirements;
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                const counts: Record<string, number> = {};
                parts.forEach(pt => counts[pt] = (counts[pt] || 0) + 1);
                requirements = Object.entries(counts).map(([element, count]) => ({ element, count }));
            }
            // Calculated M Cost = Sum of all Requirement Counts (e.g. H20 = 2H + 1O = 3 M Cost)
            const calculatedMCost = requirements ? requirements.reduce((acc, req) => acc + (req.count || 1), 0) : 10;

            return {
                card: recipe,
                moleCost: calculatedMCost
            };
        });
    }, [me?.synthesisZone]); // Only re-run when Zone changes (Hand irrelevant for detection now)

    const handleSurrender = () => {
        setShowSettings(false);
        setPaused(false);
        onNotify({ message: "Permainan ditamatkan. Analisis data selesai. Jumpa lagi!", type: 'info' });

        // Wait for notification to show/clear before switching state
        setTimeout(() => {
            setAppState('menu');
        }, 3000);
    };

    return (
        <div className={`fixed inset-0 bg-black flex items-center justify-center select-none ${isNarrow ? 'overflow-y-auto items-start' : 'overflow-hidden'}`}>
            <TouchDragPolyfill />
            {isNarrow && <LandscapeOverlay />}
            <div
                className={`relative w-full h-full bg-slate-950 shadow-2xl flex flex-col ${isNarrow ? '' : 'overflow-hidden'}`}
            >
                {notification && <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold shadow-xl border animate-in slide-in-from-top-4 z-[100] ${notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} `}>{notification.message}</div>}

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
                            currentPH={me.ph}
                        />

                        <GameHeader
                            turnNumber={safeGameState.turnNumber}
                            isMyTurn={isMyTurnRender}
                            onPause={() => setPaused(true)}
                            onShowLibrary={() => setShowLibrary(true)}
                            onShowAskChemist={() => setShowAskChemist(true)}
                            onShowTutorial={() => setShowTutorial(true)}
                        />

                        <main className={`flex-1 flex relative ${isNarrow ? 'flex-col' : 'flex-row'}`}>
                            <GameSidebar
                                playerPH={me.ph}
                                onSelfApply={handleSelfApply}
                                gameLog={safeGameState.gameLog}
                                myId={myId || 'me'}
                                isNarrow={isNarrow}
                            />

                            <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
                                <OpponentZone
                                    opponent={opponent}
                                />

                                <PlayerZone
                                    player={me}
                                    onAttack={handleAttack}
                                    onEndTurn={handleEndTurn}
                                    isMyTurn={isMyTurnRender}
                                    isNarrow={isNarrow}
                                    availableSynthesis={availableSynthesis}
                                    onDropToZone={handleDropToZone}
                                    onClearSynthesis={handleClearSynthesis}
                                    onSynthesize={handleSynthesize}
                                    onMoveCardToHand={handleMoveCardToHand}
                                    onNotify={onNotify}
                                    onSetTrap={handleSetTrap}
                                    onRecycle={handleRecycle}
                                    onDrawCard={handleDrawCard}
                                />
                            </div>
                        </main>

                        {!safeGameState.winner && <StartTurnOverlay turn={safeGameState.turnNumber} isMyTurn={isMyTurnRender} />}
                        {(safeGameState.winner && showGameOver) && (
                            <GameOverOverlay
                                winner={safeGameState.winner!}
                                myRole={myRole || 'player1'}
                                onHome={() => setAppState('menu')}
                                onRestart={() => handleStartGame('pve')}
                            />
                        )}
                    </>
                )}
            </div>

            {showSettings && <SettingsModal onClose={() => { setShowSettings(false); setPaused(false); }} onSurrender={(appState === 'game' || appState === 'pvp') ? handleSurrender : undefined} />}
            {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}
            {showAskChemist && <AskChemistModal onClose={() => setShowAskChemist(false)} gameState={gameState as GameState} />}
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            {showProfileSelector && <ProfileSelector onCancel={() => setShowProfileSelector(false)} onSelectProfile={(p: any) => { setCurrentProfile(p); localStorage.setItem('kimia_profile', JSON.stringify(p)); setShowProfileSelector(false); }} />}
            {paused && <SettingsModal onClose={() => setPaused(false)} onSurrender={handleSurrender} />}
        </div>
    );
}
