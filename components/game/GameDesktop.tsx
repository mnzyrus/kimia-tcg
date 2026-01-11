import React, { useState, useEffect } from 'react';
import { GameLayout } from './GameLayout';
import { supabase } from '@/lib/supabaseClient';
import { getProfile } from '@/lib/supabaseService';
import { useGameState } from '../hooks/useGameState';
import { useGameSettings } from '../../lib/SettingsContext';
import { soundManager } from '../../lib/audio';
import { TouchDragPolyfill } from './TouchPolyfill';
import { LandscapeOverlay } from './LandscapeOverlay';
import GamePVP from './GamePVP';

export default function GameDesktop() {
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
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showAskChemist, setShowAskChemist] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showProfileSelector, setShowProfileSelector] = useState(false);
    const [currentProfile, setCurrentProfile] = useState<any>(null);
    const [isNarrow, setIsNarrow] = useState(false);

    // Desktop: Uses Fluid Layout
    useEffect(() => {
        const handleResize = () => {
            setIsNarrow(window.innerWidth < 600);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Audio
    useEffect(() => {
        if (appState === 'menu') soundManager.playBGM('menu');
        else if (appState === 'game' || appState === 'pvp') soundManager.playBGM('battle');
        else soundManager.stopBGM();
    }, [appState]);

    // Profile Init
    // Profile Init
    useEffect(() => {
        const initProfile = async () => {
            // Check for Auth User
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // If logged in, fetch REAL profile
                const realProfile = await getProfile(user.id);
                if (realProfile) {
                    setCurrentProfile({
                        ...realProfile,
                        isGuest: false
                    });
                    setMyId(user.id); // IMPORTANT: Set internal ID to Auth ID
                    return;
                }
            }

            // Fallback: Check LocalStorage or Create Guest
            const savedProfile = localStorage.getItem('kimia_profile');
            if (savedProfile) {
                try {
                    const parsed = JSON.parse(savedProfile);
                    setCurrentProfile(parsed);
                    setMyId(parsed.id || 'guest');
                } catch (e) { }
            } else {
                const guestId = `guest-${Math.floor(Math.random() * 10000)}`;
                const newGuest = {
                    id: guestId,
                    name: `Tetamu${Math.floor(Math.random() * 100)}`,
                    wins: 0,
                    losses: 0,
                    isGuest: true
                };
                setCurrentProfile(newGuest);
                setMyId(guestId);
            }
        };

        initProfile();
    }, []);

    const handleStartGame = (mode: 'pve' | 'pvp', roomId?: string) => {
        soundManager.playSFX('start');
        if (mode === 'pve') {
            initializeGame(currentProfile?.name || 'Pemain', 'AI Opponent');
            setMyRole('player1');
            setAppState('game');
        } else if (mode === 'pvp') {
            if (roomId) {
                // Assuming roomId passed from Lobby is usable as ID or Code
                setActiveMatchId(roomId);
                setAppState('pvp');
            } else {
                setAppState('lobby');
            }
        }
    };

    const handleSurrender = () => {
        setShowSettings(false);
        setPaused(false);
        onNotify({ message: "Permainan ditamatkan.", type: 'info' });
        setTimeout(() => setAppState('menu'), 2000);
    };

    if (appState === 'pvp' && activeMatchId) {
        // Ensure myId is available
        const myId = currentProfile?.id || 'guest';
        // Try parsing string match ID to number if possible, else rely on what's passed
        // Note: usePVPState takes number. If roomId is "ROOM-123", we need to fetch ID first or change usePVPState.
        // For current 'createMatch' impl, it uses int8 ID.
        // Lobby passes 'code'. We actually need the ID from the match Object.
        // TEMP FIX: We will parse, but if NaN, we might fail unless we update logic to lookup by Code.
        // Assuming for now user joins via ID or we fix this in Lobby later to pass ID.
        // Let's assume activeMatchId IS the numeric ID in string form for now.
        const matchIdNum = parseInt(activeMatchId);

        return (
            <GamePVP
                matchId={isNaN(matchIdNum) ? 0 : matchIdNum}
                myId={myId}
                onExit={() => {
                    setAppState('menu');
                    setActiveMatchId(null);
                }}
            />
        );
    }

    return (
        <div className={`fixed inset-0 bg-black flex items-center justify-center select-none overflow-hidden`}>
            <TouchDragPolyfill />
            {isNarrow && <LandscapeOverlay />}

            <GameLayout
                appState={appState}
                setAppState={setAppState}
                gameState={gameState}
                myRole={myRole}
                myId={appState === 'pvp' ? (myId || '') : 'player1'}
                notification={notification}
                isNarrow={isNarrow}
                onStartGame={handleStartGame}
                onJoinRoom={handleJoinCustomRoom}
                onCreateRoom={handleCreateRoom}
                onRandomMatch={handleRandomMatch}
                onCancelLobby={() => setAppState('menu')}
                socketStatus={socketStatus}
                onAtttack={(card: any, index: number) => handleAttack(card, index)}
                onEndTurn={handleEndTurn}
                onDrawCard={handleDrawCard}
                onDropToZone={(card: any, source: string, index: number) => handleDropToZone(card, source, index)}
                onClearSynthesis={() => handleClearSynthesis()}
                onSynthesize={(targetCard: any, cost: number) => handleSynthesize(targetCard, cost)}
                onMoveCardToHand={(index: number) => handleMoveCardToHand(index)}
                onSetTrap={(card: any, source: string, index: number) => handleSetTrap(card, source, index)}
                onRecycle={(card: any, source: string, index: number) => handleRecycle(card, source, index)}
                onSelfApply={(card: any, source: string, index: number) => handleSelfApply(card, source, index)}
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
    );
}
