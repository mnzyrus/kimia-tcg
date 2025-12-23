
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GeminiService } from '@/lib/ai';
import { elementCards } from '@/lib/gameData'; // For AskChemist defaults?
import { GameSettings, useGameSettings } from '@/lib/settings';
import { X, Send, Bot, Play, Settings as SettingsIcon, LogOut, Loader2, User, Plus, Trophy, History, FlaskConical, Volume2, Music, Speaker, Zap, Monitor, Globe } from 'lucide-react';
import { GameButton } from './CardComponents';
import { Card, GameState } from '@/types';

// --- ASK CHEMIST MODAL ---
export function AskChemistModal({ onClose, gameState }: { onClose: () => void, gameState: GameState }) {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            // We can use GeminiService for chat too if we add a method, or just use the same API key logic
            // For now, I'll simulate or use a direct call if GeminiService supports general chat.
            // The current GeminiService is specialized for "calculateMove". 
            // I should likely extend GeminiService or just use a simple heuristic if no API key.

            // NOTE: In a real app we'd have a specific endpoint or service method.
            // For this prototype, let's use a simple mock response or try to use the key if available.
            const apiKey = localStorage.getItem('gemini_api_key');

            if (apiKey) {
                // If we have a key, we might try to use it (using raw fetch or extending service).
                // But to keep it simple and safe:
                setResponse("Ahli Kimia AI sedang menganalisis soalan anda... (Fungsi Chat belum disambungkan sepenuhnya)");
            } else {
                setResponse("Sila masukkan API Key dalam tetapan untuk bertanya kepada Ahli Kimia AI.");
            }

        } catch (e) {
            setResponse("Maaf, saya tidak dapat menjawab sekarang.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-teal-500/30 p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                        <Bot className="w-6 h-6" /> Tanya Ahli Kimia
                    </h3>
                    <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
                </div>
                <div className="h-64 bg-slate-950 rounded-xl p-4 mb-4 overflow-y-auto border border-slate-800 text-sm scrollbar-thin">
                    {response ? (
                        <p className="text-slate-300 leading-relaxed">{response}</p>
                    ) : (
                        <div className="text-slate-600 text-center mt-20">
                            <p>Tanya apa sahaja tentang strategi atau kimia!</p>
                            <p className="text-xs mt-2 text-slate-700">Contoh: "Macam mana nak buat Garam?"</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                        placeholder="Taip soalan anda..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    />
                    <button
                        onClick={handleAsk}
                        disabled={isLoading || !query}
                        className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- TUTORIAL MODAL ---
export function TutorialModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const totalSteps = 8;

    const content = [
        {
            title: "Selamat Datang ke Kimia TCG",
            text: "Anda adalah Ahli Kimia yang bertarung di makmal. Objektif: Kalahkan lawan dengan menjadikan solution mereka terlalu Asid (pH 0) atau terlalu Beralkali (pH 14), atau kurangkan HP mereka ke 0."
        },
        {
            title: "Struktur Giliran (Turn)",
            text: "Setiap giliran bermula dengan fasa 'Draw' (2 kad). Anda boleh 'Sintesis' atau 'Serang' seberapa banyak kali selagi ada Tenaga. Tamatkan giliran bila tiada langkah."
        },
        {
            title: "Sumber: Tenaga & Jisim",
            text: "Tenaga (E): Diperlukan untuk 'Sintesis' sebatian. Jisim (M): Diperlukan untuk membina kad yang lebih kuat. Kumpul unsur asas untuk dapatkan sumber ini."
        },
        {
            title: "Sintesis Sebatian",
            text: "Gabungkan kad Unsur (H, O, Na, Cl, dll) di Kebuk Sintesis. Resipi yang betul menghasilkan Asid (Serangan), Bes (Pertahanan/Serangan), atau Garam (Kesan Khas)."
        },
        {
            title: "Mekanik pH: Serangan",
            text: "Gunakan Asid (H+) untuk menurunkan pH lawan. Gunakan Bes (OH-) untuk menaikkan pH lawan. Perubahan pH dikira menggunakan formula logaritma sebenar!"
        },
        {
            title: "Mekanik pH: Buffer",
            text: "Takut diserang? Hasilkan Garam Buffer (cth: Ammonium Asetat). Buffer akan mengurangkan perubahan pH secara drastik (sehingga 90% tahanan) pabila anda diserang."
        },
        {
            title: "Reaksi Peneutralan",
            text: "Kalau lawan serang dengan Asid, dan anda ada Bes aktif (atau sebaliknya), 'Peneutralan' berlaku! Ini menghasilkan Garam baharu dan air, membatalkan serangan."
        },
        {
            title: "Strategi Menang",
            text: "Uruskan pH anda berhampiran 7.0. Kumpul kad 'Tier Tinggi' untuk serangan maut. Jangan biarkan masa tamat!"
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-indigo-500/30 p-8 shadow-2xl relative overflow-hidden flex flex-col h-[60vh]">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 border border-indigo-500/30 px-3 py-1 rounded-full">
                        Langkah {step} dari {totalSteps}
                    </span>
                    <h2 className="text-4xl font-black text-white mb-6 tracking-tight">{content[step - 1].title}</h2>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-lg mx-auto">
                        {content[step - 1].text}
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-12 bg-indigo-500' : 'w-2 bg-slate-700'}`} />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                                Kembali
                            </button>
                        )}
                        <GameButton onClick={() => step < totalSteps ? setStep(s => s + 1) : onClose()} className="px-8 py-3 text-lg">
                            {step < totalSteps ? "Seterusnya" : "Faham & Mula!"}
                        </GameButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- PAUSE MENU ---
export function PauseMenu({ onResume, onSettings, onQuit }: any) {
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 p-8 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-transparent pointer-events-none" />

                <div className="flex flex-col items-center gap-2 mb-8 relative z-10">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/20 animate-pulse-slow">
                        <FlaskConical className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">KIMIA TCG</h2>
                        <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">Permainan Dijeda</span>
                    </div>
                </div>

                <div className="space-y-3 relative z-10">
                    <GameButton onClick={onResume} className="w-full py-4 text-lg justify-center bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 border-0">
                        <Play className="w-5 h-5 mr-2 fill-current" /> Sambung
                    </GameButton>
                    <GameButton onClick={onSettings} className="w-full py-3 text-base justify-center bg-slate-800 hover:bg-slate-700 text-white border border-slate-600">
                        <SettingsIcon className="w-4 h-4 mr-2" /> Tetapan
                    </GameButton>
                    <div className="h-px bg-slate-800 my-4" />
                    <GameButton onClick={onQuit} variant="danger" className="w-full py-3 text-base justify-center bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50">
                        <LogOut className="w-4 h-4 mr-2" /> Keluar ke Menu
                    </GameButton>
                </div>
            </div>
        </div>
    );
}

// --- PROFILE SELECTOR (MIGRATED TO SUPABASE) ---
export function ProfileSelector({ onSelectProfile, onCancel }: { onSelectProfile: (p: any) => void, onCancel?: () => void }) {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProfileName, setNewProfileName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setProfiles(data || []);
        } catch (err) {
            console.error("Error fetching profiles:", err);
            setError("Gagal memuatkan profil.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) return;
        setIsCreating(true);
        setError('');
        try {
            const { data, error } = await supabase.from('profiles').insert([{ name: newProfileName }]).select().single();

            if (error) throw error;

            if (data) {
                setProfiles([data, ...profiles]);
                onSelectProfile(data);
            }
        } catch (err: any) {
            console.error("Error creating profile:", err);
            setError(err.message || "Gagal mencipta profil.");
        } finally {
            setIsCreating(false);
            setNewProfileName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 p-6 shadow-2xl relative">
                {onCancel && (
                    <button onClick={onCancel} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                )}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Pilih Profil</h2>
                    <p className="text-slate-400 text-sm">Pilih atau cipta profil untuk menyimpan rekod perlawanan.</p>
                </div>

                {error && <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2 scrollbar-thin">
                    {loading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">Tiada profil dijumpai.</div>
                    ) : (
                        profiles.map(p => (
                            <div key={p.id} onClick={() => onSelectProfile(p)} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700 hover:border-blue-500 cursor-pointer transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-900/50 p-2 rounded-full text-blue-400"><User className="w-4 h-4" /></div>
                                    <div>
                                        <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                        <span className="text-[10px] text-slate-500 font-mono">ID: {p.id.slice(0, 8)}...</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                    <div className="flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500" /> {p.wins || 0}</div>
                                    <div className="flex items-center gap-1"><History className="w-3 h-3 text-red-500" /> {p.losses || 0}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profil Baru</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Nama pemain..."
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
                        />
                        <GameButton onClick={handleCreateProfile} disabled={isCreating || !newProfileName.trim()}>
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </GameButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- SETTINGS MODAL ---
export function SettingsModal({ onClose }: { onClose: () => void }) {
    const { settings, updateSetting, resetSettings } = useGameSettings();

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5" /> Tetapan
                    </h2>
                    <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">

                    {/* AUDIO */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Volume2 className="w-4 h-4" /> Audio</h3>

                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-slate-300">
                                <span>Master Volume</span>
                                <span>{Math.round(settings.masterVolume * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.1"
                                value={settings.masterVolume}
                                onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Music className="w-3 h-3" /> BGM</span>
                                </div>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={settings.bgmVolume}
                                    onChange={(e) => updateSetting('bgmVolume', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Speaker className="w-3 h-3" /> SFX</span>
                                </div>
                                <input
                                    type="range" min="0" max="1" step="0.1"
                                    value={settings.sfxVolume}
                                    onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* VISUALS */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Monitor className="w-4 h-4" /> Visual</h3>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Kualiti Grafik</span>
                            <div className="flex bg-slate-800 rounded-lg p-1">
                                <button
                                    onClick={() => updateSetting('quality', 'low')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${settings.quality === 'low' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >Low</button>
                                <button
                                    onClick={() => updateSetting('quality', 'high')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${settings.quality === 'high' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >High</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Card 3D Tilt</span>
                            <button
                                onClick={() => updateSetting('cardTilt', !settings.cardTilt)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${settings.cardTilt ? 'bg-green-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.cardTilt ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* GAMEPLAY */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Zap className="w-4 h-4" /> Permainan</h3>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-300">Kelajuan Animasi</span>
                            <div className="flex bg-slate-800 rounded-lg p-1">
                                <button
                                    onClick={() => updateSetting('gameSpeed', 'normal')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${settings.gameSpeed === 'normal' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >Normal</button>
                                <button
                                    onClick={() => updateSetting('gameSpeed', 'fast')}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${settings.gameSpeed === 'fast' ? 'bg-yellow-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >Laju</button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                    <button onClick={resetSettings} className="px-4 py-2 text-xs text-slate-500 hover:text-white transition-colors">Reset</button>
                    <GameButton onClick={onClose} variant="primary" className="px-6">Tutup</GameButton>
                </div>
            </div>
        </div>
    );
}
