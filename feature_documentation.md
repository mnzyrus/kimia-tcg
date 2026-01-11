# Feature Documentation: pH Neutralization & Advanced Mechanics

This document details the implementation of the pH Neutralization system, Buffer mechanics, and Resource Balance updates for Kimia TCG v2.0.

## 1. Core Mechanics

### 1.1 Water Card ($H_2O$)
*   **Purpose**: Acts as a universal reset for pH instability, returning the player to a neutral state.
*   **Properties**:
    *   **Type**: Sintesis (Special)
    *   **Formula**: H₂O
    *   **Cost**: 1 Energy / 1 Mass (if synthesized directly)
    *   **Effect**: `p.ph = 7.0` (Instant Reset)
*   **Acquisition Methods**:
    1.  **Direct Synthesis**: Combine 2 Hydrogen + 1 Oxygen in the Synthesis Zone.
    2.  **Neutralization Byproduct (Defense)**: When a player successfully neutralizes an Acid attack with a Base (or vice-versa), a Water card is generated and added to their hand.
    3.  **Synthesis Byproduct**: When synthesizing a Salt using its constituent Acid and Base formula, a Water card is generated as a bonus.

### 1.2 Buffer System
Buffers are specific Salt cards that, when present in the player's active state (`activeBuffers`), provide resistance against pH changes.

*   **Logic**:
    *   Formula: `FinalDelta = RawDelta * BufferMultiplier`
    *   `RawDelta`: The incoming pH change (e.g., Acid might cause -1.0 pH).
    *   `BufferMultiplier`: A factor between 0.0 and 1.0. Lower means stronger resistance.
*   **Implemented Buffers**:
    *   **Ammonium Asetat ($CH_3COONH_4$)**: 
        *   Multiplier: `0.3` (Block 70% of change)
        *   Justification: Weak Acid + Weak Base = Strong Buffer.
    *   **Natrium Bikarbonat ($NaHCO_3$)**:
        *   Multiplier: `0.4` (Block 60% of change)
        *   Justification: Common amphoteric buffer.
    *   **Natrium Sitrat ($Na_3C_6H_5O_7$)**:
        *   Multiplier: `0.5` (Block 50% of change)
    *   **Ammonium Klorida ($NH_4Cl$)**:
        *   Multiplier: `0.6` (Block 40% of change)
*   **Visuals**: The Sidebar displays "Buffer Aktif" and the calculated quantitative resistance percentage.

### 1.3 Resource Generation Rules (Turn Logic)
To ensure long-term playability and fairness, the turn-based resource generation has been standardized.

*   **Turn Start (Both Players)**:
    *   **Energy**: +3 E (Capped at Max E)
    *   **Mass**: +4 M (Capped at Max M)
*   **Round Start**:
    *   **Card Draw**: +2 Cards (When `turnNumber` increments)
*   **AI Passive Bonus**:
    *   If AI pH is 7.0 (Stable): +2 E / +2 M additional.
    *   If AI pH is 6.0-8.0 (Stable-ish): +1 E / +1 M additional.

## 2. Technical Implementation

*   **`useGameState.ts`**:
    *   `handleSelfApply`: Refactored to separate calculation logic from state updates (`setGameState`) to prevent React Strict Mode double-invocation visual bugs.
    *   `processAITurn` & `handleEndTurn`: Synchronized resource gain logic.
*   **`gameLogic.ts`**:
    *   `calculateBufferedPHChange`: Returns calculation steps and qualitative data for UI display.
    *   `calculateReaction`: Logic to detect "Neutralization" events and inject the `extraCard` (Water).
*   **`gameData.ts`**:
    *   Added `sin-water` definition.
    *   Updated `garamCards` with `isBuffer` and `bufferMultiplier` properties.
    *   Fixed standard properties (removed invalid `description` duplication).

## 3. User Interface (UI)

*   **Library (`Perpustakaan.tsx`)**:
    *   Added **Khas** (Special) tab.
    *   Filters: Shows `sin-water` and `Tactical` cards for easy reference.
    *   Displays detailed scientific justification and daily usage for educational value.
