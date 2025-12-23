
import React, { useMemo, useRef, useEffect } from 'react';
import { LogEntry, CalculationData } from '@/types';
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

export function PHMeterComponent({ makmalPH, calculationData, onAnimationComplete }: { makmalPH: number, calculationData?: CalculationData | null, onAnimationComplete?: () => void }) {
    const details = useMemo(() => getPHDetails(makmalPH), [makmalPH]);
    const percent = (makmalPH / 14) * 100;
    const [step, setStep] = React.useState(0);

    // Animation Logic
    useEffect(() => {
        if (!calculationData) {
            setStep(0);
            return;
        }

        const timings = [1000, 2500, 4000, 5500];
        const timers = timings.map((t, i) => setTimeout(() => setStep(i + 1), t));

        const finalTimer = setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
        }, 8000);

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(finalTimer);
        };
    }, [calculationData, onAnimationComplete]);

    return (
        <div className={`bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-slate-800 transition-all duration-500 ease-in-out ${calculationData ? 'min-h-[400px]' : 'min-h-min'}`}>
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
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-100 p-2 rounded border border-slate-200 mb-2">
                <div>[H⁺]: <span className="font-bold text-red-600">{details.hPlus}</span></div>
                <div className="text-right">[OH⁻]: <span className="font-bold text-blue-600">{details.ohMinus}</span></div>
            </div>

            {/* EXPANDABLE CALCULATION SECTION */}
            <div className={`overflow-hidden transition-all duration-700 ease-in-out ${calculationData ? 'max-h-[500px] opacity-100' : 'max-h-10'}`}>

                {!calculationData ? (
                    <div className="text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-200 flex items-center gap-2">
                        <Calculator className="w-3 h-3 mr-1" /><span>Formula: pH = -log[H⁺]</span>
                    </div>
                ) : (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3 font-mono text-xs">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold border-b border-slate-200 pb-1 mb-2">
                            <Calculator className="w-3 h-3" />
                            <span>Pengiraan pH</span>
                            {/* Progress Dots */}
                            <div className="flex gap-1 ml-auto">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${step >= i ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Step 1 */}
                        <div className={`transition-all duration-500 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                            <p className="text-slate-500 text-[10px] mb-0.5">Langkah 1: Persamaan</p>
                            <div className="bg-white p-1.5 rounded border-l-2 border-blue-400 shadow-sm">
                                <code className="text-blue-700">{calculationData.equation}</code>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className={`transition-all duration-500 delay-100 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                            <p className="text-slate-500 text-[10px] mb-0.5">Langkah 2: Kepekatan</p>
                            <div className="bg-white p-1.5 rounded border-l-2 border-green-500 shadow-sm flex justify-between">
                                <span className="text-green-700">{calculationData.concentration}</span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`transition-all duration-500 delay-200 ${step >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                            <p className="text-slate-500 text-[10px] mb-0.5">Langkah 3: Kira</p>
                            <div className="bg-white p-1.5 rounded border-l-2 border-yellow-500 shadow-sm space-y-1">
                                <div className="text-slate-500">{calculationData.formula}</div>
                                {calculationData.steps.map((s, i) => (
                                    <div key={i} className="text-slate-700 pl-2 border-l border-slate-200">{s}</div>
                                ))}
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className={`mt-2 pt-2 border-t border-slate-200 flex justify-between items-center transition-all duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-slate-400 font-bold uppercase text-[10px]">Jawapan</span>
                            <span className="text-xl font-black text-indigo-700">{calculationData.finalResult}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-2 text-xs bg-slate-100 text-slate-600 p-2 rounded border border-slate-200 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 flex-shrink-0" /><span>{details.effect}</span>
            </div>
        </div>
    );
}
// Removed standalone AnimatedPHDisplay

