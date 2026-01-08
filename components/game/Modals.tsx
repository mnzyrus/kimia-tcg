import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GeminiService } from '@/lib/ai';
import { elementCards } from '@/lib/gameData'; // For AskChemist defaults?
import { GameSettings, useGameSettings } from '@/lib/SettingsContext';
import { X, Send, Bot, Play, Settings as SettingsIcon, LogOut, Loader2, User, Plus, Trophy, History, FlaskConical, Volume2, Music, Speaker, Zap, Monitor, Globe, Recycle } from 'lucide-react';
import { GameButton } from './CardComponents';
import { Card, GameState } from '@/types';

// --- ASK CHEMIST MODAL ---
export function AskChemistModal({ onClose, gameState }: { onClose: () => void, gameState: GameState }) {
    const { settings } = useGameSettings();
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            // Call the real Gemini Service using key from settings
            const reply = await GeminiService.chat(query, gameState, settings.apiKey || '');
            setResponse(reply);

        } catch (e) {
            console.error(e);
            setResponse("Maaf, saya menghadapi masalah teknikal.");
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

interface GradientSliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    icon: React.ReactNode;
    colorClass: string;
    description?: string;
}

const GradientSlider: React.FC<GradientSliderProps> = ({ label, value, onChange, icon, colorClass, description }) => {
    // Local state for instant drag feedback (decouples from Context latency)
    const [localValue, setLocalValue] = useState(value);

    // Sync if external settings change (e.g. Reset)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const percentage = localValue * 100;

    return (
        <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl select-none group hover:border-slate-700 transition-colors relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-slate-900 ${colorClass} bg-opacity-10 text-${colorClass.replace('bg-', '')}`}>
                        {icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm">{label}</h4>
                        {description && <p className="text-xs text-slate-500">{description}</p>}
                    </div>
                </div>
                <span className={`text-xl font-bold ${colorClass.replace('bg-', 'text-')}`}>{Math.round(percentage)}%</span>
            </div>

            <div className="relative h-6 flex items-center">
                {/* Track */}
                <div className="absolute w-full h-2 bg-slate-800 rounded-full overflow-hidden pointer-events-none">
                    <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                </div>

                {/* Thumb - Removed transitions for instant tracking */}
                <div
                    className={`absolute h-5 w-5 bg-white border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] pointer-events-none flex items-center justify-center`}
                    style={{ left: `${percentage}%`, transform: `translate(-50%, 0)` }}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                </div>

                {/* Input - Massive Hit Area + Touch Action None */}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localValue}
                    onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setLocalValue(v);
                        onChange(v);
                    }}
                    className="absolute w-full h-12 top-1/2 -translate-y-1/2 transform opacity-0 z-50 cursor-pointer touch-none active:cursor-grabbing"
                    aria-label={label}
                />
            </div>
        </div>
    );
};

export function SettingsModal({ onClose, onSurrender }: { onClose: () => void, onSurrender?: () => void }) {
    const { settings, updateSetting, resetSettings } = useGameSettings();
    const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'gameplay'>('audio');

    const TabButton = ({ id, label, icon }: { id: 'audio' | 'visual' | 'gameplay', label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold shadow-lg shadow-blue-900/10'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
            <div className="bg-slate-900 w-full max-w-4xl h-[600px] rounded-3xl border border-slate-700 shadow-2xl flex overflow-hidden">

                {/* SIDEBAR */}
                <div className="w-64 bg-slate-950/50 border-r border-slate-800 p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-8 text-white px-2">
                        <SettingsIcon className="w-6 h-6 text-blue-500" />
                        <span className="font-black text-lg tracking-tight">TETAPAN</span>
                    </div>

                    <div className="space-y-2 flex-1">
                        <TabButton id="audio" label="Audio" icon={<Volume2 className="w-4 h-4" />} />
                        <TabButton id="visual" label="Visual" icon={<Monitor className="w-4 h-4" />} />
                        <TabButton id="gameplay" label="Permainan" icon={<Zap className="w-4 h-4" />} />
                    </div>

                    <div className="pt-6 border-t border-slate-800 space-y-3">
                        {onSurrender && (
                            <button
                                onClick={onSurrender}
                                className="w-full py-3 mb-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 font-bold group"
                            >
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Tamatkan Permainan
                            </button>
                        )}
                        <button onClick={resetSettings} className="w-full py-2 text-xs text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <Recycle className="w-3 h-3" /> Reset Default
                        </button>
                        <GameButton onClick={onClose} variant="primary" className="w-full justify-center">Simpan & Tutup</GameButton>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 bg-slate-900 p-8 overflow-y-auto scrollbar-thin">
                    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300" key={activeTab}>

                        {/* HEADER */}
                        <div>
                            <h2 className="text-2xl font-black text-white mb-1 capitalize">{activeTab}</h2>
                            <p className="text-slate-500 text-sm">Ubah tetapan {activeTab} anda di sini.</p>
                        </div>

                        {/* AUDIO TAB */}
                        {activeTab === 'audio' && (
                            <div className="space-y-6">
                                <GradientSlider
                                    label="Master Volume"
                                    description="Kawal bunyi keseluruhan permainan"
                                    value={settings.masterVolume}
                                    onChange={(v: number) => updateSetting('masterVolume', v)}
                                    icon={<Volume2 className="w-5 h-5" />}
                                    colorClass="bg-blue-500"
                                />

                                <GradientSlider
                                    label="Muzik"
                                    value={settings.bgmVolume}
                                    onChange={(v: number) => updateSetting('bgmVolume', v)}
                                    icon={<Music className="w-4 h-4" />}
                                    colorClass="bg-purple-500"
                                />

                                <GradientSlider
                                    label="Kesan Bunyi"
                                    value={settings.sfxVolume}
                                    onChange={(v: number) => updateSetting('sfxVolume', v)}
                                    icon={<Speaker className="w-4 h-4" />}
                                    colorClass="bg-green-500"
                                />
                            </div>
                        )}

                        {/* VISUAL TAB */}
                        {activeTab === 'visual' && (
                            <div className="space-y-6">
                                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-base">Kualiti Grafik</h4>
                                        <p className="text-xs text-slate-500 mt-1">Kurangkan kualiti jika permainan terasa perlahan.</p>
                                    </div>
                                    <div className="flex bg-slate-900 rounded-lg p-1.5 border border-slate-800">
                                        <button
                                            onClick={() => updateSetting('quality', 'low')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${settings.quality === 'low' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                        >Low</button>
                                        <button
                                            onClick={() => updateSetting('quality', 'high')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${settings.quality === 'high' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                                        >High</button>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-base">3D Card Tilt</h4>
                                        <p className="text-xs text-slate-500 mt-1">Efek 3D apabila menggerakkan tetikus di atas kad.</p>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('cardTilt', !settings.cardTilt)}
                                        className={`w-14 h-7 rounded-full relative transition-colors ${settings.cardTilt ? 'bg-green-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${settings.cardTilt ? 'translate-x-7' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* GAMEPLAY TAB */}
                        {activeTab === 'gameplay' && (
                            <div className="space-y-6">
                                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-base">Kelajuan Animasi</h4>
                                        <p className="text-xs text-slate-500 mt-1">Percepatkan animasi jika anda pemain pro.</p>
                                    </div>
                                    <div className="flex bg-slate-900 rounded-lg p-1.5 border border-slate-800">
                                        <button
                                            onClick={() => updateSetting('gameSpeed', 'normal')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${settings.gameSpeed === 'normal' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                        >Normal</button>
                                        <button
                                            onClick={() => updateSetting('gameSpeed', 'fast')}
                                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${settings.gameSpeed === 'fast' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                                        >Laju</button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
