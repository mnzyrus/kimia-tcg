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

export function calculateBufferedPHChange(initialChange: number, activeBuffers: ActiveBuffer[]): { finalChange: number, calculationSteps: string[], calculationData: CalculationData } {
    if (initialChange === 0) return {
        finalChange: 0,
        calculationSteps: ["Tiada perubahan pH."],
        calculationData: {
            equation: "Neutral",
            concentration: "No Change",
            formula: "pH = Constant",
            steps: ["No Reaction"],
            finalResult: "No Change"
        }
    };

    const steps: string[] = [];
    let multiplier = 1.0;

    steps.push(`Perubahan pH Asal: ${initialChange > 0 ? '+' : ''}${initialChange.toFixed(2)}`);

    if (activeBuffers.length > 0) {
        // Apply strongest buffer (lowest multiplier) or multiply them? User said: "time the multiplier = final ph change".
        // Let's multiply them for stacking effect, but usually buffers don't stack infinitely.
        // User: "multiplier of each buffer salt... change the default multiplier of 1 to the multipier of the buffer."
        // Let's assume we take the BEST (lowest) multiplier if multiple exist, or multiply.
        // Let's multiply for now as it's simpler mechanically.

        activeBuffers.forEach(buff => {
            multiplier *= buff.multiplier;
            steps.push(`Buffer Aktif (${buff.name}): x${buff.multiplier}`);
        });
    } else {
        steps.push(`Tiada Buffer Aktif: x1.0`);
    }

    const finalChange = initialChange * multiplier;
    steps.push(`Pengiraan Akhir: ${initialChange.toFixed(2)} x ${multiplier.toFixed(4)} = ${finalChange.toFixed(4)}`);
    steps.push(`Perubahan pH Sebenar: ${finalChange > 0 ? '+' : ''}${finalChange.toFixed(4)}`);

    const calculationData: CalculationData = {
        equation: activeBuffers.length > 0 ? `Buffer: ${activeBuffers.map(b => b.name).join(', ')}` : "Tanpa Buffer",
        concentration: `ΔpH Awal = ${initialChange.toFixed(3)}`,
        formula: `ΔpH_Final = ΔpH_Initial × Multiplier`,
        steps: [
            `Multiplier = ${multiplier.toFixed(4)}`,
            `ΔpH = ${initialChange.toFixed(3)} × ${multiplier.toFixed(4)}`,
        ],
        finalResult: `ΔpH = ${finalChange.toFixed(4)}`
    };

    return { finalChange, calculationSteps: steps, calculationData };
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
                // Negative damage represents healing in some contexts, but let's use a specific field or external handling
                // Ideally, the caller handles 'heal' effect type by healing specific amount
                result.effectType = 'heal';
                result.damageDealt = -(card.reactionConfig.value || 0); // Negative damage = Heal for attacker? 
                // Wait, if I use it ON opponent, it shouldn't heal opponent. 
                // Salts are "attacks" usually? 
                // Actually, some salts are self-buffs (Heal). 
                // If I play NaCl (Heal 50), it heals ME.
                // The caller needs to know TARGET.
                // For now, let's keep damageDealt positive for damage, and handle healing via effectType.
                result.damageDealt = 0;
                // We need a way to pass Heal Value. ReactionResult doesn't have explicit healValue, 
                // but usually handled via effectType check and logic in component.
                // Let's overload 'damageDealt' as heal value if type is 'heal'? 
                // Or better, let's look at how calculateReaction does it.
                // calculateReaction returns effectType: 'heal'. 
                // In GameInterface, handleAttack logic: if result.effectType === 'heal', newSelfHP += 200 (for example).
                // So here, if heal -> damageDealt should be 0, and we rely on looking up the card's config value in UI?
                // NO, we should return the value.
                // Let's add 'value' to ReactionResult optional? Or just reuse damageDealt as value param.
                // Let's check calculateReaction line 29: damageDealt: -200 (Negative damage as heal).
                // So yes, damageDealt negative = Heal.
                result.damageDealt = -(card.reactionConfig.value || 0);
                break;
            case 'status':
                result.effectType = 'reaction_bad'; // Generic "Bad thing happening to target"
                result.message = `${card.name}: ${card.reactionConfig.statusName}`;
                // Usage of specific status names 'Blind', 'Stun' etc will be parsed by UI from reactionConfig or manually here
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

            // Logic for 'heal' type is handled by component interpretation usually, 
            // but for 'ReactionResult' consistency, we keep damage positive and rely on effectType 'heal'.
            // Unless it's attacking enemy, then it must be 0? 
            // Actually, if I attack Opponent with Salt producing Heal, usually Opponent doesn't heal.
            // But this function is called when Attacking Defender.
            // If Result has 'cardGenerated', defender gets Card. 
            // The 'message' describes effect. 
            // The actual immediate 'damage' is usually 0 for Neutralization unless Salt explodes.
            // Let's rely on config.

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
                forcePH: 7.0,
                cardGenerated: newSaltCard
            };
        }

        // Fallback Logic if NO Salt found (should be rare with full data)
        if (attackTier === defendTier) {
            return { damageDealt: 0, recoilDamage: 30, message: `PENEUTRALAN SEIMBANG! (Tiada Garam Khusus)`, effectType: 'reaction_good', pHChange: 0 };
        } else if (defendTier < attackTier) { // Lower number = Stronger Tier (0 > 2)
            // Defendant is Stronger (e.g. T0 vs T1) -> Defense Wins (No Dmg)
            return { damageDealt: 0, recoilDamage: 0, message: `PERTAHANAN KUKUH! (Tier ${defendTier} vs ${attackTier})`, effectType: 'reaction_good', pHChange: 0 };
        } else {
            // Attacker is Stronger (e.g. T0 vs T2) -> Piercing
            const damage = Math.floor(attackPower / 2);
            return { damageDealt: damage, recoilDamage: 0, message: `PERTAHANAN LEMAH! ${damage} damage tembus.`, effectType: 'reaction_bad', pHChange: 0.5 };
        }
    }

    // SAME TYPE CLASH (Acid vs Acid / Base vs Base)
    // Logic: Damage Multiplied by Highest Tier (Lowest Number)
    if (attackType === defendType && attackType !== undefined) {
        // Find highest tier (smallest number)
        const highestTier = Math.min(attackTier, defendTier);
        let multiplier = 1.1; // Default T2

        if (highestTier <= 0) multiplier = 2.0;       // T0
        else if (highestTier <= 0.5) multiplier = 1.75; // T0.5
        else if (highestTier <= 1.0) multiplier = 1.5;  // T1
        else if (highestTier <= 1.5) multiplier = 1.25; // T1.5

        const finalDamage = Math.floor(attackPower * multiplier);

        return {
            damageDealt: finalDamage,
            recoilDamage: 0,
            message: `LETUPAN ${attackType.toUpperCase()}! (Tier ${highestTier} x${multiplier})`,
            effectType: 'reaction_bad',
            pHChange: 1
        };
    }

    // Trap
    if (defendingCard.type === 'Trap') return { damageDealt: 0, recoilDamage: 0, message: `PERANGKAP DIAKTIFKAN!`, effectType: 'reaction_good', pHChange: 0 };

    // Direct Hit
    let directPHChange = 0;
    if (attackType === 'Asid') directPHChange = -0.5;
    if (attackType === 'Bes') directPHChange = 0.5;
    if (attackTier <= 0.5 && directPHChange !== 0) directPHChange *= 2; // Stronger effect for Tier 0/0.5

    return { damageDealt: attackPower, recoilDamage: 0, message: `SERANGAN TERUS!`, effectType: 'damage', pHChange: directPHChange };
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
