import React, { useState, useEffect } from 'react';
import { GameButton } from './CardComponents';
import { Trophy, Skull } from 'lucide-react';

export function StartTurnOverlay({ turn, isMyTurn }: { turn: number, isMyTurn: boolean }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (turn > 0) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsVisible(false), 2200);
            return () => clearTimeout(timer);
        }
    }, [turn]);

    if (!isVisible || turn <= 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="bg-black/60 absolute inset-0 animate-out fade-out duration-500 delay-[1500ms] fill-mode-forwards" />

            {/* Main Banner Container - Fades in quickly */}
            <div className="bg-slate-900/90 border-y-4 border-blue-500 py-12 w-full text-center relative z-10 shadow-2xl flex flex-col items-center justify-center animate-out fade-out slide-out-to-right duration-300 delay-[1800ms] fill-mode-forwards">

                {/* BIG WORD: From Left -> Right (Fast) */}
                <h2 className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-in slide-in-from-left-[100vw] duration-300 ease-out">
                    GILIRAN {turn}
                </h2>

                {/* LOWER WORD: From Right -> Left (Opposite) */}
                <div className={`mt-4 text-3xl font-bold uppercase tracking-widest ${isMyTurn ? 'text-green-400' : 'text-red-400'} animate-in slide-in-from-right-[100vw] duration-300 ease-out delay-75`}>
                    {isMyTurn ? "BAIK, GILIRAN ANDA!" : "GILIRAN LAWAN Sedang Berfikir..."}
                </div>
            </div>
        </div>
    );
}

export function GameOverOverlay({ winner, myRole, onExit }: { winner: 'player1' | 'player2', myRole: string, onExit: () => void }) {
    const isWin = winner === myRole;
    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in zoom-in duration-300">
            <div className={`w-full max-w-lg p-8 rounded-3xl border-4 ${isWin ? 'border-yellow-500 bg-yellow-900/20' : 'border-red-600 bg-red-900/20'} text-center shadow-2xl relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        {isWin ? <Trophy className="w-24 h-24 text-yellow-500 animate-bounce" /> : <Skull className="w-24 h-24 text-red-500 animate-pulse" />}
                    </div>
                    <h2 className={`text-6xl font-black mb-2 ${isWin ? 'text-yellow-400' : 'text-red-500'}`}>
                        {isWin ? 'MENANG!' : 'KALAH...'}
                    </h2>
                    <p className="text-xl text-slate-300 mb-8 font-mono">
                        {isWin ? 'Tahniah! Strategi kimia anda berjaya.' : 'Makmal anda telah musnah.'}
                    </p>
                    <GameButton onClick={onExit} className="w-full py-4 text-xl justify-center">
                        KEMBALI KE MENU
                    </GameButton>
                </div>
            </div>
        </div>
    );
}
