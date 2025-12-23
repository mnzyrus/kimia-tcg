
import React from 'react';
import { VisualEffect } from '@/types';
import { Sparkles, Skull } from 'lucide-react';

export function VisualEffectsLayer({ effects, currentPH = 7.0 }: { effects: VisualEffect[], currentPH?: number }) {

    // --- pH VIGNETTE LOGIC ---
    let vignetteColor = 'transparent'; // Default
    let opacity = 0;
    let isCritical = false;

    // Acidic Range (pH < 4) -> Red
    if (currentPH < 4.0) {
        vignetteColor = 'rgba(220, 38, 38)'; // Red-600 base
        // Intensity scaling: pH 4 -> 0%, pH 0 -> 80%
        // Max opacity 0.6 to not block view
        opacity = 0.6 * ((4.0 - currentPH) / 4.0);
        if (currentPH < 2.0) isCritical = true;
    }
    // Basic Range (pH > 10) -> Blue/Purple
    else if (currentPH > 10.0) {
        vignetteColor = 'rgba(79, 70, 229)'; // Indigo-600 base
        // Intensity scaling: pH 10 -> 0%, pH 14 -> 80%
        opacity = 0.6 * ((currentPH - 10.0) / 4.0);
        if (currentPH > 12.0) isCritical = true;
    }

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">

            {/* PERSISTENT PH VIGNETTE */}
            {opacity > 0 && (
                <div
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isCritical ? 'animate-pulse' : ''}`}
                    style={{
                        background: `radial-gradient(circle at center, transparent 30%, ${vignetteColor} 100%)`,
                        opacity: opacity
                    }}
                />
            )}

            {effects.map((effect) => (
                <div
                    key={effect.id}
                    className="absolute flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500" // approximated animate-float-up with stock classes
                    style={{
                        left: `${effect.position?.x || 50}%`,
                        top: `${effect.position?.y || 50}%`,
                        transform: 'translate(-50%, -50%)',
                        animation: 'float-up 1s ease-out forwards' // Requires custom keyframe config! or standard style
                    }}
                >
                    {/* Note: Tailwind config needs to have 'animate-float-up' keyframes. 
              Checking globals.css later to add them if missing.
          */}
                    <style jsx>{`
            @keyframes float-up {
              0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
              20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
              100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
            }
          `}</style>

                    {effect.type === 'damage' && (
                        <div className="flex items-center gap-1 text-4xl font-black text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-bounce">
                            <span className="text-6xl">-</span>{effect.value}
                        </div>
                    )}
                    {effect.type === 'heal' && (
                        <div className="flex items-center gap-1 text-4xl font-black text-green-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <span className="text-6xl">+</span>{effect.value}
                        </div>
                    )}
                    {(effect.type === 'reaction_good' || effect.type === 'synthesis') && (
                        <div className="flex flex-col items-center">
                            <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slow" />
                            <span className="text-2xl font-bold text-yellow-300 drop-shadow-md text-center px-4 py-1 bg-black/50 rounded-full border border-yellow-500/50 backdrop-blur-sm">
                                {effect.description}
                            </span>
                        </div>
                    )}
                    {effect.type === 'reaction_bad' && (
                        <div className="flex flex-col items-center">
                            <Skull className="w-12 h-12 text-purple-500 animate-pulse" />
                            <span className="text-2xl font-bold text-purple-400 drop-shadow-md text-center px-4 py-1 bg-black/50 rounded-full border border-purple-500/50 backdrop-blur-sm">
                                {effect.description}
                            </span>
                        </div>
                    )}
                    {effect.type === 'info' && (
                        <div className="text-xl font-bold text-blue-300 drop-shadow-md px-4 py-2 bg-slate-900/80 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                            {effect.description}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
