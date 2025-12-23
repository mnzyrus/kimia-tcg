
import React, { useState } from 'react';
import { Card } from '@/types';
import { elementCards, sintesisCards, garamCards, REACTION_LIBRARY } from '@/lib/gameData';
import { BookOpen, X, Atom, FlaskConical, Beaker, Globe, Calculator, Shield } from 'lucide-react';
import PeriodicTable from '@/components/PeriodicTable';

// --- Perpustakaan Components ---

export function Perpustakaan({ onClose }: any) {
    const [activeTab, setActiveTab] = useState<'elements' | 'synthesis' | 'salts' | 'reactions' | 'guide'>('elements');
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    const tabs = [
        { id: 'elements', label: 'Unsur', icon: Atom },
        { id: 'synthesis', label: 'Sintesis', icon: FlaskConical },
        { id: 'salts', label: 'Garam', icon: Beaker },
        { id: 'reactions', label: 'Reaksi', icon: BookOpen },
        { id: 'guide', label: 'Panduan pH', icon: Calculator }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3"><BookOpen className="w-6 h-6 text-blue-400" /><h2 className="text-2xl font-bold text-white">Perpustakaan Kimia</h2></div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                </div>
                <div className="flex border-b border-slate-700 bg-slate-800/30">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {activeTab === 'elements' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {elementCards.map((card) => (
                                <div key={card.id} onClick={() => setSelectedCard(card)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-all group cursor-pointer hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-white">{card.name}</h3><span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-blue-400">{card.symbol}</span></div>
                                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{card.description}</p>
                                    <div className="text-[10px] text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800 group-hover:border-slate-600 transition-colors">
                                        <p className="font-bold text-slate-400 mb-1">Fakta Sains:</p><p className="line-clamp-3">{card.scientificJustification}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'synthesis' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sintesisCards.map((card) => (
                                <div key={card.id} onClick={() => setSelectedCard(card)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-purple-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-purple-900/20 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-white">{card.name}</h3><span className={`text-xs px-2 py-1 rounded font-bold ${card.sintesisType === 'Asid' ? 'bg-red-900/50 text-red-400' : card.sintesisType === 'Bes' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'}`}>{card.sintesisType}</span></div>
                                    <div className="flex gap-2 mb-3 text-xs font-mono text-slate-400"><span>pH: {card.pH}</span><span>•</span><span>{card.molecularStructure}</span></div>
                                    <p className="text-xs text-slate-300 mb-3 line-clamp-2">{card.scientificJustification}</p>
                                    <div className="mt-2 pt-2 border-t border-slate-700"><p className="text-[10px] text-slate-500"><span className="font-bold text-slate-400">Kegunaan Harian:</span> {card.dailyUsage}</p></div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'salts' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {garamCards.map((card) => (
                                <div key={card.id} onClick={() => setSelectedCard(card)} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-green-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-green-900/20 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-white">{card.name}</h3><span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-green-400">{card.formula}</span></div>
                                    <p className="text-xs text-slate-300 mb-2">{card.description}</p>
                                    <div className="text-[10px] text-slate-500 space-y-2">
                                        <p><span className="font-bold text-slate-400">Sumber:</span> {card.source}</p>
                                        <p className="line-clamp-2">{card.scientificJustification}</p>
                                        <p><span className="font-bold text-slate-400">Kegunaan:</span> {card.dailyUsage}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'reactions' && (
                        <div className="space-y-4">
                            {REACTION_LIBRARY.map((reaction, idx) => (
                                <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-yellow-500 transition-all flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{reaction.reactionName}</h3>
                                        <code className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-yellow-400 block w-fit mb-2">{reaction.equation}</code>
                                        <p className="text-sm text-slate-300">{reaction.description}</p>
                                    </div>
                                    <div className="md:w-1/3 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 mb-1">Kesan TCG:</p>
                                        <p className="text-sm text-green-400">{reaction.tcgEffect}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'guide' && (
                        <div className="space-y-6 text-slate-300 max-w-4xl mx-auto">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Calculator className="text-blue-400" /> Konsep pH & Pengiraan</h3>
                                <p className="mb-4">
                                    pH adalah ukuran keasidan atau kealkalian sesuatu larutan. Ia dikira berdasarkan kepekatan ion Hidrogen [H<sup>+</sup>].
                                </p>
                                <div className="bg-slate-950 p-4 rounded-lg font-mono text-sm mb-4">
                                    <p className="text-yellow-400">Formula Asas:</p>
                                    <p className="text-xl my-2">pH = -log[H<sup>+</sup>]</p>
                                    <p className="text-slate-500">// Di mana [H<sup>+</sup>] adalah kepekatan Molar (M)</p>
                                </div>
                                <h4 className="font-bold text-white mb-2">Langkah Pengiraan:</h4>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>Dapatkan nilai kepekatan ion H<sup>+</sup> (contoh: 1.0 × 10<sup>-7</sup> M).</li>
                                    <li>Gunakan logaritma base 10.</li>
                                    <li>Darab dengan -1 untuk dapatkan nilai positif.</li>
                                </ol>
                            </div>

                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Shield className="text-green-400" /> Sistem Buffer (Penimbal)</h3>
                                <p className="mb-4">
                                    Larutan penimbal (Buffer) adalah larutan yang boleh mengekalkan pH walaupun sedikit asid atau bes ditambah.
                                    Dalam permainan ini, Garam Buffer memberikan rintangan terhadap perubahan pH.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                        <h4 className="font-bold text-blue-400 mb-2">Tanpa Buffer:</h4>
                                        <p className="text-sm">Perubahan pH berlaku sepenuhnya.</p>
                                        <code className="block mt-2 text-red-400">ΔpH = 1.0</code>
                                    </div>
                                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                        <h4 className="font-bold text-green-400 mb-2">Dengan Buffer:</h4>
                                        <p className="text-sm mb-1">Contoh: <span className="text-white font-bold">Ammonium Asetat</span></p>
                                        <p className="text-xs text-slate-500 mb-2">Pengganda: 0.15 (15% perubahan)</p>
                                        <div className="bg-black/30 p-2 rounded border border-slate-700 font-mono text-xs">
                                            <div className="flex justify-between text-slate-400"><span>Asal:</span> <span>ΔpH = 1.00</span></div>
                                            <div className="flex justify-between text-green-400 font-bold border-t border-slate-700 mt-1 pt-1">
                                                <span>Baru:</span>
                                                <span>1.00 x 0.15 = 0.15</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-slate-400 italic">
                                    Tips: Gunakan Garam Buffer sebelum diserang oleh asid kuat untuk melindungi makmal anda!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                {/* DETAILS OVERLAY */}
                {selectedCard && (
                    <LibraryDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
                )}
            </div>
        </div>
    );
}

export function LibraryDetailModal({ card, onClose }: { card: Card, onClose: () => void }) {
    if (!card) return null;

    // pH Calculation Logic for Acids
    const renderPHCalculation = () => {
        if (!card.pH || !['Asid', 'Bes'].includes(card.sintesisType || '')) return null;

        // Simple approximations for display
        let concentration = Math.pow(10, -(card.pH || 7)).toExponential(2);
        let formula = "pH = -log[H+]";
        let calc = `-log(${concentration})`;

        if (card.sintesisType === 'Bes') {
            // pOH = 14 - pH
            // [OH-] = 10^-pOH
            let pOH = 14 - (card.pH || 14);
            formula = "pOH = -log[OH-], pH = 14 - pOH";
            calc = `pOH = 14 - ${card.pH} = ${pOH.toFixed(1)}`;
            concentration = Math.pow(10, -pOH).toExponential(2) + " M [OH-]";
        }

        return (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 my-4">
                <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Pengiraan pH Terperinci
                </h4>
                <div className="font-mono text-xs space-y-3 text-slate-300">
                    <div className="border-b border-slate-800 pb-2">
                        <span className="block text-slate-500 mb-1">Langkah 1: Tentukan Kepekatan</span>
                        <span className="text-green-400 text-sm">[{card.sintesisType === 'Bes' ? <span>OH<sup>-</sup></span> : <span>H<sup>+</sup></span>}] = {concentration}</span>
                    </div>
                    <div className="border-b border-slate-800 pb-2">
                        <span className="block text-slate-500 mb-1">Langkah 2: Guna Formula Log</span>
                        <span className="text-yellow-500">{card.sintesisType === 'Bes' ? <span>pOH = -log[OH<sup>-</sup>]</span> : <span>pH = -log[H<sup>+</sup>]</span>}</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">Keputusan Akhir:</span>
                        <span className="text-white font-bold text-lg">{calc} = {card.pH}</span>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">
                    *Nilai ini dikira secara automatik berdasarkan sifat kimia kad.
                </p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-blue-500/30 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header Background based on Type */}
                <div className={`h-24 ${card.type === 'Element' ? 'bg-gradient-to-r from-slate-800 to-slate-700' :
                    card.type === 'Garam' ? 'bg-gradient-to-r from-emerald-900 to-emerald-800' :
                        card.sintesisType === 'Asid' ? 'bg-gradient-to-r from-red-900 to-red-800' :
                            card.sintesisType === 'Bes' ? 'bg-gradient-to-r from-blue-900 to-blue-800' :
                                'bg-gradient-to-r from-purple-900 to-purple-800'
                    } p-6 relative flex items-end`}>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 p-2 rounded-full text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">{card.name}</h2>
                        <div className="flex gap-2 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 border border-white/20 text-white shadow-sm">
                                {card.formula || card.symbol}
                            </span>
                            {card.type !== 'Element' && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 border border-white/20 text-white shadow-sm uppercase tracking-wide">
                                    {card.type === 'Garam' ? 'Salt' : card.sintesisType}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {card.type === 'Element' && (
                        <div className="mb-6">
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-6 overflow-x-auto">
                                <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">Jadual Berkala</h4>
                                <PeriodicTable elements={elementCards} onSelect={() => { }} selectedId={card.id} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><Globe className="w-4 h-4" /> Asal Usul Nama</h3>
                                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                        {(card.origin || 'Tiada data asal usul.').split('. ').map((pt, i) => pt && <li key={i}>{pt.replace(/\.$/, '')}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-green-400 mb-2 flex items-center gap-2"><Atom className="w-4 h-4" /> Fakta Sains</h3>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {card.scientificJustification}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {card.type !== 'Element' && (
                        <p className="text-lg text-slate-300 leading-relaxed mb-6">{card.scientificJustification || card.description}</p>
                    )}

                    {renderPHCalculation()}

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {card.pH != null && (
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">pH Level</span>
                                <div className="text-2xl font-bold text-white mt-1">{card.pH}</div>
                            </div>
                        )}
                        {card.power != null && (
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Power</span>
                                <div className="text-2xl font-bold text-white mt-1">{card.power}</div>
                            </div>
                        )}
                        {card.type !== 'Element' && (card.eCost || 0) > 0 && (
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Tenaga (E)</span>
                                <div className="text-2xl font-bold text-yellow-400 mt-1">{card.eCost}</div>
                            </div>
                        )}
                        {card.type !== 'Element' && (card.mCost || 0) > 0 && (
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-500 uppercase tracking-widest">Jisim (M)</span>
                                <div className="text-2xl font-bold text-blue-400 mt-1">{card.mCost}</div>
                            </div>
                        )}
                    </div>

                    {card.requirements && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2"><Atom className="w-4 h-4" /> Resipi Sintesis</h4>
                            <div className="flex flex-wrap gap-2">
                                {card.requirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
                                        <span className="font-bold text-blue-400">{req.element}</span>
                                        <span className="text-xs text-slate-500">x{req.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {card.dailyUsage && (
                        <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20">
                            <h4 className="text-indigo-400 font-bold mb-2 text-sm uppercase tracking-wider">Kegunaan Harian</h4>
                            <p className="text-sm text-indigo-200">{card.dailyUsage}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
