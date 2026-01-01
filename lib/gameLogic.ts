import { ActiveBuffer, CalculationData, Card, GameState, LogEntry, Player, ReactionResult } from '@/types';
import { elementCards, garamCards, PH_COLOR_MAP, sintesisCards, tacticalCards } from './gameData';

export const formatMolarityCalculation = (pH: number) => {
    const val = Math.pow(10, -pH);
    return `[H⁺] = 10^(-${pH}) ≈ ${val.toExponential(2)} M`;
};

export function getPHDetails(pH: number) {
    const clampedPH = Math.max(0.01, Math.min(14, pH));
    const hPlus = Math.pow(10, -clampedPH);
    const ohMinus = Math.pow(10, -(14 - clampedPH));
    const category = PH_COLOR_MAP.find(c => clampedPH <= c.max) || PH_COLOR_MAP[PH_COLOR_MAP.length - 1];
    const formatConc = (c: number) => c >= 0.01 ? c.toFixed(3) : c.toExponential(1);
    return { clampedPH: clampedPH.toFixed(1), color: category.color, name: category.name, effect: category.effect, hPlus: formatConc(hPlus) + ' M', ohMinus: formatConc(ohMinus) + ' M' };
}

export function calculateBufferedPHChange(initialChange: number, activeBuffers: ActiveBuffer[], substancePH?: number): { finalChange: number, calculationSteps: string[], calculationData: CalculationData } {
    // 1. Buffer Existence
    // 2. Combo's pH (The substance being applied)
    // 3. pH Change Value (Delta = 7.0 - Substance pH)
    // 4. Final Number (User's new pH)

    const steps: string[] = [];
    let multiplier = 1.0;
    const bufferNames: string[] = [];

    // Step 1: Buffer Existence
    if (activeBuffers.length > 0) {
        activeBuffers.forEach(buff => {
            multiplier *= buff.multiplier;
            bufferNames.push(`${buff.name} (x${buff.multiplier})`);
        });
        steps.push(`Buffer Aktif: ${bufferNames.join(', ')}`);
    } else {
        steps.push("Buffer Aktif: Tiada (x1.0)");
    }

    // Step 2: Combo's pH (Substance pH)
    // If substancePH is provided, show it. If not (e.g. legacy call), infer or skip.
    const substPHStr = substancePH !== undefined ? substancePH.toFixed(1) : "?";
    steps.push(`pH Bahan: ${substPHStr}`);

    // Step 3: pH Change Value
    // initialChange passed here IS the Delta (calculated as 7.0 - substPH previously or passed directly).
    // Let's assume initialChange IS the intended raw delta.
    const rawDelta = initialChange;
    steps.push(`Perubahan pH (Delta): ${rawDelta > 0 ? '+' : ''}${rawDelta.toFixed(2)}`);

    // Calculation (Not shown as step, but part of logic)
    const finalDelta = rawDelta * multiplier;

    // Step 4: Final pH Number (User's pH) - logic handled by Caller?
    // User requested: "4. the final number of pH of the user would be".
    // This function returns the DELTA. The caller (GameInterface) knows "User's Current pH".
    // So this function can't fully generate Step 4 without knowing Current pH.
    // However, I can return the textual Step 4 template or let the caller append it.
    // Let's return formatted data so UI can render it.

    const calculationData: CalculationData = {
        equation: activeBuffers.length > 0 ? `Buffer: ${bufferNames.join(', ')}` : "Tiada Buffer",
        concentration: `pH Bahan = ${substPHStr}`,
        formula: `ΔpH = (7.0 - ${substPHStr}) × ${multiplier.toFixed(2)}`,
        steps: [
            `Buffer Multiplier: ${multiplier.toFixed(2)}`,
            `Raw Delta: ${rawDelta.toFixed(2)}`,
            `Buffered Delta: ${finalDelta.toFixed(2)}`
        ],
        finalResult: `ΔpH = ${finalDelta > 0 ? '+' : ''}${finalDelta.toFixed(2)}`,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return { finalChange: finalDelta, calculationSteps: steps, calculationData };
}

export function applySaltEffect(card: Card): ReactionResult {
    // Default fallback
    const result: ReactionResult = {
        damageDealt: 0,
        recoilDamage: 0,
        message: `Garam ${card.name} digunakan!`,
        effectType: 'reaction_good',
        pHChange: 0,
        isBuffer: card.isBuffer // Pass through
    };

    if (card.isBuffer) {
        result.message = `BUFFER DIAKTIFKAN: ${card.name}! Rintangan terhadap perubahan pH meningkat.`;
        result.effectType = 'reaction_good';
        return result;
    }

    // Use reactionConfig if available (Data-Driven)
    if (card.reactionConfig) {
        result.message = card.reactionConfig.description;

        // Map config type to ReactionResult
        switch (card.reactionConfig.type) {
            case 'damage':
                result.damageDealt = card.reactionConfig.value || 0;
                result.effectType = 'damage';
                // Special handling for specific ID logic if needed (e.g., Toxic, Splash)
                if (card.id.includes('cuno32')) result.effectType = 'toxic'; // Toxic gas
                break;
            case 'heal':
                result.effectType = 'heal';
                result.damageDealt = -(card.reactionConfig.value || 0); // Negative damage = Heal
                break;
            case 'status':
                result.effectType = 'reaction_bad'; // Generic "Bad thing happening to target"
                result.message = `${card.name}: ${card.reactionConfig.statusName}`;
                break;
            default:
                break;
        }
    } else {
        // Fallback for salts without config (should not happen with full data)
        result.message = "Garam ini tiada kesan khas.";
    }

    return result;
}

export function calculateReaction(attackingCard: Card, defendingCard: Card): ReactionResult {
    const attackPower = attackingCard.power || 0;
    const attackType = attackingCard.sintesisType;
    const defendType = defendingCard.sintesisType || (defendingCard.type === 'Trap' ? 'Trap' : 'Neutral');
    const attackFormula = attackingCard.formula;
    const defendFormula = defendingCard.formula;

    // TIER LOGIC (Default to Weakest (2) if undefined)
    const attackTier = attackingCard.tier !== undefined ? attackingCard.tier : 2;
    const defendTier = defendingCard.tier !== undefined ? defendingCard.tier : 2;

    // Special Reactions & Traps Logic
    if ((attackFormula === 'H₂O₂' && defendFormula === 'Mangkin') || (attackFormula === 'Mangkin' && defendFormula === 'H₂O₂')) {
        return { damageDealt: -200, recoilDamage: 0, message: `PENGURAIAN PANTAS! Oksigen Tulen memulihkan HP.`, effectType: 'heal', pHChange: 0 };
    }

    // ACID vs BASE (Neutralization) - Including Amphoteric
    const isAcid = (type: string | undefined) => type === 'Asid';
    const isBase = (type: string | undefined) => type === 'Bes' || type === 'Amfoterik';

    if ((isAcid(attackType) && isBase(defendType)) || (isBase(attackType) && isAcid(defendType))) {
        // Try to find specific salt
        const source1 = `${attackFormula} + ${defendFormula}`;
        const source2 = `${defendFormula} + ${attackFormula}`;

        // Strict lookup based on defined Sources in gameData
        const specificSalt = garamCards.find(g => g.source === source1 || g.source === source2);

        if (specificSalt) {
            const newSaltCard = { ...specificSalt, id: `salt-gen-${Date.now()}` };
            const reactionDesc = specificSalt.reactionConfig?.description || `PENEUTRALAN BERJAYA! Garam ${specificSalt.name} terhasil.`;
            const damageVal = specificSalt.reactionConfig?.type === 'damage' ? (specificSalt.reactionConfig.value || 0) : 0;

            let effectType: 'reaction_good' | 'reaction_bad' | 'damage' | 'toxic' | 'drain' | 'heal' = 'reaction_good';
            if (specificSalt.reactionConfig?.type === 'damage') effectType = 'damage';
            if (specificSalt.reactionConfig?.type === 'heal') effectType = 'heal';
            if (specificSalt.reactionConfig?.type === 'status') effectType = 'reaction_bad';

            return {
                damageDealt: damageVal,
                recoilDamage: 0,
                message: reactionDesc,
                effectType: effectType,
                pHChange: 0,
                forcePH: 7.0, // Neutralization resets to 7 check? Or just delta 0? usually brings closer to 7. 
                // Logic: A complete neutralization theoretically brings pH to 7 unless excess reagent.
                // Simplified: pH Change towards 7? 
                // Existing code had pHChange 0. Let's stick to 0 (Neutralized).
                cardGenerated: newSaltCard
            };
        }

        // Fallback Logic if NO Salt found
        if (attackTier === defendTier) {
            return { damageDealt: 0, recoilDamage: 30, message: `PENEUTRALAN SEIMBANG! (Tiada Garam Khusus)`, effectType: 'reaction_good', pHChange: 0 };
        } else if (defendTier < attackTier) {
            return { damageDealt: 0, recoilDamage: 0, message: `PERTAHANAN KUKUH!`, effectType: 'reaction_good', pHChange: 0 };
        } else {
            const damage = Math.floor(attackPower / 2);
            return { damageDealt: damage, recoilDamage: 0, message: `PERTAHANAN LEMAH! ${damage} damage tembus.`, effectType: 'reaction_bad', pHChange: 0.5 }; // Keep small leak for partial
        }
    }

    // SAME TYPE CLASH (Acid vs Acid / Base vs Base)
    if (attackType === defendType && attackType !== undefined) {
        const highestTier = Math.min(attackTier, defendTier);
        let multiplier = 1.1;
        if (highestTier <= 0) multiplier = 2.0;
        else if (highestTier <= 0.5) multiplier = 1.75;
        else if (highestTier <= 1.0) multiplier = 1.5;
        else if (highestTier <= 1.5) multiplier = 1.25;

        const finalDamage = Math.floor(attackPower * multiplier);
        // Clash usually worsens pH in that direction
        // If Acid vs Acid, pH drops more.
        return {
            damageDealt: finalDamage,
            recoilDamage: 0,
            message: `LETUPAN ${attackType.toUpperCase()}! (Tier ${highestTier} x${multiplier})`,
            effectType: 'reaction_bad',
            pHChange: 1.0 // Simple penalty
        };
    }

    // Trap
    if (defendingCard.type === 'Trap') return { damageDealt: 0, recoilDamage: 0, message: `PERANGKAP DIAKTIFKAN!`, effectType: 'reaction_good', pHChange: 0 };

    // Direct Hit logic (UPDATED to 7.0 - pH)
    const substancePH = attackingCard.pH !== undefined ? attackingCard.pH : (attackType === 'Asid' ? 3.0 : (attackType === 'Bes' ? 11.0 : 7.0));
    // Calculate Delta: 7.0 - Substance pH
    // Example: Acid (pH 1.0) -> 7.0 - 1.0 = +6.0?
    // Wait. If pH is 1.0 (Acid), it should LOWER user pH.
    // If I throw Acid at you, your pH goes DOWN.
    // So Delta should be negative? 
    // Formula user asked: "7.0 - (-log[H+])" -> "7.0 - pH".
    // 7.0 - 1.0 = +6.0. If we ADD 6.0 to 7.0, we get 13.0 (Base). WRONG.
    // Acid should REDUCE pH.
    // Maybe user meant "pH Change" is the Magnitude? Or "Target pH"?
    // "the final ph from the ph 7 of the neutral to that number which is 0.5 of sulfiric acid cause ph from 7.0 to 0.5. in short the caculation of the ph change should be 7.0 - (-log[H+]). this is the delta pH"
    // If H2SO4 pH is 0.5. Delta = 7.0 - 0.5 = 6.5.
    // If we want result to be 0.5, we SUBTRACT 6.5 from 7.0.
    // So Delta is 6.5. Direction depends on Acid/Base?
    // "Base (pH 14)": Delta = 7.0 - 14.0 = -7.0.
    // If we SUBTRACT -7.0 from 7.0 -> 14.0. Correct.
    // So Logic: New pH = Current pH - (7.0 - Substance pH).
    // Let's verify:
    // Acid (pH 0.5): Delta = 7.0 - 0.5 = 6.5. Current(7) - 6.5 = 0.5. Correct.
    // Base (pH 14.0): Delta = 7.0 - 14.0 = -7.0. Current(7) - (-7.0) = 14.0. Correct.
    // Acid (pH 1.0) on Base (pH 14.0):
    // Delta = 7.0 - 1.0 = 6.0.
    // Result = 14.0 - 6.0 = 8.0. (Neutralization). Correct direction.

    let deltaPH = 7.0 - substancePH;
    // We return "pHChange" to be APPLIED. 
    // In handleAttack: "newPH = oldPH + pHChange".
    // So if I want "Current - Delta", and Delta is positive (6.5), I need to return -6.5?
    // User formula: "7.0 - (-log[H+])" = 6.5.
    // User said: "final ph should also include the current pH(buffer multiplier) - the change of pH".
    // "Current - Change".
    // So if Change is 6.5, Final = Current - 6.5.
    // GameInterface uses `defender.ph + finalPHChange`.
    // So if I want subtraction, `finalPHChange` should be negative of user's Delta.
    // User Delta = 6.5.
    // return value for `pHChange` should be `-6.5`?
    // Let's stick to returning the value derived from "Change direction".
    // But `calculateBufferedPHChange` logic says `initialChange * multiplier`.
    // If user's delta is 6.5, and I perform `Current - 6.5`, then `initialChange` passed to `gameInterface` logic should be `-6.5`.
    // Or I change `GameInterface` to SUBTRACT.
    // User said: "Current ... - the change of pH".
    // So I will calculate `Change = 7.0 - SubstancePH`.
    // And in `GameInterface`, I will do `Current - Change`.
    // So `calculateReaction` should return the POSITIVE magnitude of change if Acid (6.5), and NEGATIVE magnitude if Base (-7.0)?
    // Wait.
    // 7.0 - 14.0 = -7.0.
    // Current(7) - (-7.0) = 14. Correct.
    // 7.0 - 0.5 = 6.5.
    // Current(7) - 6.5 = 0.5. Correct.
    // So `calculateReaction` should return `7.0 - SubstancePH` explicitly.

    return { damageDealt: attackPower, recoilDamage: 0, message: `SERANGAN TERUS!`, effectType: 'damage', pHChange: deltaPH };
}

export function createDeck(): Card[] {
    const deck: Card[] = [];

    // Re-implementing ensure correctness by ID/Symbol search
    const getCard = (id: string) => elementCards.find(e => e.id === id)!;

    const add = (id: string, count: number, prefix: string) => {
        const c = getCard(id);
        if (!c) return;
        for (let k = 0; k < count; k++) deck.push({ ...c, id: `${prefix}-${Math.random()}` });
    }

    // Explicit counts from Reference Code (Reference Logic line 83-93 approx)
    add('el-h', 24, 'H'); // Increased to be more than O (22)
    add('el-o', 22, 'O'); // 6 + 16 (Reference specific)
    add('el-c', 4, 'C');
    add('el-na', 4, 'Na');
    add('el-cl', 3, 'Cl');
    add('el-s', 2, 'S');
    add('el-n', 3, 'N');
    add('el-mg', 3, 'Mg');
    add('el-cu', 3, 'Cu');
    add('el-al', 3, 'Al');

    // Tacticals
    for (let i = 0; i < 3; i++) deck.push({ ...tacticalCards[0], id: `Tac-${Math.random()}` });

    return deck.sort(() => Math.random() - 0.5);
}

export function initializeGame(p1Name: string, p2Name: string): GameState {
    const p1Deck = createDeck();
    const p2Deck = createDeck();
    const player1: Player = {
        id: 'player1', name: p1Name || 'Pemain 1', hp: 1000, maxHP: 1000, currentE: 4, maxE: 10, currentM: 15, maxM: 20,
        hand: [], makmal: [], synthesisZone: [], bukuFormula: [...sintesisCards], timbunanBuang: [], statusEffects: [], deck: p1Deck, trapSlot: null,
        isCatalystActive: false, drawsThisTurn: 0, ph: 7.0, activeBuffers: []
    };
    const player2: Player = {
        id: 'player2', name: p2Name || 'Pemain 2', hp: 1000, maxHP: 1000, currentE: 4, maxE: 10, currentM: 15, maxM: 20,
        hand: [], makmal: [], synthesisZone: [], bukuFormula: [...sintesisCards], timbunanBuang: [], statusEffects: [], deck: p2Deck, trapSlot: null,
        isCatalystActive: false, drawsThisTurn: 0, ph: 7.0, activeBuffers: []
    };
    for (let i = 0; i < 10; i++) { if (player1.deck.length) player1.hand.push(player1.deck.pop()!); if (player2.deck.length) player2.hand.push(player2.deck.pop()!); }

    // Ensure initial H card
    const hCard = elementCards.find(e => e.symbol === 'H');
    if (hCard) {
        player1.hand.push({ ...hCard, id: `H-init-p1-${Date.now()}` });
        player2.hand.push({ ...hCard, id: `H-init-p2-${Date.now()}` });
    }

    return { currentPlayer: 'player1', player1, player2, turnNumber: 1, gameLog: [{ id: 0, message: 'Permainan bermula!', privateMsg: 'Permainan bermula!', publicMsg: 'Permainan bermula!', actorId: 'system', turn: 0 }], activeVisualEffects: [] };
}
