import React, { useEffect, useState } from 'react';
import { Trophy, Frown, Home, RefreshCw } from 'lucide-react';

interface GameOverOverlayProps {
    winner: 'player1' | 'player2' | 'draw';
    myRole: 'player1' | 'player2';
    onHome: () => void;
    onRestart: () => void;
}

export function GameOverOverlay({ winner, myRole, onHome, onRestart }: GameOverOverlayProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setVisible(true), 100);
    }, []);



    const isVictory = winner === myRole;
    const isDraw = winner === 'draw';

    // Animation Classes: Exit vs Entrance vs Hidden
    const containerClasses = visible
        ? 'opacity-100 bg-slate-950/95 backdrop-blur-md'
        : 'opacity-0 bg-transparent pointer-events-none';

    const cardClasses = visible
        ? 'translate-y-0 opacity-100 scale-100'
        : 'translate-y-20 opacity-0 scale-90';

    return (
        <div
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-700 cursor-default ${containerClasses}`}
        >

            {/* Background Particles (Simple CSS) */}
            <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-full ${isVictory ? 'bg-gradient-to-b from-yellow-500/20 to-transparent' : 'bg-gradient-to-b from-red-900/20 to-transparent'}`} />
            </div>

            {/* Main Content Card - Stop Propagation to prevent auto-dismiss */}
            <div
                className={`relative transform transition-all duration-700 delay-0 flex flex-col items-center gap-6 cursor-default ${cardClasses}`}
            >

                {/* Animated Icon */}
                <div className="relative">
                    <div className={`absolute inset-0 blur-xl rounded-full animate-pulse ${isVictory ? 'bg-yellow-500' : 'bg-red-600'}`} />
                    <div className={`relative w-32 h-32 rounded-full border-4 flex items-center justify-center bg-slate-900 shadow-2xl ${isVictory ? 'border-yellow-400 text-yellow-400' : 'border-red-500 text-red-500'}`}>
                        {isVictory ? (
                            <Trophy className="w-16 h-16 animate-bounce" style={{ animationDuration: '2s' }} />
                        ) : isDraw ? (
                            <span className="text-4xl font-bold">?</span>
                        ) : (
                            <Frown className="w-16 h-16" />
                        )}
                    </div>
                </div>

                {/* Title Text */}
                <div className="text-center space-y-2">
                    <h1 className={`text-6xl font-black tracking-tighter uppercase drop-shadow-2xl ${isVictory ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200' : 'text-red-500'}`}>
                        {isVictory ? 'MENANG!' : isDraw ? 'SERI' : 'KALAH...'}
                    </h1>
                    <p className="text-slate-400 text-lg font-medium tracking-wide">
                        {isVictory ? 'Tahniah! Strategi kimia anda berjaya.' : isDraw ? 'Pertarungan sengit! Tiada pemenang.' : 'Jangan putus asa. Cuba lagi!'}
                    </p>

                </div>

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onHome}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-105 border border-slate-700"
                    >
                        <Home className="w-5 h-5" />
                        Menu Utama
                    </button>

                    <button
                        onClick={onRestart}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-105 hover:scale-105 ${isVictory ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-orange-900/50' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-900/50'}`}
                    >
                        <RefreshCw className={`w-5 h-5 ${visible ? 'animate-spin-once' : ''}`} />
                        Main Semula
                    </button>
                </div>
            </div>
        </div>
    );
}
