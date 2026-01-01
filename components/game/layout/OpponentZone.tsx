import React from 'react';
import { HPBar } from '../GameUI';
import { Player } from '@/types';

interface OpponentZoneProps {
    opponent: Player;
}

export function OpponentZone({ opponent }: OpponentZoneProps) {
    return (
        <div className="min-h-[25%] p-4 flex items-start justify-center relative border-b border-slate-800/50 shrink-0">
            <div className="absolute top-4 left-4 w-64 z-20">
                <HPBar
                    current={opponent.hp}
                    max={opponent.maxHP}
                    name={opponent.name}
                    isOpponent={true}
                    energy={opponent.currentE}
                    mass={opponent.currentM}
                />
            </div>
            <div className="relative w-full max-w-2xl h-32 flex items-center justify-center mt-4">
                {Array.from({ length: opponent.hand.length }).map((_, i) => {
                    const total = opponent.hand.length;
                    const center = (total - 1) / 2;
                    const offset = i - center;
                    // Constrain width: Max 40px spacing, reduce if too many cards
                    const maxSpread = 600; // px
                    let spacing = 40;
                    if (total > 1) {
                        const required = (total - 1) * 40;
                        if (required > maxSpread) spacing = maxSpread / (total - 1);
                    }
                    const tx = offset * spacing;
                    const ty = Math.abs(offset) * 2; // Slight arch

                    return (
                        <div
                            key={i}
                            className="absolute w-20 h-28 bg-slate-800 rounded-lg border border-slate-700 shadow-xl transition-all"
                            style={{
                                transform: `translateX(${tx}px) translateY(${ty}px)`,
                                zIndex: i
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
