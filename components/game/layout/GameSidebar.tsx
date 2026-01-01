import React from 'react';
import { ScrollText } from 'lucide-react';
import { PHMeter } from '../PHMeter';
import { ActionLog } from '../GameUI';
import { LogEntry } from '@/types';

interface GameSidebarProps {
    playerPH: number;
    onSelfApply: (card: any, source: string, index: number) => void;
    gameLog: LogEntry[];
    myId: string;
    isNarrow?: boolean;
}

export function GameSidebar({
    playerPH,
    onSelfApply,
    gameLog,
    myId,
    isNarrow = false
}: GameSidebarProps) {
    return (
        <aside className={`${isNarrow ? 'w-full h-auto border-b flex-row items-stretch' : 'w-80 border-r flex-col h-full'} bg-slate-900/50 border-slate-800 p-2 flex gap-4 z-10 backdrop-blur-sm shrink-0 transition-all`}>
            <div className={`${isNarrow ? 'scale-90 origin-left' : ''}`}>
                <PHMeter
                    makmalPH={playerPH}
                    onSelfApply={onSelfApply}
                />
            </div>

            <div className={`flex-1 flex flex-col min-h-0 bg-black/20 rounded-xl p-2 border border-slate-800/50 ${isNarrow ? 'h-24 overflow-hidden' : ''}`}>
                <h3 className="font-bold text-slate-400 text-xs mb-1 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" /> {isNarrow ? 'Log' : 'Log Pertarungan'}
                </h3>
                <ActionLog actions={gameLog} myId={myId} />
            </div>
        </aside>
    );
}
