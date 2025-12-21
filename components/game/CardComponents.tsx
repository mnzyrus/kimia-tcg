import React, { useState, useMemo } from 'react';
import { Card } from '@/types';
import { X, FlaskConical, ArrowDownToLine, Shield, Recycle } from 'lucide-react';

// Legacy Button was weird. I'll use standard HTML button or migrate the legacy Button if I want to match style exactly.
// I'll create a local Button for now or use the one from 'components/ui/button' if I had shadcn. I haven't installed shadcn.
// I'll copy the Button component from legacy App.tsx into a shared file or inline here for now.
// Actually, better to make a shared Button component in `components/ui/Button.tsx`.

// Re-implementing the simple Legacy Button here to avoid dependency hell for now
export function GameButton({ children, onClick, variant = 'primary', className = '', disabled = false }: any) {
    const variants: any = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        success: "bg-green-600 hover:bg-green-700 text-white shadow-lg",
        outline: "border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
    };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
}

export function DraggableCard({ card, index, source, onMoveToHand, isSelected, onClick, onDoubleClick, playerE = 0, playerM = 0 }: any) {
    const [isDragging, setIsDragging] = useState(false);

    const isAffordable = useMemo(() => {
        if (source === 'hand') {
            if (card.type === 'Sintesis' || card.type === 'Garam' || card.type === 'Compound') return playerE >= 1; // Simplification? Legacy code said playerE >= 1. 2240 says "if from hand... if (attacker.currentE < cost) ...". The visual check was just ">= 1" for synthesis type in `DraggableCard` logic (line 1240).
            // Wait, line 1240: if (card.type === 'Sintesis'...) return playerE >= 1; -> This seems like a visual indicator logic.
            if (card.type === 'Taktikal') return playerE >= (card.eCost || 0);
            return true;
        }
        return true;
    }, [playerE, card, source]);

    const opacityClass = (source === 'hand' && !isAffordable) ? 'opacity-60 brightness-75' : 'opacity-100';

    const getTypeColor = () => {
        switch (card.sintesisType) {
            case 'Asid': return 'border-red-500 bg-red-950/90';
            case 'Bes': return 'border-blue-500 bg-blue-950/90';
            case 'Amfoterik': return 'border-purple-500 bg-purple-950/90';
            default:
                if (card.type === 'Element') return 'border-amber-500 bg-amber-950/90';
                if (card.type === 'Taktikal') return 'border-violet-500 bg-violet-950/90';
                if (card.type === 'Garam') return 'border-emerald-500 bg-emerald-950/90';
                return 'border-slate-500 bg-slate-900';
        }
    };

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'card', card, source, index }));
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={() => setIsDragging(false)}
            onClick={onClick}
            onDoubleClick={onDoubleClick || (() => onMoveToHand && onMoveToHand(index))}
            className={`relative w-24 h-36 rounded-lg border-2 p-2 flex flex-col justify-between select-none cursor-grab active:cursor-grabbing transition-all hover:scale-105 shadow-lg ${getTypeColor()} ${opacityClass} ${isDragging ? 'opacity-0' : ''}`}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-[10px] font-bold leading-tight text-white truncate w-14 m-0">{card.name}</h3>
                <div className="flex flex-col items-end gap-0.5">
                    {card.type !== 'Element' && <span className="text-[9px] font-mono bg-black/40 px-1 rounded text-yellow-400">{source === 'hand' && (card.type === 'Sintesis' || card.type === 'Garam') ? '1' : card.eCost || 0}E</span>}
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center"><span className="text-3xl font-black text-white/20 font-mono">{card.symbol || '?'}</span></div>
            <div className="space-y-1">
                <p className="text-[8px] text-gray-300 line-clamp-2 leading-tight m-0">{card.description}</p>
                <div className="flex justify-between items-center pt-1 border-t border-white/10">
                    <span className="text-[8px] text-white bg-white/10 px-1 rounded">{card.type}</span>
                    {card.type !== 'Element' && card.mCost ? <span className="text-[8px] text-blue-300">{card.mCost}M</span> : null}
                </div>
            </div>
            {source === 'synthesisZone' && (<div className="absolute -top-2 -right-2 z-20 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all" onClick={(e) => { e.stopPropagation(); if (onMoveToHand) onMoveToHand(index); }} title="Ambil semula"><X className="w-3 h-3" /></div>)}
        </div>
    );
}

export function SynthesisZone({ cards, availableSynthesis, onDrop, onClear, onSynthesize, currentE, currentM, onMoveCardToHand, onNotify }: any) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.type === 'card' && (data.card.type === 'Element' || data.card.type === 'Taktikal') && data.source === 'hand') {
                onDrop(data.card, data.source, data.index);
            }
        } catch (err) { console.error(err); }
    };

    const safeHandleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.card.type === 'Element' || data.card.type === 'Taktikal') {
                onDrop(data.card, data.source, data.index);
            }
        } catch (err) { }
    };

    return (
        <div className={`bg-slate-900/80 border-2 border-dashed rounded-xl p-4 transition-all flex flex-col gap-4 min-h-[250px] ${isDragOver ? 'border-green-400 bg-green-900/20' : 'border-slate-600'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={safeHandleDrop}>
            <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h3 className="font-bold text-purple-300 flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Kebuk Sintesis</h3>
                {cards.length > 0 && (<button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"><X className="w-3 h-3" /> Reset</button>)}
            </div>
            <div className="flex-1 grid grid-cols-4 content-start gap-1 z-10 min-h-[150px]">
                {cards.length === 0 && (
                    <div className="col-span-4 w-full h-32 flex flex-col items-center justify-center text-slate-600 animate-pulse">
                        <ArrowDownToLine className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Seret kad Elemen atau Mangkin ke sini</p>
                    </div>
                )}
                {cards.map((card: Card, i: number) => (
                    <div key={i} className="relative group scale-75 origin-top-left w-24 h-36">
                        <DraggableCard card={card} index={i} source="synthesisZone" onMoveToHand={onMoveCardToHand} playerE={99} playerM={99} />
                    </div>
                ))}
            </div>
            <div className="z-10 space-y-2">
                {availableSynthesis.map((recipe: any) => {
                    const moleCost = recipe.moleCost;
                    const energyCost = recipe.card.eCost || 0;

                    // NEW: Catalyst Discount Display Logic
                    const catalystInZone = cards.some((c: Card) => c.symbol === 'CAT');
                    const finalECost = catalystInZone ? Math.max(0, energyCost - 2) : energyCost;

                    const hasEnergy = currentE >= finalECost;
                    const hasMole = currentM >= moleCost;
                    const canAfford = hasEnergy && hasMole;

                    const handleAttemptSynthesize = () => {
                        if (canAfford) {
                            onSynthesize(recipe.card, recipe.moleCost);
                        } else {
                            if (!hasEnergy && !hasMole) {
                                onNotify({ message: `Tak cukup Tenaga (${finalECost}E) dan Jisim (${moleCost}M)!`, type: 'error' });
                            } else if (!hasEnergy) {
                                onNotify({ message: `Tak cukup Tenaga! Perlu ${finalECost}E (Ada ${currentE}E).`, type: 'error' });
                            } else {
                                onNotify({ message: `Tak cukup Jisim! Perlu ${moleCost}M (Ada ${currentM}M).`, type: 'error' });
                            }
                            // soundManager.playSFX('error');
                        }
                    };

                    return (
                        <GameButton
                            key={recipe.card.id}
                            onClick={handleAttemptSynthesize}
                            variant={canAfford ? 'success' : 'outline'}
                            className={`w-full justify-between ${!canAfford ? 'opacity-70 border-red-500/50 text-slate-400 bg-slate-800/50 hover:bg-slate-800/80' : ''}`}
                        >
                            <span className="font-bold text-sm">{recipe.card.name}</span>
                            <div className="flex gap-2 text-xs font-mono">
                                <span className={hasEnergy ? (catalystInZone ? "text-green-400 font-bold" : "text-white") : "text-red-500"}>{finalECost}E</span>
                                <span className={hasMole ? "text-white" : "text-red-500"}>{moleCost}M</span>
                            </div>
                        </GameButton>
                    );
                })}
            </div>
        </div>
    );
}

export function DefenseSlot({ trapCard, onDrop, label = "Slot Pertahanan" }: any) {
    const [isOver, setIsOver] = useState(false);
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsOver(false); try { const data = JSON.parse(e.dataTransfer.getData('application/json')); if (data.card.type === 'Sintesis' || data.card.type === 'Garam') onDrop(data.card, data.source, data.index); } catch (err) { } };
    return (
        <div className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden transition-colors ${isOver ? 'border-yellow-400 bg-yellow-900/20' : 'border-slate-700 bg-slate-900/50'}`} onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} onDragLeave={() => setIsOver(false)} onDrop={handleDrop}>
            {trapCard ? (
                <div className="w-full h-full bg-yellow-900/40 flex items-center justify-center text-yellow-400 font-bold border-2 border-yellow-600 rounded-xl animate-pulse flex-col text-center p-1">
                    <Shield className="w-6 h-6 mb-1" />
                    <span className="text-xs leading-tight">{trapCard.name}</span>
                    <span className="text-[9px] mt-1 opacity-80">AKTIF</span>
                </div>
            ) : (
                <div className="text-slate-600 text-xs flex flex-col items-center">
                    <Shield className="w-6 h-6 mb-1" />
                    <span>{label}</span>
                    <span className="text-[9px]">(Letak Produk/Perangkap)</span>
                </div>
            )}
        </div>
    );
}

export function RecyclingZone({ onDrop }: any) {
    const [isOver, setIsOver] = useState(false);
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsOver(false); try { const data = JSON.parse(e.dataTransfer.getData('application/json')); if (data.source === 'hand') onDrop(data.card, data.source, data.index); } catch (err) { } };
    return (
        <div className={`w-full h-24 border-2 border-dashed rounded-xl flex items-center justify-center relative overflow-hidden transition-colors mt-2 ${isOver ? 'border-green-400 bg-green-900/20' : 'border-slate-700 bg-slate-900/50'}`} onDragOver={(e) => { e.preventDefault(); setIsOver(true); }} onDragLeave={() => setIsOver(false)} onDrop={handleDrop}>
            <div className="text-slate-500 text-xs flex flex-col items-center"><Recycle className="w-6 h-6 mb-1 text-green-500" /><span>Mesin Kitar Semula</span><span className="text-[9px]">(Buang Kad = Dapat Tenaga)</span></div>
        </div>
    );
}
