# KIMIA TCG COBEBASE REFERENCE (V2.0) 📘
**Status**: Critical Reference
**Last Updated**: 2026-01-02
**Target Audience**: New Developers ("Noobs") & Future AI Agents

This document is the **Encyclopedia** of the project. It explains *how* the code works, not just *what* it does. Use this to understand the logic flow before making changes.

---

## 🏗️ MODULE 1: THE BRAIN (`lib/gameLogic.ts`)
This file contains the **Pure Calculations**. It has NO UI code. It just does math and returns results.

### Core Concepts
1.  **pH Calculation**: The game uses a "Delta" system.
    *   **Formula**: `Delta = 7.0 - Substance_pH`.
    *   **Logic**: If you throw Acid (pH 1) at Neutral (pH 7), the Delta is `6.0`.
    *   **Direction**: This Delta is subtracted from the target. `7.0 - 6.0 = 1.0` (Target becomes Acidic).
2.  **Reactions**: The `calculateReaction` function is the heart of the battle.

### Key Functions Breakdown

#### `calculateReaction(attackingCard, defendingCard)`
*   **Purpose**: Determines what happens when Card A hits Card B.
*   **Logic Flow**:
    1.  **Check Tiers**: Compares `card.tier` (Strong vs Weak).
    2.  **Neutralization Check**: Is it `Acid vs Base`?
        *   **YES**: Search `garamCards` for a specific recipe (e.g., `HCl + NaOH`).
        *   **Found**: Return the Salt Card + Effect (Damage/Buff).
        *   **Not Found**: Return Generic "Neutralization" (0 Damage, but safe).
    3.  **Clash Check**: Is it `Acid vs Acid`?
        *   **YES**: Trigger "Explosion". Damage is multiplied (x1.5 or x2.0).
    4.  **pH Delta**: Calculate how much the target's pH shifts.

#### `applySaltEffect(card)`
*   **Purpose**: activating a Salt card directly.
*   **Logic**: Reads the `reactionConfig` inside the card data to apply Heal, Damage, or Status.

---

## 🎮 MODULE 2: THE FACE (`components/game/GameInterface.tsx`)
This is the **Main Game Loop**. It handles the UI, User Input, and Graphics.

### "Fit-to-Screen" Engine (Mobile Logic)
*   **Location**: Lines 53-69.
*   **How it works**:
    1.  Defines a "Base Size" of `1366x768`.
    2.  Listens for window resize.
    3.  Calculates `scale = Math.min(windowWidth / 1366, windowHeight / 768)`.
    4.  Applies `transform: scale(...)` to the main div.
    *   **Why?**: Guaranteed perfect layout on any phone or tablet.

### The Game Loop Functions
*   **`handleAttack(card, index)`**:
    1.  Validates Energy (Must have >1 E).
    2.  Calls `calculateReaction` (from Module 1).
    3.  **Vulnerability Check**: If Target pH is extreme (<1 or >13), applies **x2 Damage**.
    4.  **Buffer Logic**: Checks if target has active Buffers (reducing pH change).
    5.  **Updates State**: Removes card from hand, subtracts HP, adds log entry.
    6.  **Visuals**: Triggers `addVisualEffect` (Floating numbers).

*   **`handleSynthesize(targetCard)`**:
    1.  **Catalyst Check**: Looks for 'CAT' card in Zone or Hand. Logic: `Cost - 2`.
    2.  **Cost Validation**: Checks if Player has enough Energy (E) and Mass (M).
    3.  **Ingredient Consumption**: Removes required elements (H, O, etc.) from the Zone.
    4.  **Reward**: Adds the Compound Card to Hand.

---

## 🔊 MODULE 3: THE VOICE (`lib/audio.ts`)
Handles all music and sfx.

### SSR Safety (The "Update 1.5" Fix)
*   **Constructor Logic**:
    ```typescript
    constructor() {
        if (typeof window !== 'undefined') { // <--- CRITICAL CHECK
             this.ctx = new AudioContext(); // Only runs in browser
        }
    }
    ```
*   **Why?**: Next.js runs on the server first. Servers don't have speakers (AudioContext). Without the check, the server crashes.

---

## 🤖 MODULE 4: THE OPPONENT (`lib/ai.ts`)
Contains two brains: "Heuristic" (dumb/fast) and "Gemini" (smart/slow).

### 1. `OpponentAI` (The Rule-Based fallback)
*   **Scoring System**: Evaluating moves by points.
    *   **Lethal (1000 pts)**: Can I win *right now*?
    *   **Survival (800 pts)**: Am I dying (<300 HP)? Defense priority.
    *   **Synthesis (500 pts)**: Can I make a strong card?
    *   **Attack (300 pts)**: Standard damage.
*   **Selection**: Sorts all possible moves by score and picks the highest.

### 2. `GeminiService` (The LLM)
*   **Process**:
    1.  Converts Game State (HP, Hand, Board) into a Text Prompt (`createPrompt`).
    2.  Sends to Google Gemini API.
    3.  Receives a JSON response: `{"action": "attack", "cardId": "..."}`.
    4.  Execute move.

---

## ⚙️ MODULE 5: THE SETTINGS (`lib/SettingsContext.tsx`)
Global configuration state (Volume, Language, API Key).
*   **Pattern**: React Context Provider.
*   **Persistence**: Saves to `localStorage` ('kimia_settings').
*   **Note**: If you add a new setting, add it to the `GameSettings` interface here.

---
*End of Reference*
