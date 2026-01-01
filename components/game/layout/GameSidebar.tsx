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
}

export function GameSidebar({
    playerPH,
    onSelfApply,
    gameLog,
    myId
}: GameSidebarProps) {
    return (
        <aside className="w-80 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col gap-4 z-10 backdrop-blur-sm shrink-0">
            <PHMeter
                makmalPH={playerPH}
                onSelfApply={onSelfApply}
            />
            <div className="flex-1 flex flex-col min-h-0 bg-black/20 rounded-xl p-2 border border-slate-800/50">
                <h3 className="font-bold text-slate-400 text-xs mb-2 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" /> Log Pertarungan
                </h3>
                <ActionLog actions={gameLog} myId={myId} />
            </div>
        </aside>
    );
}
