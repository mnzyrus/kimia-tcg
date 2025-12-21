import React from 'react';
import type { Card } from '@/types';

interface PeriodicTableProps {
    elements: Card[];
    onSelect: (card: Card) => void;
    selectedId?: string;
}

// Compact data for all 118 elements (Z, Symbol, Name)
const ALL_ELEMENTS = [
    { z: 1, s: 'H', n: 'Hydrogen' },
    { z: 2, s: 'He', n: 'Helium' },
    { z: 3, s: 'Li', n: 'Lithium' },
    { z: 4, s: 'Be', n: 'Beryllium' },
    { z: 5, s: 'B', n: 'Boron' },
    { z: 6, s: 'C', n: 'Carbon' },
    { z: 7, s: 'N', n: 'Nitrogen' },
    { z: 8, s: 'O', n: 'Oxygen' },
    { z: 9, s: 'F', n: 'Fluorine' },
    { z: 10, s: 'Ne', n: 'Neon' },
    { z: 11, s: 'Na', n: 'Sodium' },
    { z: 12, s: 'Mg', n: 'Magnesium' },
    { z: 13, s: 'Al', n: 'Aluminium' },
    { z: 14, s: 'Si', n: 'Silicon' },
    { z: 15, s: 'P', n: 'Phosphorus' },
    { z: 16, s: 'S', n: 'Sulfur' },
    { z: 17, s: 'Cl', n: 'Chlorine' },
    { z: 18, s: 'Ar', n: 'Argon' },
    { z: 19, s: 'K', n: 'Potassium' },
    { z: 20, s: 'Ca', n: 'Calcium' },
    { z: 21, s: 'Sc', n: 'Scandium' },
    { z: 22, s: 'Ti', n: 'Titanium' },
    { z: 23, s: 'V', n: 'Vanadium' },
    { z: 24, s: 'Cr', n: 'Chromium' },
    { z: 25, s: 'Mn', n: 'Manganese' },
    { z: 26, s: 'Fe', n: 'Iron' },
    { z: 27, s: 'Co', n: 'Cobalt' },
    { z: 28, s: 'Ni', n: 'Nickel' },
    { z: 29, s: 'Cu', n: 'Copper' },
    { z: 30, s: 'Zn', n: 'Zinc' },
    { z: 31, s: 'Ga', n: 'Gallium' },
    { z: 32, s: 'Ge', n: 'Germanium' },
    { z: 33, s: 'As', n: 'Arsenic' },
    { z: 34, s: 'Se', n: 'Selenium' },
    { z: 35, s: 'Br', n: 'Bromine' },
    { z: 36, s: 'Kr', n: 'Krypton' },
    { z: 37, s: 'Rb', n: 'Rubidium' },
    { z: 38, s: 'Sr', n: 'Strontium' },
    { z: 39, s: 'Y', n: 'Yttrium' },
    { z: 40, s: 'Zr', n: 'Zirconium' },
    { z: 41, s: 'Nb', n: 'Niobium' },
    { z: 42, s: 'Mo', n: 'Molybdenum' },
    { z: 43, s: 'Tc', n: 'Technetium' },
    { z: 44, s: 'Ru', n: 'Ruthenium' },
    { z: 45, s: 'Rh', n: 'Rhodium' },
    { z: 46, s: 'Pd', n: 'Palladium' },
    { z: 47, s: 'Ag', n: 'Silver' },
    { z: 48, s: 'Cd', n: 'Cadmium' },
    { z: 49, s: 'In', n: 'Indium' },
    { z: 50, s: 'Sn', n: 'Tin' },
    { z: 51, s: 'Sb', n: 'Antimony' },
    { z: 52, s: 'Te', n: 'Tellurium' },
    { z: 53, s: 'I', n: 'Iodine' },
    { z: 54, s: 'Xe', n: 'Xenon' },
    { z: 55, s: 'Cs', n: 'Caesium' },
    { z: 56, s: 'Ba', n: 'Barium' },
    { z: 57, s: 'La', n: 'Lanthanum' },
    { z: 58, s: 'Ce', n: 'Cerium' },
    { z: 59, s: 'Pr', n: 'Praseodymium' },
    { z: 60, s: 'Nd', n: 'Neodymium' },
    { z: 61, s: 'Pm', n: 'Promethium' },
    { z: 62, s: 'Sm', n: 'Samarium' },
    { z: 63, s: 'Eu', n: 'Europium' },
    { z: 64, s: 'Gd', n: 'Gadolinium' },
    { z: 65, s: 'Tb', n: 'Terbium' },
    { z: 66, s: 'Dy', n: 'Dysprosium' },
    { z: 67, s: 'Ho', n: 'Holmium' },
    { z: 68, s: 'Er', n: 'Erbium' },
    { z: 69, s: 'Tm', n: 'Thulium' },
    { z: 70, s: 'Yb', n: 'Ytterbium' },
    { z: 71, s: 'Lu', n: 'Lutetium' },
    { z: 72, s: 'Hf', n: 'Hafnium' },
    { z: 73, s: 'Ta', n: 'Tantalum' },
    { z: 74, s: 'W', n: 'Tungsten' },
    { z: 75, s: 'Re', n: 'Rhenium' },
    { z: 76, s: 'Os', n: 'Osmium' },
    { z: 77, s: 'Ir', n: 'Iridium' },
    { z: 78, s: 'Pt', n: 'Platinum' },
    { z: 79, s: 'Au', n: 'Gold' },
    { z: 80, s: 'Hg', n: 'Mercury' },
    { z: 81, s: 'Tl', n: 'Thallium' },
    { z: 82, s: 'Pb', n: 'Lead' },
    { z: 83, s: 'Bi', n: 'Bismuth' },
    { z: 84, s: 'Po', n: 'Polonium' },
    { z: 85, s: 'At', n: 'Astatine' },
    { z: 86, s: 'Rn', n: 'Radon' },
    { z: 87, s: 'Fr', n: 'Francium' },
    { z: 88, s: 'Ra', n: 'Radium' },
    { z: 89, s: 'Ac', n: 'Actinium' },
    { z: 90, s: 'Th', n: 'Thorium' },
    { z: 91, s: 'Pa', n: 'Protactinium' },
    { z: 92, s: 'U', n: 'Uranium' },
    { z: 93, s: 'Np', n: 'Neptunium' },
    { z: 94, s: 'Pu', n: 'Plutonium' },
    { z: 95, s: 'Am', n: 'Americium' },
    { z: 96, s: 'Cm', n: 'Curium' },
    { z: 97, s: 'Bk', n: 'Berkelium' },
    { z: 98, s: 'Cf', n: 'Californium' },
    { z: 99, s: 'Es', n: 'Einsteinium' },
    { z: 100, s: 'Fm', n: 'Fermium' },
    { z: 101, s: 'Md', n: 'Mendelevium' },
    { z: 102, s: 'No', n: 'Nobelium' },
    { z: 103, s: 'Lr', n: 'Lawrencium' },
    { z: 104, s: 'Rf', n: 'Rutherfordium' },
    { z: 105, s: 'Db', n: 'Dubnium' },
    { z: 106, s: 'Sg', n: 'Seaborgium' },
    { z: 107, s: 'Bh', n: 'Bohrium' },
    { z: 108, s: 'Hs', n: 'Hassium' },
    { z: 109, s: 'Mt', n: 'Meitnerium' },
    { z: 110, s: 'Ds', n: 'Darmstadtium' },
    { z: 111, s: 'Rg', n: 'Roentgenium' },
    { z: 112, s: 'Cn', n: 'Copernicium' },
    { z: 113, s: 'Nh', n: 'Nihonium' },
    { z: 114, s: 'Fl', n: 'Flerovium' },
    { z: 115, s: 'Mc', n: 'Moscovium' },
    { z: 116, s: 'Lv', n: 'Livermorium' },
    { z: 117, s: 'Ts', n: 'Tennessine' },
    { z: 118, s: 'Og', n: 'Oganesson' },
];

export function PeriodicTable({ elements, onSelect, selectedId }: PeriodicTableProps) {
    const elementMap = new Map<string, Card>();
    elements.forEach(el => {
        if (el.symbol) {
            elementMap.set(el.symbol, el);
        }
    });

    const gridCells = [];

    for (let p = 1; p <= 7; p++) {
        for (let g = 1; g <= 18; g++) {
            let z = null;
            let placeholder = false;
            let label = '';

            if (p === 1) {
                if (g === 1) z = 1;
                else if (g === 18) z = 2;
                else placeholder = true;
            } else if (p === 2) {
                if (g === 1) z = 3;
                else if (g === 2) z = 4;
                else if (g >= 13) z = 5 + (g - 13);
                else placeholder = true;
            } else if (p === 3) {
                if (g === 1) z = 11;
                else if (g === 2) z = 12;
                else if (g >= 13) z = 13 + (g - 13);
                else placeholder = true;
            } else if (p === 4) {
                z = 19 + (g - 1);
            } else if (p === 5) {
                z = 37 + (g - 1);
            } else if (p === 6) {
                if (g === 1) z = 55;
                else if (g === 2) z = 56;
                else if (g === 3) { label = '57-71'; placeholder = true; }
                else if (g >= 4) z = 72 + (g - 4);
            } else if (p === 7) {
                if (g === 1) z = 87;
                else if (g === 2) z = 88;
                else if (g === 3) { label = '89-103'; placeholder = true; }
                else if (g >= 4) z = 104 + (g - 4);
            }

            gridCells.push({ p, g, z, placeholder, label });
        }
    }

    const fBlockCells1 = [];
    const fBlockCells2 = [];
    for (let i = 0; i < 15; i++) {
        fBlockCells1.push({ z: 57 + i });
        fBlockCells2.push({ z: 89 + i });
    }

    const renderCell = (cell: any, idx: number | string) => {
        if (cell.placeholder && !cell.label) return <div key={idx} className="w-6 h-6 md:w-8 md:h-8 invisible" />;

        if (cell.label) {
            return (
                <div key={idx} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-[6px] text-slate-600 font-mono border border-slate-800 rounded bg-slate-900/40">
                    {cell.label}
                </div>
            );
        }

        const data = ALL_ELEMENTS.find(e => e.z === cell.z);
        if (!data) return <div key={idx} className="w-6 h-6 md:w-8 md:h-8" />;

        const gameCard = elementMap.get(data.s);
        const isSelected = gameCard && gameCard.id === selectedId;
        const isInteractive = !!gameCard;

        return (
            <div
                key={idx}
                onClick={() => isInteractive && onSelect(gameCard!)}
                className={`
          w-6 h-6 md:w-8 md:h-8 border rounded-sm flex flex-col items-center justify-center relative transition-all duration-200 select-none shrink-0
          ${isInteractive
                        ? isSelected
                            ? 'bg-blue-600 border-blue-400 scale-125 z-30 shadow-[0_0_15px_rgba(37,99,235,0.8)] text-white cursor-pointer'
                            : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-blue-400 cursor-pointer z-10'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-700 pointer-events-none' // Husk style
                    }
        `}
                title={data.n}
            >
                <div className="flex flex-col items-center leading-none">
                    <span className={`text-[5px] mb-0.5 ${isInteractive ? 'opacity-80' : 'opacity-40'}`}>{data.z}</span>
                    <span className={`text-[7px] md:text-[9px] font-bold ${isInteractive ? 'text-white' : 'text-slate-600'}`}>{data.s}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col p-2 overflow-x-auto">
            <div className="grid grid-cols-18 gap-0.5 md:gap-1 w-fit mb-3 min-w-max px-4 mx-auto">
                {gridCells.map((cell, idx) => renderCell(cell, idx))}
            </div>

            <div className="flex flex-col gap-0.5 md:gap-1 mt-2 w-fit mx-auto">
                <div className="flex gap-0.5 md:gap-1 pl-[3.25rem] md:pl-[4.5rem]">
                    {fBlockCells1.map((cell, i) => renderCell(cell, `f1-${i}`))}
                </div>
                <div className="flex gap-0.5 md:gap-1 pl-[3.25rem] md:pl-[4.5rem]">
                    {fBlockCells2.map((cell, i) => renderCell(cell, `f2-${i}`))}
                </div>
            </div>
        </div>
    );
}

export default PeriodicTable;
