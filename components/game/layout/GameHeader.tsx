import React from 'react';
import { FlaskConical, Clock, BookOpen, Sparkles, HelpCircle } from 'lucide-react';
import { GameButton } from '../CardComponents';

interface GameHeaderProps {
    turnNumber: number;
    isMyTurn: boolean;
    onPause: () => void;
    onShowLibrary: () => void;
    onShowAskChemist: () => void;
    onShowTutorial: () => void;
}

export function GameHeader({
    turnNumber,
    isMyTurn,
    onPause,
    onShowLibrary,
    onShowAskChemist,
    onShowTutorial
}: GameHeaderProps) {
    return (
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-lg relative shrink-0">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={onPause}>
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <h1 className="font-black text-xl tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    KIMIA TCG
                </h1>
                <span className="text-xs font-mono text-slate-500 ml-2">v2.0</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-4 mr-4 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>GILIRAN {turnNumber}</span>
                    </div>
                    <div className={`font-bold uppercase ${isMyTurn ? 'text-green-400' : 'text-red-400'}`}>
                        {isMyTurn ? 'GILIRAN ANDA' : 'GILIRAN LAWAN'}
                    </div>
                </div>
                <GameButton onClick={onShowLibrary} variant="outline" className="text-xs py-1.5 h-8">
                    <BookOpen className="w-4 h-4 mr-1" /> Perpustakaan
                </GameButton>
                <GameButton onClick={onShowAskChemist} variant="outline" className="text-xs py-1.5 h-8">
                    <Sparkles className="w-4 h-4 mr-1" /> Tanya AI
                </GameButton>
                <GameButton onClick={onShowTutorial} variant="outline" className="text-xs py-1.5 h-8">
                    <HelpCircle className="w-4 h-4 mr-1" /> Tutorial
                </GameButton>
            </div>
        </header>
    );
}
