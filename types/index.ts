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
    // The content for the actor
    privateMsg: string;
    // The content for the opponent
    publicMsg: string;
    // Who did it?
    actorId: 'player1' | 'player2' | 'system';
    type?: 'draw' | 'attack' | 'synthesize' | 'trap' | 'system' | 'info';
    // Legacy support (optional)
    message?: string;
    calculation?: string; // Legacy string
    calculationData?: CalculationData; // New structured data
}

export interface CalculationData {
    equation: string;      // e.g. "HCl -> H+ + Cl-"
    concentration: string; // e.g. "[H+] = 1.0e-7 M"
    formula: string;       // e.g. "pH = -log[H+]"
    steps: string[];       // e.g. ["-log(1.0e-7)", "-(-7)", "pH = 7.0"]
    finalResult: string;   // e.g. "7.0"
    id?: string;           // Unique ID for animation queueing
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
    drawsThisTurn?: number;
    ph: number;
    activeBuffers: ActiveBuffer[];
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
    winner?: 'player1' | 'player2';
    gameLog: LogEntry[];
    activeVisualEffects: VisualEffect[];
}

export interface ReactionResult {
    damageDealt: number;
    recoilDamage: number;
    message: string;
    effectType: 'reaction_good' | 'reaction_bad' | 'damage' | 'toxic' | 'drain' | 'heal';
    pHChange: number;
    energyGain?: number;
    cardGenerated?: Card;
    forcePH?: number;
    opponentDiscardCount?: number;
    resourceDrain?: { e: number, m: number };
    isBuffer?: boolean;
}
