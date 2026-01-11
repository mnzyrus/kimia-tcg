import React from 'react';
import { Smartphone } from 'lucide-react';

export function LandscapeOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950 hidden portrait:flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <Smartphone className="w-24 h-24 text-blue-400 animate-[spin_3s_ease-in-out_infinite]" />
            </div>

            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                Sila Pusingkan Peranti Anda
            </h2>

            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                Kimia TCG direka untuk dimainkan dalam mod <span className="text-blue-400 font-bold">Melintang (Landscape)</span> bagi pengalaman terbaik.
            </p>

            <div className="mt-12 flex items-center gap-3 text-sm font-mono text-slate-600 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                <Smartphone className="w-4 h-4 rotate-90" />
                <span>Mod Melintang Diperlukan</span>
            </div>
        </div>
    );
}
