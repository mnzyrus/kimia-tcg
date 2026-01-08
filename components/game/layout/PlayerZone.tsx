import React from 'react';
import { SkipForward, Layers } from 'lucide-react';
import { HPBar } from '../GameUI';
import { GameButton, DraggableCard, SynthesisZone, DefenseSlot, RecyclingZone } from '../CardComponents';
import { Player, Card } from '@/types';

interface PlayerZoneProps {
    player: Player;
    isMyTurn: boolean;
    isNarrow?: boolean;
    availableSynthesis: any[];
    onEndTurn: () => void;
    onDropToZone: (c: Card, s: string, i: number) => void;
    onClearSynthesis: () => void;
    onSynthesize: (c: Card, moleCost: number) => void;
    onMoveCardToHand: (i: number) => void;
    onNotify: (n: { message: string, type: 'info' | 'error' | 'success' }) => void;
    onAttack: (c: Card, i: number) => void;
    onSetTrap: (c: Card, s: string, i: number) => void;
    onRecycle: (c: Card, s: string, i: number) => void;
    onDrawCard: () => void;
}

export function PlayerZone({
    player,
    isMyTurn,
    isNarrow = false,
    availableSynthesis,
    onEndTurn,
    onDropToZone,
    onClearSynthesis,
    onSynthesize,
    onMoveCardToHand,
    onNotify,
    onAttack,
    onSetTrap,
    onRecycle,
    onDrawCard
}: PlayerZoneProps) {
    return (
        <div className={`${isNarrow ? 'flex-1 min-h-0' : 'min-h-[40%]'} bg-slate-900/30 border-t border-slate-800 p-4 flex flex-col gap-2 shrink-0`}>
            {/* 1. Header Row & HP */}
            <div className="flex justify-between items-end mb-2">
                <div className={`${isNarrow ? 'w-full max-w-[200px]' : 'w-72'}`}>
                    <HPBar
                        current={player.hp}
                        max={player.maxHP}
                        name={player.name}
                        activeBuffers={player.activeBuffers || []}
                        energy={player.currentE}
                        mass={player.currentM}
                        isOpponent={false}
                    />
                </div>
                <div className={`${isNarrow ? 'w-full max-w-[120px]' : 'w-auto'}`}>
                    <GameButton
                        onClick={onEndTurn}
                        disabled={!isMyTurn}
                        variant={isMyTurn ? 'primary' : 'disabled'}
                        className="bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/20"
                    >
                        <span className="flex items-center gap-2">
                            <SkipForward className="w-4 h-4" /> Tamatkan Giliran
                        </span>
                    </GameButton>
                </div>
            </div>

            {/* 2. Main Game Layout (Cols) */}
            <div className="flex gap-4 h-full relative">

                {/* Left: Synthesis Zone */}
                <div className={`${isNarrow ? 'w-1/4' : 'w-1/3 min-w-[280px]'}`}>
                    <SynthesisZone
                        cards={player.synthesisZone}
                        availableSynthesis={availableSynthesis}
                        onDrop={(c: Card, s: string, i: number) => onDropToZone(c, s, i)}
                        onMoveCardToHand={onMoveCardToHand}
                        onClear={onClearSynthesis}
                        onSynthesize={onSynthesize}
                        currentE={player.currentE}
                        currentM={player.currentM}
                        onNotify={onNotify}
                        isMyTurn={isMyTurn}
                    />
                </div>

                {/* Center: Hand (Fanned) */}
                <div className="flex-1 min-w-0 bg-slate-900/50 rounded-xl border border-slate-700 p-4 relative flex items-end justify-center overflow-visible perspective-[1000px] z-30">
                    {player.hand.length === 0 && <div className="text-slate-500 text-sm italic mb-12">Tiada kad di tangan...</div>}
                    <div className="relative h-32 w-full flex items-end justify-center">
                        {player.hand.map((card, idx) => {
                            const total = player.hand.length;
                            const center = (total - 1) / 2;

                            // Dynamic Spacing Logic to mimic fanning
                            const maxContainerWidth = isNarrow ? 200 : 350;
                            const preferredSpacing = 40;
                            let dynamicSpacing = preferredSpacing;
                            if (total > 1) {
                                const requiredWidth = (total - 1) * preferredSpacing;
                                if (requiredWidth > maxContainerWidth) {
                                    dynamicSpacing = maxContainerWidth / (total - 1);
                                }
                            }

                            const offset = idx - center;
                            const translateX = offset * dynamicSpacing;
                            // Parabolic arch: y = x^2 / K
                            const translateY = (translateX * translateX) / 600;
                            // Rotation
                            const rotate = translateX * 0.15;

                            return (
                                <div
                                    key={card.id || idx}
                                    className="absolute transition-all duration-300 hover:z-50 hover:!scale-125 hover:!-translate-y-20 origin-bottom shadow-2xl"
                                    style={{
                                        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
                                        zIndex: idx,
                                        bottom: isNarrow ? '20px' : '60px'
                                    }}
                                >
                                    <DraggableCard
                                        card={card}
                                        index={idx}
                                        source="hand"
                                        onMoveToHand={() => { }}
                                        playerE={player.currentE}
                                        playerM={player.currentM}
                                        isMyTurn={isMyTurn}
                                        onClick={() => {
                                            if (card.type === 'Element' || card.type === 'Taktikal' || card.symbol === 'CAT') {
                                                onNotify({ message: 'Seret kad ini ke Kebuk Sintesis untuk digabungkan.', type: 'info' });
                                            } else if (card.type === 'Sintesis' || card.type === 'Garam') {
                                                onNotify({ message: 'Dwiklik untuk Serang atau Seret ke Slot Pertahanan.', type: 'info' });
                                            }
                                        }}
                                        onDoubleClick={() => {
                                            // Double click to Attack
                                            if (card.type === 'Sintesis' || card.type === 'Garam') onAttack(card, idx);
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Actions Column (Defense, Recycle, Draw) */}
                <div className={`${isNarrow ? 'w-24' : 'w-32'} flex flex-col gap-2`}>
                    <DefenseSlot
                        trapCard={player.trapSlot}
                        isMyTurn={isMyTurn}
                        onDrop={(c: Card, s: string, i: number) => onSetTrap(c, s, i)}
                    />

                    <RecyclingZone
                        onDrop={onRecycle}
                        isMyTurn={isMyTurn}
                    />

                    {/* Logic for Draw Button matches restore point: onClick=handleDrawCard */}
                    <div
                        className={`flex-1 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group relative overflow-hidden select-none
                            ${(!isMyTurn || player.currentE < 1 || (player.drawCount || 0) >= 3) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                        `}
                        onClick={onDrawCard}
                    >
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Layers className="w-8 h-8 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-300">TARIK (+1)</span>
                        <div className="flex flex-col items-center mt-1">
                            <span className="text-[10px] text-blue-400 font-mono">-1 Tenaga</span>
                            <span className={`text-[10px] font-mono ${(player.drawCount || 0) >= 3 ? 'text-red-500' : 'text-slate-500'}`}>
                                Use: {player.drawCount || 0}/3
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
