
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
        <div className="bg-black/40 rounded-xl p-3 h-full overflow-y-auto border border-slate-800 font-mono text-xs space-y-1 scrollbar-thin" ref={scrollRef}>
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

export function PHMeterComponent({ makmalPH, calculationData, onAnimationComplete, onSelfApply }: { makmalPH: number, calculationData?: CalculationData | null, onAnimationComplete?: () => void, onSelfApply: (card: any, source: string, index: number) => void }) {
    const [displayedPH, setDisplayedPH] = React.useState(makmalPH);

    // Internal Queue System
    const [queue, setQueue] = React.useState<CalculationData[]>([]);
    const [playingData, setPlayingData] = React.useState<CalculationData | null>(null);
    const lastIngestedRef = useRef<string>("");

    // Ingest Prop Data into Queue with Deduplication
    useEffect(() => {
        if (calculationData && calculationData.id) {
            // Strict deduplication by ID
            if (calculationData.id !== lastIngestedRef.current) {
                lastIngestedRef.current = calculationData.id;
                setQueue(prev => [...prev, calculationData]);
            }
        }
    }, [calculationData]);

    // Smooth Transition Effect for pH Number
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            setDisplayedPH(prev => {
                const diff = makmalPH - prev;
                if (Math.abs(diff) < 0.01) return makmalPH; // Snap to target
                return prev + diff * 0.05; // Slower smooth ease-out (5% per frame)
            });
            if (Math.abs(makmalPH - displayedPH) >= 0.01) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        if (displayedPH !== makmalPH) {
            animationFrameId = requestAnimationFrame(animate);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [makmalPH, displayedPH]);

    const details = useMemo(() => getPHDetails(displayedPH), [displayedPH]);
    const percent = (displayedPH / 14) * 100;
    const [step, setStep] = React.useState(0);

    // Drag State with Latency
    const [isDragOver, setIsDragOver] = React.useState(false);
    const dragTimer = useRef<NodeJS.Timeout | null>(null);

    // Playback Loop
    useEffect(() => {
        // If not playing and have item in queue, start playing
        if (!playingData && queue.length > 0) {
            const next = queue[0];
            setPlayingData(next);
            setQueue(prev => prev.slice(1));
            setStep(0); // Reset for new animation
        }
    }, [queue, playingData]);

    // Animation Timings (2x Faster)
    useEffect(() => {
        if (!playingData) {
            setStep(0);
            return;
        }

        // [500, 1250, 2000, 2750] - Faster sequence
        const timings = [500, 1250, 2000, 2750];
        const timers = timings.map((t, i) => setTimeout(() => setStep(i + 1), t));

        const finalTimer = setTimeout(() => {
            setPlayingData(null); // Finish this item
            if (onAnimationComplete) onAnimationComplete();
        }, 4000); // 4s total duration (reduced from 8s)

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(finalTimer);
        };
    }, [playingData, onAnimationComplete]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragTimer.current) clearTimeout(dragTimer.current);
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        dragTimer.current = setTimeout(() => {
            setIsDragOver(false);
        }, 300); // 300ms latency to prevent jagginess
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragTimer.current) clearTimeout(dragTimer.current);
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            // Check if valid card for self-apply (Synthesis/Salt)
            if (data.card && (data.card.type === 'Sintesis' || data.card.type === 'Garam')) {
                onSelfApply(data.card, data.source, data.index);
            }
        } catch (err) { console.error('Drop error:', err); }
    };

    return (
        <>
            {/* GLOBAL OVERLAY FOR DRAG FEEDBACK */}
            {isDragOver && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-white/90 p-8 rounded-3xl shadow-2xl border-4 border-indigo-400 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                        <div className="bg-indigo-100 p-4 rounded-full">
                            <Activity className="w-12 h-12 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-indigo-800 mb-1">LEPASKAN!</h2>
                            <p className="text-lg font-bold text-indigo-600">Gunakan pada diri sendiri?</p>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`rounded-xl p-4 shadow-lg border text-slate-800 transition-all duration-300 ease-in-out relative
                    ${playingData ? 'min-h-[400px]' : 'min-h-min'} 
                    ${isDragOver ? 'bg-indigo-100 border-indigo-500 ring-4 ring-indigo-400/50 scale-[1.02]' : 'bg-white border-slate-200'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold flex items-center gap-2 text-indigo-700">
                        <Activity className="w-5 h-5" />
                        Meter pH Makmal
                    </h3>
                    <span className="text-xl font-black transition-colors duration-300" style={{ color: details.color }}>
                        pH {Number(details.clampedPH).toFixed(2)}
                    </span>
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
                <div className={`overflow-hidden transition-all duration-700 ease-in-out ${playingData ? 'max-h-[500px] opacity-100' : 'max-h-10'}`}>

                    {!playingData ? (
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
                                <p className="text-slate-500 text-[10px] mb-0.5">Langkah 1: Buffer</p>
                                <div className="bg-white p-1.5 rounded border-l-2 border-blue-400 shadow-sm">
                                    <code className="text-blue-700">{playingData.equation}</code>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className={`transition-all duration-500 delay-100 ${step >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                <p className="text-slate-500 text-[10px] mb-0.5">Langkah 2: pH Bahan</p>
                                <div className="bg-white p-1.5 rounded border-l-2 border-green-500 shadow-sm flex justify-between">
                                    <span className="text-green-700">{playingData.concentration}</span>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className={`transition-all duration-500 delay-200 ${step >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                                <p className="text-slate-500 text-[10px] mb-0.5">Langkah 3: Perubahan pH</p>
                                <div className="bg-white p-1.5 rounded border-l-2 border-yellow-500 shadow-sm space-y-1">
                                    <div className="text-slate-500">{playingData.formula}</div>
                                    {playingData.steps.map((s, i) => (
                                        <div key={i} className="text-slate-700 pl-2 border-l border-slate-200">{s}</div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className={`mt-2 pt-2 border-t border-slate-200 flex justify-between items-center transition-all duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="text-slate-400 font-bold uppercase text-[10px]">Jawapan Akhir</span>
                                <span className="text-xl font-black text-indigo-700">{playingData.finalResult}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-2 text-xs bg-slate-100 text-slate-600 p-2 rounded border border-slate-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" /><span>{details.effect}</span>
                </div>
            </div>
        </>
    );
}
// Removed standalone AnimatedPHDisplay

