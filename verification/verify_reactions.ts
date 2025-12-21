
import { calculateReaction } from '../lib/gameLogic';
import { elementCards, sintesisCards, garamCards } from '../lib/gameData';
import { Card } from '../types';

console.log("🧪 Starting Advanced Reaction Verification...");

const findCard = (formula: string): Card | undefined => {
    return [...elementCards, ...sintesisCards, ...garamCards].find(c => c.formula === formula);
};

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, msg: string) {
    if (condition) {
        console.log(`✅ PASS: ${msg}`);
        passCount++;
    } else {
        console.error(`❌ FAIL: ${msg}`);
        failCount++;
    }
}

// 1. TEST SALT GENERATION (Regression & New Logic)
console.log("\n--- Checking Salt Generation ---");
const saltsToCheck = [
    { a: 'HCl', b: 'NaOH', expected: 'Natrium Klorida' }, // Strong A + Strong B
    { a: 'CH₃COOH', b: 'NH₃', expected: 'Ammonium Asetat' }, // Weak A + Weak B
    { a: 'H₂SO₄', b: 'Cu(OH)₂', expected: 'Kuprum(II) Sulfat' }, // Strong A + Weak B
];

saltsToCheck.forEach(test => {
    const cardA = findCard(test.a);
    const cardB = findCard(test.b);
    if (!cardA || !cardB) {
        console.error(`Missing cards for ${test.a} + ${test.b}`);
        return;
    }
    const result = calculateReaction(cardA, cardB);
    assert(!!result.cardGenerated && result.cardGenerated.name === test.expected,
        `${test.a} + ${test.b} -> ${test.expected} (Got: ${result.cardGenerated?.name})`);
});

// 2. TEST TIER MULTIPLIERS (Same Type)
console.log("\n--- Checking Tier Logic (Same Type) ---");
// HCl (T0, Power 150) vs H2SO4 (T0, Power 250) -> Acid vs Acid
// Expected: Multiplier 2.0x (T0) on Attack Power.
const hcl = findCard('HCl')!;
const h2so4 = findCard('H₂SO₄')!;

const result1 = calculateReaction(hcl, h2so4); // HCl attacks H2SO4
const expectedDmg1 = Math.floor(hcl.power! * 2.0);
assert(result1.damageDealt === expectedDmg1,
    `HCl (T0) vs H2SO4 (T0): Expected ${expectedDmg1} Dmg (150 * 2.0), Got ${result1.damageDealt}`);

// CH3COOH (T2, Power 80) vs HCl (T0) -> Acid vs Acid
// Highest Tier is T0 (HCl). Multiplier should be 2.0x even though Attacker is T2?
// Logic implemented: min(tierA, tierB). min(2, 0) = 0.
// Multiplier for T0 = 2.0.
// Attack Power (CH3COOH) = 80. Expected = 80 * 2.0 = 160.
const acetic = findCard('CH₃COOH')!;
const result2 = calculateReaction(acetic, hcl);
const expectedDmg2 = Math.floor(acetic.power! * 2.0);
assert(result2.damageDealt === expectedDmg2,
    `CH3COOH (T2) vs HCl (T0): Expected ${expectedDmg2} Dmg (80 * 2.0), Got ${result2.damageDealt}`);

// Citric (T2, Power 100) vs Acetic (T2) -> Acid vs Acid
// Highest Tier is T2. Multiplier 1.1x.
// Power 100 * 1.1 = 110.
const citric = findCard('C₆H₈O₇')!;
const result3 = calculateReaction(citric, acetic);
const expectedDmg3 = Math.floor(citric.power! * 1.1);
assert(result3.damageDealt === expectedDmg3,
    `Citric (T2) vs Acetic (T2): Expected ${expectedDmg3} Dmg (100 * 1.1), Got ${result3.damageDealt}`);


console.log(`\n📊 SUMMARY: ${passCount} Passed, ${failCount} Failed.`);
if (failCount === 0) console.log("✨ Advanced Reaction Logic Verified!");
