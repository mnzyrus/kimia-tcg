export type CardType = 'Element' | 'Sintesis' | 'Taktikal' | 'Garam' | 'Trap' | 'Catalyst' | 'Compound' | 'Neutral';

export interface ReactionConfig {
    type: 'damage' | 'heal' | 'status' | 'neutral';
    value?: number;
    statusName?: string;
    description: string;
}

export interface Card {
    id: string;
    name: string;
    type: CardType;
    sintesisType?: 'Asid' | 'Bes' | 'Neutral' | 'Amfoterik';
    formula?: string;
    symbol?: string;
    description: string;
    effect?: string;
    scientificJustification?: string;
    molecularStructure?: string;
    dailyUsage?: string;
    eCost?: number;
    mCost?: number;
    power?: number;
    tier?: number;
    group?: number;
    period?: number;
    origin?: string;
    rarity?: 'Biasa' | 'Tidak Biasa' | 'Langka';
    pH?: number;
    requirements?: { element: string; count: number }[];
    source?: string;
    tcgEffect?: string;
    isBuffer?: boolean;
    bufferMultiplier?: number; // e.g. 0.01 for strong buffer
    bufferDuration?: number;   // Turns it lasts
    reactionConfig?: ReactionConfig;
}

export interface ActiveBuffer {
    id: string;
    name: string;
    multiplier: number;
    turnsRemaining: number;
    description: string;
}

export interface ReactionEntry {
    attackerFormula: string;
    defenderFormula: string;
    reactionName: string;
    equation: string;
    tcgEffect: string;
    description: string;
}

export interface LogEntry {
    id: number;
    turn: number;
    message: string;
    publicMessage?: string;
    privateMsg?: string; // [FIX] Added alias for legacy support
    publicMsg?: string;  // [FIX] Added alias for legacy support
    timestamp: number;
    type: 'action' | 'reaction' | 'system' | 'chat' | 'draw' | 'heal' | 'info' | 'attack' | 'synthesize';
    actorId?: string;
    calculation?: string; // [FIX] Added missing property used in GameUI
}

export interface Player {
    id: string;
    name: string;
    hp: number;
    maxHP: number;
    currentE: number;
    maxE: number;
    currentM: number;
    maxM: number;
    hand: Card[];
    makmal: Card[];
    synthesisZone: Card[];
    bukuFormula: Card[];
    timbunanBuang: Card[];
    statusEffects: any[];
    deck: Card[];
    trapSlot: Card | null;
    isCatalystActive?: boolean;
    ph: number;
    activeBuffers: ActiveBuffer[];
    drawCount: number;
    drawsThisTurn?: number; // [FIX] Added compatibility property (same as drawCount)
}

// [FIX] Added missing ReactionResult interface
export interface ReactionResult {
    damageDealt: number;
    recoilDamage: number;
    message: string;
    effectType: 'reaction_good' | 'reaction_bad' | 'damage' | 'toxic' | 'drain' | 'heal' | 'info';
    pHChange: number;
    isBuffer?: boolean;
    forcePH?: number;
    cardGenerated?: Card;
}

export interface VisualEffect {
    id: string | number;
    type: 'synthesis' | 'damage' | 'heal' | 'info' | 'reaction_good' | 'reaction_bad' | 'toxic' | 'drain';
    description: string;
    value?: number | string;
    position?: { x: number, y: number };
    createdAt?: number;
    duration?: number;
}

export interface GameState {
    currentPlayer: 'player1' | 'player2';
    player1: Player;
    player2: Player;
    turnNumber: number;
    winner?: 'player1' | 'player2' | 'draw';
    paused?: boolean;
    gameLog: LogEntry[];
    activeVisualEffects: VisualEffect[];
}

export interface CalculationData {
    id: string; // [FIX] Added ID
    equation: string;
    concentration: string;
    formula: string;
    steps: string[];
    finalResult: string;
}

export interface GameSettings {
    audio: {
        masterVolume: number;
        sfxVolume: number;
        musicVolume: number;
        voiceVolume: number;
        muted: boolean;
    };
    visuals: {
        quality: 'low' | 'medium' | 'high';
        animations: boolean;
        particles: boolean;
    };
    gameplay: {
        autoEndTurn: boolean;
        showTutorials: boolean;
        difficulty: 'easy' | 'medium' | 'hard';
        gameSpeed: 'slow' | 'normal' | 'fast';
    };
}
