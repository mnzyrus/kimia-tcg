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
        <div className={`min-h-[40%] bg-slate-900/30 border-t border-slate-800 p-4 flex flex-col gap-2 shrink-0`}>
            {/* HP Bar & End Turn */}
            <div className="flex justify-between items-end mb-2">
                <div className="w-72">
                    <HPBar
                        current={player.hp}
                        max={player.maxHP}
                        name={player.name}
                        isOpponent={false}
                        energy={player.currentE}
                        mass={player.currentM}
                    />
                </div>
                <GameButton
                    onClick={onEndTurn}
                    disabled={!isMyTurn}
                    variant="primary"
                    className="bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/20"
                >
                    <SkipForward className="w-4 h-4 mr-2" /> Tamatkan Giliran
                </GameButton>
            </div>

            {isNarrow ? (
                // NARROW MODE
                <div className="flex flex-col gap-4 w-full h-full">
                    {/* Top Row: Synthesis (Flex) + Right Panel (Fixed) */}
                    <div className="flex w-full gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <SynthesisZone
                                cards={player.synthesisZone}
                                availableSynthesis={availableSynthesis}
                                onDrop={(c: Card, s: string, i: number) => onDropToZone(c, s as 'hand' | 'synthesisZone', i)}
                                onClear={onClearSynthesis}
                                onSynthesize={onSynthesize}
                                currentE={player.currentE}
                                currentM={player.currentM}
                                onMoveCardToHand={onMoveCardToHand}
                                onNotify={onNotify}
                            />
                        </div>
                        <div className="w-32 flex flex-col gap-2">
                            <DefenseSlot
                                trapCard={player.trapSlot}
                                onDrop={(c: Card, s: string, i: number) => onSetTrap(c, s, i)}
                                label="SLOT PERTAHANAN"
                            />
                            <RecyclingZone
                                onDrop={(c: Card, s: 'hand', i: number) => onRecycle(c, s, i)}
                            />
                            <div
                                className={`flex-1 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group relative overflow-hidden ${!isMyTurn || player.currentE < 1 || (player.drawsThisTurn || 0) >= 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                onClick={onDrawCard}
                            >
                                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Layers className="w-8 h-8 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-300">TARIK (+1)</span>
                                <div className="flex flex-col items-center mt-1">
                                    <span className="text-[10px] text-blue-400 font-mono">-1 Tenaga</span>
                                    <span className={`text-[10px] font-mono ${(player.drawsThisTurn || 0) >= 3 ? 'text-red-500' : 'text-slate-500'}`}>Use: {player.drawsThisTurn || 0}/3</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Hand (Full Width) */}
                    <div className="flex-1 min-h-[140px] bg-slate-900/50 rounded-xl border border-slate-700 p-2 relative flex items-end justify-center overflow-visible perspective-[1000px] z-50">
                        {player.hand.length === 0 && <div className="text-slate-500 text-sm italic mb-12">Tiada kad di tangan...</div>}

                        {/* Static Scaled Hand Container */}
                        <div className="relative h-28 w-full flex items-end justify-center scale-90 origin-bottom transition-transform duration-300">
                            {player.hand.map((card, i) => {
                                const total = player.hand.length;
                                const center = (total - 1) / 2;
                                const maxContainerWidth = 600; // Wider space for stacking
                                const preferredSpacing = 35; // Tighter spacing

                                let dynamicSpacing = preferredSpacing;
                                if (total > 1) {
                                    const requiredWidth = (total - 1) * preferredSpacing;
                                    if (requiredWidth > maxContainerWidth) {
                                        dynamicSpacing = maxContainerWidth / (total - 1);
                                    }
                                }

                                const offset = i - center;
                                const translateX = offset * dynamicSpacing;
                                const rotate = translateX * 0.10;

                                return (
                                    <div
                                        key={card.id || i}
                                        className="absolute transition-all duration-300 hover:z-50 hover:scale-110 hover:-translate-y-4 origin-bottom shadow-2xl"
                                        style={{
                                            transform: `translateX(${translateX}px) translateY(${Math.abs(rotate) * 1.5}px) rotate(${rotate}deg)`,
                                            zIndex: i + 10,
                                            bottom: '40px'
                                        }}
                                    >
                                        <DraggableCard
                                            card={card}
                                            index={i}
                                            source="hand"
                                            playerE={player.currentE} // Use actual energy
                                            onDoubleClick={() => {
                                                if (card.type === 'Sintesis' || card.type === 'Garam') onAttack(card, i);
                                            }}
                                            onClick={() => {
                                                if (card.type === 'Element' || card.type === 'Taktikal' || card.symbol === 'CAT') {
                                                    onNotify({ message: 'Seret kad ini ke Kebuk Sintesis untuk digabungkan.', type: 'info' });
                                                } else if (card.type === 'Sintesis' || card.type === 'Garam') {
                                                    onNotify({ message: 'Dwiklik untuk Serang atau Seret ke Slot Pertahanan.', type: 'info' });
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                // STANDARD LAYOUT
                <div className="flex gap-4 h-full">
                    {/* Synthesis Zone */}
                    <div className="w-1/3 min-w-[280px]">
                        <SynthesisZone
                            cards={player.synthesisZone}
                            availableSynthesis={availableSynthesis}
                            onDrop={(c: Card, s: string, i: number) => onDropToZone(c, s as 'hand' | 'synthesisZone', i)}
                            onClear={onClearSynthesis}
                            onSynthesize={onSynthesize}
                            currentE={player.currentE}
                            currentM={player.currentM}
                            onMoveCardToHand={onMoveCardToHand}
                            onNotify={onNotify}
                        />
                    </div>

                    {/* Hand */}
                    <div className="flex-1 min-w-0 bg-slate-900/50 rounded-xl border border-slate-700 p-4 relative flex items-end justify-center overflow-visible perspective-[1000px] sticky bottom-2 z-50">
                        {player.hand.length === 0 && <div className="text-slate-500 text-sm italic mb-12">Tiada kad di tangan...</div>}
                        <div className="relative h-32 w-full flex items-end justify-center">
                            {player.hand.map((card, i) => {
                                const total = player.hand.length;
                                const center = (total - 1) / 2;
                                const maxContainerWidth = 350;
                                const preferredSpacing = 40;

                                let dynamicSpacing = preferredSpacing;
                                if (total > 1) {
                                    const requiredWidth = (total - 1) * preferredSpacing;
                                    if (requiredWidth > maxContainerWidth) {
                                        dynamicSpacing = maxContainerWidth / (total - 1);
                                    }
                                }

                                const offset = i - center;
                                const translateX = offset * dynamicSpacing;
                                const translateY = (translateX * translateX) / 600;
                                const rotate = translateX * 0.15;

                                return (
                                    <div
                                        key={card.id || i}
                                        className="absolute transition-all duration-300 hover:z-50 hover:!scale-125 hover:!-translate-y-20 origin-bottom shadow-2xl"
                                        style={{
                                            transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`,
                                            zIndex: i,
                                            bottom: '60px',
                                        }}
                                    >
                                        <DraggableCard
                                            card={card}
                                            index={i}
                                            source="hand"
                                            playerE={player.currentE}
                                            onDoubleClick={() => {
                                                if (card.type === 'Sintesis' || card.type === 'Garam') onAttack(card, i);
                                            }}
                                            onClick={() => {
                                                if (card.type === 'Element' || card.type === 'Taktikal' || card.symbol === 'CAT') {
                                                    onNotify({ message: 'Seret kad ini ke Kebuk Sintesis untuk digabungkan.', type: 'info' });
                                                } else if (card.type === 'Sintesis' || card.type === 'Garam') {
                                                    onNotify({ message: 'Dwiklik untuk Serang atau Seret ke Slot Pertahanan.', type: 'info' });
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="w-32 flex flex-col gap-2">
                        <DefenseSlot
                            trapCard={player.trapSlot}
                            onDrop={(c: Card, s: string, i: number) => onSetTrap(c, s, i)}
                            label="SLOT PERTAHANAN"
                        />
                        <RecyclingZone
                            onDrop={(c: Card, s: 'hand', i: number) => onRecycle(c, s, i)}
                        />
                        <div
                            className={`flex-1 bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group relative overflow-hidden ${!isMyTurn || player.currentE < 1 || (player.drawsThisTurn || 0) >= 3 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            onClick={onDrawCard}
                        >
                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Layers className="w-8 h-8 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-slate-300">TARIK (+1)</span>
                            <div className="flex flex-col items-center mt-1">
                                <span className="text-[10px] text-blue-400 font-mono">-1 Tenaga</span>
                                <span className={`text-[10px] font-mono ${(player.drawsThisTurn || 0) >= 3 ? 'text-red-500' : 'text-slate-500'}`}>Use: {player.drawsThisTurn || 0}/3</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
