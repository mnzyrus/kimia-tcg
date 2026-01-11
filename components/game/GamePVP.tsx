import React, { useState, useEffect } from 'react';
import { GameLayout } from './GameLayout';
import { usePVPState } from '../hooks/usePVPState';
import { TouchDragPolyfill } from './TouchPolyfill';
import { LandscapeOverlay } from './LandscapeOverlay';
import { Loader2 } from 'lucide-react';
import { soundManager } from '../../lib/audio';

interface GamePVPProps {
    matchId: number;
    myId: string;
    onExit: () => void;
}

export default function GamePVP({ matchId, myId, onExit }: GamePVPProps) {
    const {
        gameState,
        isMyTurn,
        playerRole,
        loading,
        sendAction
    } = usePVPState(matchId, myId);

    const [isNarrow, setIsNarrow] = useState(false);
    const [paused, setPaused] = useState(false);

    // UI States (Should be managed locally or sync? UI is mostly local)
    const [showLibrary, setShowLibrary] = useState(false);
    const [showAskChemist, setShowAskChemist] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileSelector, setShowProfileSelector] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<any>(null); // Fetch or pass props

    // Responsive Logic
    useEffect(() => {
        const handleResize = () => setIsNarrow(window.innerWidth < 600);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // BGM
    useEffect(() => {
        soundManager.playBGM('battle');
        return () => soundManager.stopBGM();
    }, []);

    if (loading || !gameState) {
        return <div className="fixed inset-0 bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2" /> Menghubungkan ke Bilik...</div>;
    }

    // --- ADAPTER HANDLERS ---
    // These convert UI actions (Strings) to Net actions (Objects/IDs)

    // --- ADAPTER HANDLERS ---
    // These convert UI actions (Strings/Objects) to Net actions (Objects/IDs)

    const handleAttack = (card: any, index: number) => {
        sendAction('ATTACK', { cardId: card.id });
    };

    const handleEndTurn = () => {
        sendAction('END_TURN', {});
    };

    const handleDrawCard = () => {
        sendAction('DRAW', {});
    };

    const handleDropToZone = (card: any, source: string, index: number) => {
        sendAction('DROP_ZONE', { cardId: card.id });
    };

    const handleSynthesize = (targetCard: any, cost: number) => {
        // For simplified PVP, use target ID
        sendAction('SYNTHESIZE', { cardId: targetCard.id });
    };

    // Stubs for other actions
    const handleClearSynthesis = () => { /* Local logic? */ };
    const handleMoveCardToHand = (index: number) => {
        // Need to find card by index from local state
        // Safely access hand
        const card = (gameState as any)?.me?.hand?.[index];
        if (card) sendAction('MOVE_HAND', { cardId: card.id });
    };
    const handleSetTrap = (card: any, source: string, index: number) => sendAction('SET_TRAP', { cardId: card.id });
    const handleRecycle = (card: any, source: string, index: number) => sendAction('RECYCLE', { cardId: card.id });
    const handleSelfApply = (card: any, source: string, index: number) => sendAction('SELF_APPLY', { cardId: card.id });

    // Lobby functions are not needed inside the Active Game view usually
    const noop = () => { };

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center select-none overflow-hidden">
            <TouchDragPolyfill />
            {isNarrow && <LandscapeOverlay />}

            <GameLayout
                appState="pvp"
                setAppState={() => { }} // Block AppState changes from inside?
                gameState={gameState}
                myRole={playerRole || 'player1'} // Fallback
                myId={myId}
                notification={null} // TODO: Add local notification state
                isNarrow={isNarrow}

                // Handlers
                onAtttack={handleAttack}
                onEndTurn={handleEndTurn}
                onDrawCard={handleDrawCard}
                onDropToZone={handleDropToZone}
                onClearSynthesis={handleClearSynthesis}
                onSynthesize={handleSynthesize}
                onMoveCardToHand={handleMoveCardToHand}
                onSetTrap={handleSetTrap}
                onRecycle={handleRecycle}
                onSelfApply={handleSelfApply}

                // Navigation / UI
                onStartGame={noop}
                onJoinRoom={noop}
                onCreateRoom={noop}
                onRandomMatch={noop}
                onCancelLobby={onExit}
                socketStatus="connected"

                // UI State Props
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showLibrary={showLibrary}
                setShowLibrary={setShowLibrary}
                showAskChemist={showAskChemist}
                setShowAskChemist={setShowAskChemist}
                showTutorial={showTutorial}
                setShowTutorial={setShowTutorial}
                showProfileSelector={showProfileSelector}
                setShowProfileSelector={setShowProfileSelector}
                currentProfile={currentProfile}
                setCurrentProfile={setCurrentProfile}
                paused={paused}
                setPaused={setPaused}
                handleSurrender={onExit}
            />
        </div>
    );
}
