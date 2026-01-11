import React, { useState, useEffect } from 'react';
import { GameLayout } from './GameLayout';
import { useGameState } from '../hooks/useGameState';
import { useGameSettings } from '../../lib/SettingsContext';
import { soundManager } from '../../lib/audio';
import { TouchDragPolyfill } from './TouchPolyfill';

// REFERENCE RESOLUTION
const REF_WIDTH = 1366;
const REF_HEIGHT = 768;

export default function GameMobile() {
    // --- SCALING LOGIC ---
    const [scale, setScale] = useState(1);
    const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            setWindowSize({ w, h });

            // Calculate scale to fit the screen
            // We want to fit 1366x768 into the current viewport
            // Usually we stick to width-based scaling for landscape
            const scaleX = w / REF_WIDTH;
            const scaleY = h / REF_HEIGHT;

            // Use the smaller scale to ensure it fits fully (letterbox)
            // OR use width-fill (user said "shrink everything", implies fit)
            // Ideally we want 'contain' behavior.
            const s = Math.min(scaleX, scaleY);
            setScale(s);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // --- GAME STATE ---
    // (Identical to Desktop, just passed down)
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

    // Audio
    useEffect(() => {
        if (appState === 'menu') soundManager.playBGM('menu');
        else if (appState === 'game' || appState === 'pvp') soundManager.playBGM('battle');
        else soundManager.stopBGM();
    }, [appState]);

    // Profile Init
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
            initializeGame(currentProfile?.name || 'Pemain', 'AI Opponent');
            setMyRole('player1');
            setAppState('game');
        } else {
            setAppState('lobby');
        }
    };

    const handleSurrender = () => {
        setShowSettings(false);
        setPaused(false);
        onNotify({ message: "Permainan ditamatkan.", type: 'info' });
        setTimeout(() => setAppState('menu'), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
            {/* FORCE TOUCH POLYFILL ALWAYS ON MOBILE */}
            <TouchDragPolyfill />

            {/* SCALED CONTAINER */}
            <div
                style={{
                    width: REF_WIDTH,
                    height: REF_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    // Optional: Hardware acceleration hint
                    willChange: 'transform'
                }}
                className="bg-slate-950 shadow-2xl overflow-hidden"
            >
                <GameLayout
                    appState={appState}
                    setAppState={setAppState}
                    gameState={gameState}
                    myRole={myRole}
                    myId={myId || ''}
                    notification={notification}
                    isNarrow={false} // ALWAYS FALSE because we scale the desktop layout!
                    onStartGame={handleStartGame}
                    onJoinRoom={handleJoinCustomRoom}
                    onCreateRoom={handleCreateRoom}
                    onRandomMatch={handleRandomMatch}
                    onCancelLobby={() => setAppState('menu')}
                    socketStatus={socketStatus}
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
                    handleSurrender={handleSurrender}
                />
            </div>

            {/* ROTATE MESSAGE OVERLAY (If portrait) */}
            {/* Since we scale to fit, portrait might look tiny (letterboxed). 
                The user said "for portrait you dont have to concern", 
                but practically we usually force landscape. 
                However, scaling logic `Math.min` will handle it by making it very small. 
                Let's stick to the user's request: "game will shrink everything". 
            */}
        </div>
    );
}
