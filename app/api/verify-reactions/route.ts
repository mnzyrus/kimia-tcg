
import { NextResponse } from 'next/server';
import { calculateReaction } from '@/lib/gameLogic';
import { elementCards, sintesisCards, garamCards } from '@/lib/gameData';
import { Card } from '@/types';

export async function GET() {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    log("🧪 Starting Advanced Reaction Verification (API Route)...");

    const findCard = (formula: string): Card | undefined => {
        return [...elementCards, ...sintesisCards, ...garamCards].find(c => c.formula === formula);
    };

    let passCount = 0;
    let failCount = 0;

    function assert(condition: boolean, msg: string) {
        if (condition) {
            log(`✅ PASS: ${msg}`);
            passCount++;
        } else {
            log(`❌ FAIL: ${msg}`);
            failCount++;
        }
    }

    // 1. TEST SALT GENERATION (Regression & New Logic)
    log("\n--- Checking Salt Generation ---");
    const saltsToCheck = [
        { a: 'HCl', b: 'NaOH', expected: 'Natrium Klorida' },
        { a: 'CH₃COOH', b: 'NH₃', expected: 'Ammonium Asetat' },
        { a: 'H₂SO₄', b: 'Cu(OH)₂', expected: 'Kuprum(II) Sulfat' },
    ];

    saltsToCheck.forEach(test => {
        const cardA = findCard(test.a);
        const cardB = findCard(test.b);
        if (!cardA || !cardB) {
            log(`❌ ERROR: Missing cards for ${test.a} + ${test.b}`);
            failCount++;
            return;
        }
        const result = calculateReaction(cardA, cardB);
        assert(!!result.cardGenerated && result.cardGenerated.name === test.expected,
            `${test.a} + ${test.b} -> ${test.expected} (Got: ${result.cardGenerated?.name})`);
    });

    // 2. TEST TIER MULTIPLIERS (Same Type)
    log("\n--- Checking Tier Logic (Same Type) ---");

    // Test 2.1: HCl (T0) vs H2SO4 (T0)
    const hcl = findCard('HCl');
    const h2so4 = findCard('H₂SO₄');
    if (hcl && h2so4) {
        const res1 = calculateReaction(hcl, h2so4);
        const expected1 = Math.floor((hcl.power || 0) * 2.0);
        assert(res1.damageDealt === expected1, `HCl (T0) vs H2SO4 (T0): Expected ${expected1}, Got ${res1.damageDealt}`);
    } else { log("❌ Missing HCl/H2SO4"); failCount++; }

    // Test 2.2: CH3COOH (T2) vs HCl (T0)
    const acetic = findCard('CH₃COOH');
    if (acetic && hcl) {
        const res2 = calculateReaction(acetic, hcl);
        const expected2 = Math.floor((acetic.power || 0) * 2.0); // T0 logic dominates
        assert(res2.damageDealt === expected2, `CH3COOH (T2) vs HCl (T0): Expected ${expected2}, Got ${res2.damageDealt}`);
    } else { log("❌ Missing Acetic/HCl"); failCount++; }

    // Test 2.3: Citric (T2) vs Acetic (T2)
    const citric = findCard('C₆H₈O₇');
    if (citric && acetic) {
        const res3 = calculateReaction(citric, acetic);
        const expectedType = 'reaction_bad'; // Bad for defender usually? Wait, Acid vs Acid is Bad for both?
        // Logic says effectType: 'reaction_bad'.
        const expectedDmg = Math.floor((citric.power || 0) * 1.1); // T2 logic (1.1x)
        assert(res3.damageDealt === expectedDmg, `Citric (T2) vs Acetic (T2): Expected ${expectedDmg}, Got ${res3.damageDealt}`);
    } else { log("❌ Missing Citric/Acetic"); failCount++; }


    return NextResponse.json({
        success: failCount === 0,
        passCount,
        failCount,
        logs
    });
}
