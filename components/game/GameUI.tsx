
import React, { useMemo, useRef, useEffect } from 'react';
import { LogEntry } from '@/types';
import { Eye, EyeOff, Zap, Beaker, Heart, Calculator, Activity, Lightbulb } from 'lucide-react';
import { PH_COLOR_MAP } from '@/lib/gameData';
import { getPHDetails } from '@/lib/gameLogic';

export function HPBar({ current, max, name, isOpponent, energy, mass }: any) {
    return (
        <div className={`p-3 rounded-xl border ${isOpponent ? 'bg-red-950/30 border-red-900/50' : 'bg-blue-950/30 border-blue-900/50'}`}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    {isOpponent ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-blue-400" />}
                    <span className="font-bold text-white">{name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center text-yellow-400"><Zap className="w-3 h-3 mr-1" /> {isOpponent ? '?' : energy}</div>
                    <div className="flex items-center text-blue-400"><Beaker className="w-3 h-3 mr-1" /> {isOpponent ? '?' : mass}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-500" />
                <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                    <div className="h-full bg-green-600 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, (current / max) * 100))}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{current}/{max}</span>
                </div>
            </div>
        </div>
    );
}

export function ActionLog({ actions, myId }: { actions: LogEntry[], myId: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [actions]);
    return (
        <div className="bg-black/40 rounded-xl p-3 h-40 overflow-y-auto border border-slate-800 font-mono text-xs space-y-1 scrollbar-thin" ref={scrollRef}>
            {actions.map((log) => {
                const isMe = log.actorId === myId;
                const isSystem = log.actorId === 'system';
                // If it's me, show private. If system, show public (or private, usually same). Else show public (opponent view).
                const displayMsg = isSystem ? log.publicMsg : (isMe ? log.privateMsg : log.publicMsg);

                return (
                    <div key={log.id} className={`flex gap-2 mb-1 border-l-2 pl-2 ${isSystem ? 'border-yellow-500 text-yellow-200' : (isMe ? 'border-blue-500 text-blue-200' : 'border-red-500 text-red-200')}`}>
                        <span className="text-slate-500 font-bold opacity-50">[T{log.turn}]</span>
                        <span>{displayMsg || log.message}</span>
                        {log.calculation && isMe && <span className="block text-yellow-400 font-mono text-[10px] ml-8">{log.calculation}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export function PHMeterComponent({ makmalPH }: { makmalPH: number }) {
    const details = useMemo(() => getPHDetails(makmalPH), [makmalPH]);
    const percent = (makmalPH / 14) * 100;
    return (
        <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-slate-800">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold flex items-center gap-2 text-indigo-700"><Activity className="w-5 h-5" /> Meter pH Makmal</h3>
                <span className="text-xl font-black" style={{ color: details.color }}>pH {details.clampedPH}</span>
            </div>
            <div className="relative h-6 w-full rounded-full overflow-hidden border border-slate-300 mb-2">
                <div className="absolute inset-0 w-full h-full flex">
                    {PH_COLOR_MAP.map((seg, i) => (<div key={i} style={{ backgroundColor: seg.color, flex: 1 }} />))}
                </div>
                <div className="absolute top-0 bottom-0 w-1 bg-black border-x border-white transition-all duration-500" style={{ left: `${percent}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-100 p-2 rounded border border-slate-200">
                <div>[H⁺]: <span className="font-bold text-red-600">{details.hPlus}</span></div>
                <div className="text-right">[OH⁻]: <span className="font-bold text-blue-600">{details.ohMinus}</span></div>
            </div>
            <div className="mt-2 text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-200 flex items-center gap-2">
                <Calculator className="w-3 h-3 mr-1" /><span>Formula: pH = -log[H⁺]</span>
            </div>
            <div className="mt-1 text-xs bg-slate-100 text-slate-600 p-2 rounded border border-slate-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 flex-shrink-0" /><span>{details.effect}</span>
            </div>
        </div>
    );
}
