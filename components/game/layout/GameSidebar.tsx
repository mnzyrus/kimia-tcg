import { ScrollText } from 'lucide-react';
import { PHMeter } from '../PHMeter';
import { ActionLog } from '../GameUI';
import { LogEntry, Card } from '@/types'; // Fixed imports

interface GameSidebarProps {
    playerPH: number;
    onSelfApply: (card: Card, source: string, index: number) => void;
    gameLog: LogEntry[];
    myId: string;
    isNarrow?: boolean; // Legacy prop, kept for compatibility but largely superseded by mode
    // [NEW] Props for Drawer Mode
    mode?: 'sidebar' | 'drawer';
    isOpen?: boolean;
    onClose?: () => void;
}

export function GameSidebar({
    playerPH,
    onSelfApply,
    gameLog,
    myId,
    isNarrow = false
}: GameSidebarProps) {
    return (
        <aside className={`${isNarrow ? 'w-full h-auto border-b flex-row items-start' : 'w-64 lg:w-80 border-r flex-col h-full'} bg-slate-900/50 border-slate-800 p-2 lg:p-3 flex gap-2 lg:gap-4 z-10 backdrop-blur-sm shrink-0 transition-all`}>
            <div className={`${isNarrow ? 'flex-1 min-w-0' : ''}`}>
                <PHMeter
                    makmalPH={playerPH}
                    onSelfApply={onSelfApply}
                />
            </div>

            <div className={`flex flex-col min-h-0 bg-black/20 rounded-xl p-2 border border-slate-800/50 ${isNarrow ? 'flex-1 h-44' : 'h-48 lg:h-60 w-full'} overflow-hidden shrink-0`}>
                <h3 className="font-bold text-slate-400 text-xs mb-1 flex items-center gap-2">
                    <ScrollText className="w-4 h-4" /> {isNarrow ? 'Log' : 'Log Pertarungan'}
                </h3>
                <ActionLog actions={gameLog} myId={myId} />
            </div>


        </aside>
    );
}
