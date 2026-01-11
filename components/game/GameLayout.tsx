import React from 'react';
import { MainMenu, Lobby } from './Menus';
import { GameHeader } from './layout/GameHeader';
import { GameSidebar } from './layout/GameSidebar';
import { OpponentZone } from './layout/OpponentZone';
import { PlayerZone } from './layout/PlayerZone';
import { StartTurnOverlay } from './Overlays';
import { GameOverOverlay } from './overlays/GameOverOverlay';
import { VisualEffectsLayer } from './VisualEffectsLayer';
import { Loader2 } from 'lucide-react';
import { SettingsModal, AskChemistModal, TutorialModal, ProfileSelector } from './Modals';
import { Perpustakaan as LibraryModal } from './Perpustakaan';
import { TouchDragPolyfill } from './TouchPolyfill';
import { LandscapeOverlay } from './LandscapeOverlay';

// Props Interface to decouple state from UI
interface GameLayoutProps {
    appState: 'menu' | 'lobby' | 'game' | 'pvp';
    gameState: any;
    myRole: any;
    myId: string;
    notification: any;
    isNarrow: boolean;
    // Handlers
    onStartGame: (mode: 'pve' | 'pvp') => void;
    onJoinRoom: (code: string) => void;
    onCreateRoom: (code: string) => void;
    onRandomMatch: () => void;
    onCancelLobby: () => void;
    socketStatus: string;
    // Game Actions
    // Game Actions
    onAtttack: (card: any, index: number) => void;
    onEndTurn: () => void;
    onDrawCard: () => void;
    onDropToZone: (card: any, source: string, index: number) => void;
    onClearSynthesis: () => void;
    onSynthesize: (targetCard: any, cost: number) => void;
    onMoveCardToHand: (index: number) => void;
    onSetTrap: (card: any, source: string, index: number) => void;
    onRecycle: (card: any, source: string, index: number) => void;
    onSelfApply: (card: any, source: string, index: number) => void;
    // UI State Handlers
    showSettings: boolean;
    setShowSettings: (v: boolean) => void;
    showLibrary: boolean;
    setShowLibrary: (v: boolean) => void;
    showAskChemist: boolean;
    setShowAskChemist: (v: boolean) => void;
    showTutorial: boolean;
    setShowTutorial: (v: boolean) => void;
    showProfileSelector: boolean;
    setShowProfileSelector: (v: boolean) => void;
    currentProfile: any;
    setCurrentProfile: (p: any) => void;
    paused: boolean;
    setPaused: (v: boolean) => void;
    handleSurrender: () => void;
    setAppState: (v: any) => void;
}

export function GameLayout({
    appState,
    gameState,
    myRole,
    myId,
    notification,
    isNarrow,
    onStartGame,
    onJoinRoom,
    onCreateRoom,
    onRandomMatch,
    onCancelLobby,
    socketStatus,
    onAtttack,
    onEndTurn,
    onDrawCard,
    onDropToZone,
    onClearSynthesis,
    onSynthesize,
    onMoveCardToHand,
    onSetTrap,
    onRecycle,
    onSelfApply,
    showSettings,
    setShowSettings,
    showLibrary,
    setShowLibrary,
    showAskChemist,
    setShowAskChemist,
    showTutorial,
    setShowTutorial,
    showProfileSelector,
    setShowProfileSelector,
    currentProfile,
    setCurrentProfile,
    paused,
    setPaused,
    handleSurrender,
    setAppState
}: GameLayoutProps) {

    // Helper mappings
    const me = gameState && myRole ? gameState[myRole === 'player1' ? 'player1' : 'player2'] : null;
    const opponentRole = myRole === 'player1' ? 'player2' : 'player1';
    const opponent = gameState ? gameState[opponentRole] : null;
    const isMyTurnRender = gameState?.currentPlayer === myRole;

    // Synthesis Logic (Moved from Interface or kept in Hook? Keeping simple calc here for UI)
    // NOTE: For now, we assume the parent passed processed props or we re-calc here cheaply.
    // To match original, we'll re-use the memo logic if possible, OR just pass 'availableSynthesis' as prop.
    // Let's assume passed as prop to keep this clean?
    // Actually, re-implementing the memo here is safer for refactor speed unless we change the hook.
    // Let's pass the HOOK values down? No, `GameLayout` should be dumb.

    // ... Re-implementing synthesis calc briefly or asking to pass it? 
    // Let's Calculate it here to avoid massive prop drilling from the Hook container.
    // IMPORTS NEEDED: sintesisCards, garamCards from gameData
    const { sintesisCards, garamCards } = require('../../lib/gameData');

    const availableSynthesis = React.useMemo(() => {
        if (!me) return [];
        const allRecipes = [...sintesisCards, ...garamCards];
        const pool = [...me.synthesisZone];
        return allRecipes.filter(recipe => {
            let requirements = recipe.requirements;
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                const counts: Record<string, number> = {};
                parts.forEach((pt: string) => counts[pt] = (counts[pt] || 0) + 1);
                requirements = Object.entries(counts).map(([element, count]) => ({ element, count }));
            }
            if (!requirements) return false;
            for (const req of requirements) {
                const found = pool.some(c => c && (c.symbol === req.element || c.formula === req.element));
                if (!found) return false;
            }
            return true;
        }).map(recipe => {
            let requirements = recipe.requirements;
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                const counts: Record<string, number> = {};
                parts.forEach((pt: string) => counts[pt] = (counts[pt] || 0) + 1);
                requirements = Object.entries(counts).map(([element, count]) => ({ element, count }));
            }
            const calculatedMCost = requirements ? requirements.reduce((acc: number, req: any) => acc + (req.count || 1), 0) : 10;
            return { card: recipe, moleCost: calculatedMCost };
        });
    }, [me?.synthesisZone]);

    const showGameOver = !!gameState?.winner;

    return (
        <div className={`relative w-full h-full bg-slate-950 shadow-2xl flex flex-col ${isNarrow ? '' : 'overflow-hidden'}`}>
            {notification && <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white font-bold shadow-xl border animate-in slide-in-from-top-4 z-[100] ${notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} `}>{notification.message}</div>}

            {appState === 'menu' && (
                <MainMenu
                    onStartGame={onStartGame}
                    onOpenLibrary={() => setShowLibrary(true)}
                    onOpenTutorial={() => setShowTutorial(true)}
                    onOpenSettings={() => setShowSettings(true)}
                    onChangeProfile={() => setShowProfileSelector(true)}
                    currentProfile={currentProfile}
                />
            )}

            {appState === 'lobby' && (
                <Lobby
                    onJoinRoom={onJoinRoom}
                    onCreateRoom={onCreateRoom}
                    onRandomMatch={onRandomMatch}
                    onCancel={onCancelLobby}
                    socketStatus={socketStatus}
                    onStartGame={onStartGame}
                />
            )}

            {(appState === 'game' || appState === 'pvp') && !gameState && (
                <div className="flex items-center justify-center h-screen bg-slate-900 text-white"><Loader2 className="animate-spin mr-2" /> Memuatkan Permainan...</div>
            )}

            {(appState === 'game' || appState === 'pvp') && gameState && me && opponent && (
                <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-black pointer-events-none" />
                    <VisualEffectsLayer
                        effects={gameState.activeVisualEffects}
                        currentPH={me.ph}
                    />

                    <GameHeader
                        turnNumber={gameState.turnNumber}
                        isMyTurn={isMyTurnRender}
                        onPause={() => setPaused(true)}
                        onShowLibrary={() => setShowLibrary(true)}
                        onShowAskChemist={() => setShowAskChemist(true)}
                        onShowTutorial={() => setShowTutorial(true)}
                    />

                    <main className={`flex-1 flex relative ${isNarrow ? 'flex-col' : 'flex-row'}`}>
                        <GameSidebar
                            playerPH={me.ph}
                            onSelfApply={onSelfApply}
                            gameLog={gameState.gameLog}
                            myId={myId || 'me'}
                            isNarrow={isNarrow}
                        />

                        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
                            <OpponentZone
                                opponent={opponent}
                            />

                            <PlayerZone
                                player={me}
                                onAttack={onAtttack}
                                onEndTurn={onEndTurn}
                                isMyTurn={isMyTurnRender}
                                isNarrow={isNarrow}
                                availableSynthesis={availableSynthesis}
                                onDropToZone={onDropToZone}
                                onClearSynthesis={onClearSynthesis}
                                onSynthesize={onSynthesize}
                                onMoveCardToHand={onMoveCardToHand}
                                onNotify={(msg) => console.log(msg)} // Simplified, notifications handled by parent usually
                                onSetTrap={onSetTrap}
                                onRecycle={onRecycle}
                                onDrawCard={onDrawCard}
                            />
                        </div>
                    </main>

                    {!gameState.winner && <StartTurnOverlay turn={gameState.turnNumber} isMyTurn={isMyTurnRender} />}
                    {(gameState.winner && showGameOver) && (
                        <GameOverOverlay
                            winner={gameState.winner!}
                            myRole={myRole || 'player1'}
                            onHome={() => setAppState('menu')}
                            onRestart={() => onStartGame('pve')}
                        />
                    )}
                </>
            )}

            {showSettings && <SettingsModal onClose={() => { setShowSettings(false); setPaused(false); }} onSurrender={(appState === 'game' || appState === 'pvp') ? handleSurrender : undefined} />}
            {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}
            {showAskChemist && <AskChemistModal onClose={() => setShowAskChemist(false)} gameState={gameState} />}
            {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
            {showProfileSelector && <ProfileSelector onCancel={() => setShowProfileSelector(false)} onSelectProfile={(p: any) => { setCurrentProfile(p); localStorage.setItem('kimia_profile', JSON.stringify(p)); setShowProfileSelector(false); }} />}
            {paused && <SettingsModal onClose={() => setPaused(false)} onSurrender={handleSurrender} />}
        </div>
    );
}
