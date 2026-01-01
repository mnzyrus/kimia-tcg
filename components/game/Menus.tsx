
import React, { useState } from 'react';
import { GameButton } from './CardComponents';
import { Atom, Swords, Microscope, Trophy, Info, Settings as SettingsIcon, LogOut, Users, Cpu, Loader2, ArrowRight, Dna, Play, Plus, Search, X, LogIn } from 'lucide-react';
import { Card } from '@/types';
import Link from 'next/link';
import { elementCards } from '@/lib/gameData';

export function MainMenu({ onStartGame, onOpenLibrary, onOpenTutorial, onOpenSettings, onChangeProfile, currentProfile }: any) {
    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 z-50 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 pointer-events-none" />

            {/* Floating atoms animation (simplified CSS for now) */}
            <div className="absolute w-full h-full overflow-hidden pointer-events-none opacity-20">
                {/* We could add some floating elements here */}
            </div>

            <div className="z-10 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md w-full max-w-lg text-center animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-pulse">
                        <Atom className="w-16 h-16 text-blue-400" />
                    </div>
                </div>

                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-lg bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                    KIMIA TCG
                </h1>
                <p className="text-slate-400 mb-8 font-mono text-sm tracking-widest uppercase">Tactical Chemistry Game</p>

                {currentProfile && (
                    <div className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                        <div className="text-left">
                            <p className="text-xs text-slate-500 font-bold uppercase">{currentProfile.isGuest ? 'Akaun Tetamu' : 'Pemain Semasa'}</p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-lg">{currentProfile.name}</span>
                                {!currentProfile.isGuest && currentProfile.wins > 5 && <Trophy className="w-4 h-4 text-yellow-500" />}
                            </div>
                        </div>
                        {currentProfile.isGuest ? (
                            <Link href="/auth" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                                <LogIn className="w-3 h-3" /> Log Masuk
                            </Link>
                        ) : (
                            <button onClick={onChangeProfile} className="text-xs text-blue-400 hover:text-white underline underline-offset-4">Tukar</button>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <GameButton onClick={() => onStartGame('pve')} className="w-full py-4 text-xl justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-blue-900/20">
                        <Cpu className="w-6 h-6 mr-2" /> Main vs AI
                    </GameButton>
                    <GameButton onClick={() => onStartGame('pvp')} className="w-full py-4 text-xl justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600">
                        <Swords className="w-6 h-6 mr-2" /> Main vs Pemain (Online)
                    </GameButton>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <GameButton onClick={onOpenLibrary} variant="outline" className="justify-center text-sm py-3">
                            <Microscope className="w-4 h-4 mr-2" /> Perpustakaan
                        </GameButton>
                        <GameButton onClick={onOpenTutorial} variant="outline" className="justify-center text-sm py-3">
                            <Info className="w-4 h-4 mr-2" /> Cara Main
                        </GameButton>
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-slate-500">
                    <button onClick={onOpenSettings} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Tetapan">
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-mono">v2.0 (Online Build)</span>
                </div>
            </div>
        </div>
    );
}

export function Lobby({ onJoinRoom, onCreateRoom, onRandomMatch, onCancel, socketStatus }: { onJoinRoom: (roomId: string) => void, onCreateRoom: (roomId: string) => void, onRandomMatch: () => void, onCancel: () => void, socketStatus: string }) {
    const [roomId, setRoomId] = useState('');
    const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu');
    const [isProcessing, setIsProcessing] = useState(false);

    return (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-blue-500/30 p-8 shadow-2xl relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Lobi Berbilang Pemain</h2>
                    <p className="text-slate-400">Main secara dalam talian bersama rakan.</p>
                </div>

                {/* MODE SELECTION */}
                {mode === 'menu' && (
                    <div className="space-y-3">
                        <GameButton onClick={() => { setIsProcessing(true); onRandomMatch(); }} className="w-full py-4 text-lg justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                            <Search className="w-5 h-5 mr-2" /> Cari Lawan (Random)
                        </GameButton>
                        <div className="flex gap-3">
                            <GameButton onClick={() => setMode('create')} className="flex-1 py-3 justify-center bg-slate-800 border border-slate-600">
                                <Plus className="w-4 h-4 mr-2" /> Buat Bilik
                            </GameButton>
                            <GameButton onClick={() => setMode('join')} className="flex-1 py-3 justify-center bg-slate-800 border border-slate-600">
                                <ArrowRight className="w-4 h-4 mr-2" /> Masuk Bilik
                            </GameButton>
                        </div>
                    </div>
                )}

                {/* JOIN ROOM */}
                {mode === 'join' && (
                    <div className="space-y-4 animate-in slide-in-from-right">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Kod Bilik</label>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="KOD-BILIK"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-blue-500 transition-all text-center tracking-widest uppercase"
                            />
                        </div>
                        <GameButton onClick={() => onJoinRoom(roomId)} disabled={!roomId} className="w-full py-3 justify-center">
                            Masuk
                        </GameButton>
                        <button onClick={() => setMode('menu')} className="w-full text-slate-500 text-xs hover:text-white">Kembali</button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="space-y-4 animate-in slide-in-from-left">
                        <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-700 text-center">
                            <p className="text-xs text-slate-500 mb-2">Kod Bilik Anda:</p>
                            <div className="text-2xl font-mono text-green-400 font-bold select-all">
                                {roomId || `ROOM-${Math.floor(Math.random() * 1000)}`}
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2">Kongsikan kod ini kepada rakan.</p>
                        </div>
                        <GameButton onClick={() => {
                            const code = roomId || `ROOM-${Math.floor(Math.random() * 1000)}`;
                            onCreateRoom(code);
                        }} className="w-full py-3 justify-center bg-green-600 hover:bg-green-500">
                            Mula Menunggu
                        </GameButton>
                        <button onClick={() => setMode('menu')} className="w-full text-slate-500 text-xs hover:text-white">Kembali</button>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        Status Pelayan: {socketStatus === 'connected' ? 'Dalam Talian' : 'Luar Talian'}
                    </p>
                </div>
            </div>
        </div>
    );
}
