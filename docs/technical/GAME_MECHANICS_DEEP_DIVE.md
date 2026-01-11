# KIMIA TCG: Game Mechanics Deep Dive (Master Document)

## 1. Introduction
This document is the **Single Source of Truth** for all gameplay mechanics in Kimia TCG v2.1. It supersedes all previous documentation and design notes.

## 2. Core Resources & Economy

### 2.1. Player Stats
Each player manages three primary resources:
*   **HP (Health Points)**: Starts at 1000. Reaching 0 results in loss.
*   **E (Tenaga/Energy)**: Used to perform Actions (Synthesize, Attack, etc.). Max: 20.
*   **M (Jisim/Mass)**: Used to pay for chemical stoichiometry during synthesis. Max: 50.

### 2.2. Turn-Based Resource Generaton
At the start of each turn sequence (when the Turn Number increments or Turn Phase resets):
*   **Energy (E)**: **+3E** per turn (Both Players).
*   **Mass (M)**: **+4M** per turn (Both Players).
*   **Cards**: **+2 Cards** drawn from Deck when the Round Number increments (both players).
    *   *Note*: A "Round" is defined as a complete cycle of Player 1 -> Player 2.

### 2.3. AI Passive Bonuses
The AI (Player 2) receives additional bonuses based on its stability:
*   **Stable (pH 7.0)**: +2 E / +2 M additional.
*   **Semi-Stable (pH 6.0-8.0)**: +1 E / +1 M additional.

## 3. The Three Pillars of Gameplay

### 3.1. Synthesis (Kebuk Sintesis)
The core loop involves creating compounds from elements.
*   **Zone Isolation**: Recipes must be formed entirely within the 3-slot Synthesis Zone.
*   **Unlock Condition**: You need **ONE physical card** of each required element in the zone.
*   **Stoichiometry Cost**: The quantity of atoms (e.g., $H_2$) is paid with **Mass (M)**.
    *   *Example*: Synthesizing $H_2O$ requires 1 H card + 1 O card in zone. Cost: 1 Energy + 1 Mass (for the extra H).
*   **Catalysts**:
    *   **Effect**: Reduces Energy Cost by 2.
    *   **Usage**: Consumed upon synthesis. Can be in Zone or Hand.
*   **Bonus**: Synthesizing a Salt via Acid+Base reaction yields a bonus **Water ($H_2O$)** card.

### 3.2. Combat & Reactions
Damage is calculated based on chemical properties.
*   **Basic Attack**: Costs 1 Energy. Deals damage based on Card Power.
*   **Tiered Damage (Dissociation)**:
    *   **Strong Acids/Bases (T0)**: Deal **2.0x Damage**. (e.g., $HCl$)
    *   **Weak Acids/Bases (T2)**: Deal **1.0x Damage**. (e.g., $CH_3COOH$)
    *   **Amphoteric**: Deal **1.5x Damage** depending on target state.
*   **Neutralization**:
    *   If an Attack (Acid) hits a Defense (Base), or vice-versa:
        *   **Damage**: Negated or reduced.
        *   **Result**: A specific **Salt** card is generated.
        *   **Bonus**: A **Water ($H_2O$)** card is generated.

### 3.3. pH Mechanics (v2.1)
Players have a pH level (Starts at 7.0, Range 0-14).
*   **Acid Attacks**: Decrease victim's pH (Towards 0).
*   **Base Attacks**: Increase victim's pH (Towards 14).
*   **Stability**: Deviation from 7.0 increases vulnerability.
    *   *Acid Vulnerability*: Low pH targets take MORE damage from Acid.
    *   *Base Vulnerability*: High pH targets take MORE damage from Base.
*   **Reset**: Applying **Water ($H_2O$)** instantly resets pH to 7.0.

## 4. The Buffer System
Buffering allows players to resist pH changes.
*   **Mechanism**: Active Buffers multiply incoming pH changes by a resistance factor ($<1.0$).
*   **Buffer Salts**:
    *   **Ammonium Asetat**: 0.3x Multiplier (70% Resistance).
    *   **Ammonium Klorida**: 0.6x Multiplier (40% Resistance).
    *   **Sodium Bicarbonate**: 0.4x Multiplier (60% Resistance).
    *   **Sodium Citrate**: 0.5x Multiplier (50% Resistance).

## 5. Technical Constraints
*   **Strict Isolation**: `useGameState.ts` is the only authority for muting state.
*   **Calculations**: All pH and Buffer math is decoupled from React state updates to ensure precision.
*   **Mobile Support**: Uses `mobile-drag-drop` polyfill for touch compatibility.

This document is up to date as of v2.1.
