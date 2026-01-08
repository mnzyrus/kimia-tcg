# KIMIA TCG: Game Mechanics Deep Dive

## 1. Introduction
This document serves as the granular source of truth for the core gameplay mechanics of Kimia TCG, specifically focusing on the **Kebuk Sintesis (Synthesis Zone)**, **Turn Flow**, and **Game Components**. It is written to ensure absolute clarity on the intended design, overriding any previous assumptions.

## 2. Kebuk Sintesis (Synthesis Zone) Logic

The "Kebuk Sintesis" is the heart of the crafting system. It is NOT merely a storage area; it is a **Reactive Chamber**.

### 2.1. Strict Isolation Rule
*   **The Golden Rule**: Synthesis recipes must be formed **entirely within the Kebuk Sintesis**.
*   **Constraint**: The game must **NEVER** consider cards in the Player's Hand as part of a potential recipe.
    *   *Incorrect*: Hand[H] + Zone[Cl] = HCl (Available).
    *   *Correct*: Zone[H] + Zone[Cl] = HCl (Available).
*   **UI Implication**: The "Synthesize" button for a specific compound (e.g., *Asid Hidroklorik*) must **ONLY** appear if the `synthesisZone` array contains the exact ingredients required (e.g., 1 Hydrogen + 1 Chlorine).

### 2.2. The Synthesis Workflow (The Three Laws of Synthesis)
1.  **Availability (One of Each Type)**:
    *   To **unlock** a recipe, you only need **ONE** physical card of each required element type in the Kebuk Sintesis.
    *   *Example (H2SO4)*: Putting **1 H**, **1 S**, and **1 O** card in the zone unlocks the "Asid Sulfurik" button. You do *not* need 2 H or 4 O cards.
    
2.  **Cost (Stoichiometry in Mass)**:
    *   The "Quantity" (e.g., H2 in H2O) is paid using **Mass Points (M)**, not physical cards.
    *   **Cost Formula**: `Total Mole Cost = Sum(Requirement Counts)`.
    *   *Example (H2SO4)*: Requires 2 H + 1 S + 4 O. Cost is **7 M Points**.
    do not use H20 as example because we dont have that card yet
    
3.  **Consumption (Single Card)**:
    *   Upon synthesis, exactly **ONE** physical card of each type is removed from the zone.
    *   *Example (H2SO4)*: 1 H card, 1 S card, and 1 O card are removed. 

### 2.3. Catalyst (Mangkin) Behavior
*   **Presence**: Must be in the Synthesis Zone or Hand (priority to Zone) to take effect.
*   **Effect**: Reduces Energy Cost (E) by 2.
*   **Consumption**: The legacy logic **CONSUMES** the catalyst card upon use (removes it from Zone/Hand).
one catalyst is only used once.

## 3. Game Flow & Turn Structure

### 3.1. Turn Sequence
The game operates on a strict phase system, managed by `useGameState.ts`.
1.  **Start Phase**:
    *   `turnNumber` increments.
    *   `currentPlayer` switches.
    *   **Resource Refill**:
        *   Energy (+4, max 20).
        *   Mass (+5, max 50).
    *   **Draw**: Active player draws 1 card from Deck.
2.  **Action Phase**:
    *   Player can:
        *   **Drag Elements** to Synthesis Zone.
        *   **Synthesize** compounds (if rules met).
        *   **Attack** opponent (using Acid/Base).
        *   **Set Trap** (Defense Slot).
        *   **Recycle** cards for Energy (+1 E).
    *   **Constraint**: Actions are limited by available Energy (E) and Mass (M).
3.  **End Phase**:
    *   Player clicks "Tamatkan Giliran".
    *   Temporary stats reset (e.g., `drawsThisTurn`).
    *   Control passes to Next Player (or AI).

## 4. Component Architecture Constraints

### 4.1. `GameInterface.tsx` (The View)
*   **Responsibility**: strictly display state.
*   **Restriction**: Must not perform "fuzzy" logic. `availableSynthesis` calculation line must be strict: `pool = [...me.synthesisZone]`.

### 4.2. `useGameState.ts` (The Logic)
*   **Responsibility**: Authoritative state mutation.
*   **Handlers**:
    *   `handleDropToZone`: Transfers card Hand -> Zone.
    *   `handleSynthesize`: Validates resources, removes ingredients from Zone, adds product to Hand.

### 4.3. `CardComponents.tsx` (The Components)
*   **Stability**: Must handle potential `null` or `undefined` slots in the Zone array gracefully during rendering to prevent white-screen crashes.

---
**Note to AI**: Adhere strictly to Section 2.1. Any logic that checks the hand for ingredients is a violation of the pure game mechanics.
