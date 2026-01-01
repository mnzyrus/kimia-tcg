# Lib Folder Documentation - Core Services

**Project**: Kimia TCG (GitHub Version)  
**Purpose**: Core game logic, data, and services  
**Last Updated**: January 1, 2026

---

## 📋 Overview

The `lib` folder contains **8 critical service files** that power the entire game. These are the "brain" of the application - all game logic, card data, AI, audio, and multiplayer functionality lives here.

### File Structure:
```
lib/
├── gameData.ts          ← 🔴 CRITICAL: All card data (1066 lines)
├── gameLogic.ts         ← 🔴 CRITICAL: Core game mechanics (320 lines)
├── ai.ts                ← 🔴 CRITICAL: AI opponent logic (285 lines)
├── audio.ts             ← Audio/BGM system (179 lines)
├── settings.ts          ← Settings persistence (64 lines)
├── matchmaking.ts       ← Multiplayer matchmaking (131 lines)
├── phEvents.ts          ← pH animation triggers (15 lines)
└── supabaseClient.ts    ← Database connection (8 lines)
```

---

## 🔴 CRITICAL FILES (MUST PRESERVE)

### 1. `gameData.ts` - Card Database 🔴🔴🔴

**Size**: 1066 lines, 53KB  
**Purpose**: Defines ALL cards, reactions, and game data

**Contents**:
- `PH_COLOR_MAP` (22 entries): pH ranges with colors and damage multipliers
- `REACTION_LIBRARY` (27 reactions): All acid-base reactions with educational descriptions
- `elementCards` (10 cards): Periodic table elements (H, C, O, N, Na, Mg, Al, S, Cl, Cu)
- `sintesisCards` (13 cards): Acids and bases (HCl, H₂SO₄, NaOH, NH₃, etc.)
- `garamCards` (25+ cards): Salt products from reactions

**Why Critical**:
- **Game Balance**: All damage, costs, and effects defined here
- **Educational Content**: Real chemistry with Malaysian descriptions
- **Reaction System**: Maps attacker + defender → salt product

**Example Entry**:
```typescript
{
    id: 'sin-hcl',
    name: 'Asid Hidroklorik',
    formula: 'HCl',
    power: 150,
    pH: 1.0,
    requirements: [{ element: 'H', count: 1 }, { element: 'Cl', count: 1 }],
    scientificJustification: 'Asid kuat monoprotik...',
    dailyUsage: 'Digunakan untuk membersihkan keluli...'
}
```

**DO NOT**:
- Delete or rename card IDs (breaks save files)
- Change formulas without updating reaction library
- Remove scientific justifications (educational value)

---

### 2. `gameLogic.ts` - Core Mechanics 🔴🔴🔴

**Size**: 320 lines, 16KB  
**Purpose**: Game rules, reactions, pH calculations

**Key Functions**:

#### `calculateReaction(attacker, defender)` 🔴
- **Purpose**: Determines damage, salt generation, pH changes
- **Logic**:
  1. Acid + Base → Neutralization (generates salt)
  2. Same type clash → Amplified damage
  3. Direct hit → Apply pH change formula: `Δ pH = 7.0 - substancePH`
- **Returns**: `{ damageDealt, recoilDamage, message, pHChange, cardGenerated }`

#### `calculateBufferedPHChange(delta, buffers, substancePH)` 🔴
- **Purpose**: Applies buffer resistance to pH changes
- **Formula**: `finalChange = rawDelta × bufferMultiplier`
- **Returns**: Calculation steps for UI display

#### `createDeck()` 🔴
- **Purpose**: Generates starting deck (71 cards)
- **Distribution**:
  - H: 24 cards (most common)
  - O: 22 cards
  - C, Na, Cl, S, N, Mg, Cu, Al: 3-4 each
  - 3 Tactical cards

#### `initializeGame(p1Name, p2Name)` 🔴
- **Purpose**: Creates initial game state
- **Setup**:
  - Both players: 1000 HP, 4 E, 15 M
  - 10 cards drawn + 1 bonus H card
  - pH starts at 7.0 (neutral)

**Why Critical**:
- **Game Balance**: All damage calculations happen here
- **pH System**: Unique mechanic that differentiates this game
- **Deck Building**: Ensures fair starting hands

---

### 3. `ai.ts` - AI Opponent 🔴🔴

**Size**: 285 lines, 12KB  
**Purpose**: Smart AI and Gemini AI integration

**Two AI Systems**:

#### A. `OpponentAI.calculateMove()` - Rule-Based AI 🔴
**Decision Priority** (scored 0-1000+):
1. **Lethal Check** (1000+): Can we win NOW?
2. **Survival** (800+): HP < 300 → defend/heal
3. **Synthesis** (500-700): Create powerful compounds
4. **Attack** (300-500): Deal damage efficiently
5. **Trap** (200): Set up defense
6. **Draw** (100): Refill hand
7. **End Turn** (fallback)

**Example Logic**:
```typescript
if (result.damageDealt >= opponent.hp) {
    return { action: 'attack', card, index, score: 1000 };
}
```

#### B. `GeminiService.calculateMove()` - Gemini AI
- **Fallback**: Uses `OpponentAI` if API key missing or error
- **Prompt**: Sends game state as JSON to Gemini 1.5 Flash
- **Response**: Parses JSON action from AI

**Why Critical**:
- **Single Player**: Game unplayable without AI
- **Smart Decisions**: Prioritizes lethal, survival, efficiency
- **Gemini Integration**: Optional advanced AI

---

## 🟡 IMPORTANT FILES (PRESERVE FUNCTIONALITY)

### 4. `audio.ts` - Sound System

**Purpose**: BGM and SFX playback  
**Key Features**:
- BGM URLs (menu + battle music)
- Web Audio API for SFX generation
- Volume control (BGM, SFX)

**Note**: Local version has Master Volume (GitHub doesn't)

---

### 5. `settings.ts` - Settings Persistence

**Purpose**: Save/load game settings via localStorage  
**Settings**:
- Audio: bgmVolume, sfxVolume
- Visuals: graphicsQuality, animations
- Gameplay: difficulty, language
- System: geminiApiKey

---

### 6. `matchmaking.ts` - Multiplayer

**Purpose**: Supabase Realtime matchmaking  
**Functions**:
- `createRoom(playerId, code)`: Host creates room
- `joinRoom(playerId, code)`: Guest joins room
- `findRandomMatch(playerId)`: Quick match

---

### 7. `phEvents.ts` - pH Animations

**Purpose**: Triggers pH change animations  
**Function**: `triggerPHAnimation(calculationData)`  
**Note**: Tiny file (15 lines) but critical for UX

---

### 8. `supabaseClient.ts` - Database Connection

**Purpose**: Initializes Supabase client  
**Note**: Only 8 lines, but required for multiplayer

---

## 🎯 Key Concepts to Understand

### pH System
```
pH 0-1:   DANGER (2.0x Acid damage vulnerability)
pH 6-8:   STABLE (+1 E/M bonus per turn)
pH 13-14: DANGER (2.0x Base damage vulnerability)
```

### Reaction Formula
```
Δ pH = 7.0 - substancePH
Final pH = Current pH - Δ pH

Example:
- H₂SO₄ (pH 0.5) on neutral (pH 7.0)
- Δ pH = 7.0 - 0.5 = 6.5
- Final = 7.0 - 6.5 = 0.5 ✓
```

### Card Synthesis
```
Requirements: [{ element: 'H', count: 2 }, { element: 'S', count: 1 }, { element: 'O', count: 4 }]
Cost: 4 E, 4 M
Result: H₂SO₄ (250 DMG acid)
```

---

## 📊 Dependency Graph

```
gameData.ts (Data Layer)
    ↓
gameLogic.ts (Logic Layer) → Uses card data
    ↓
ai.ts (AI Layer) → Uses gameLogic.calculateReaction()
    ↓
GameInterface.tsx (UI Layer) → Calls AI, applies logic
```

---

## ⚠️ Critical Warnings

### DO NOT:
1. **Delete `gameData.ts`**: Entire game breaks (no cards)
2. **Modify card IDs**: Breaks save files and multiplayer sync
3. **Change reaction formulas**: Breaks game balance
4. **Remove AI fallback**: Game crashes if Gemini fails
5. **Delete `createDeck()`**: Players can't start games

### SAFE TO MODIFY:
1. Card descriptions (educational content)
2. BGM URLs (change music)
3. AI scoring weights (tune difficulty)
4. Settings defaults
5. pH color map (visual only)

---

## 🔧 Future Development

### Adding New Cards:
1. Add to `elementCards`, `sintesisCards`, or `garamCards`
2. Define requirements, costs, power
3. Add to `REACTION_LIBRARY` if it reacts
4. Update `createDeck()` distribution

### Adding New Reactions:
1. Add entry to `REACTION_LIBRARY`
2. Define attacker + defender formulas
3. Create salt card in `garamCards`
4. Set `source` field to match reaction

---

## 📚 Related Documentation

- [App Folder](./APP_FOLDER.md) - Routing and pages
- [Components Folder](./COMPONENTS.md) - UI components
- [Types Folder](./TYPES.md) - TypeScript definitions

---

**Remember**: The `lib` folder is the BRAIN. The `app` folder is the SKELETON. The `components` folder is the SKIN. All three must work together!
