# Opponent AI Architecture 🧠

**File:** `lib/ai.ts`  
**Type:** Utility-Based Scoring System (Heuristic)

## Overview
The "Offline" Opponent AI uses a deterministic scoring algorithm to evaluate the best possible move every turn. It generates a list of "Candidate Moves", assigns a score to each based on strategic priority, and executes the highest-scoring action.

## Decision Hierarchy (Priority Levels)

The AI evaluates moves in the following order of importance, represented by score ranges:

| Priority | Strategy | Score Range | Condition |
| :--- | :--- | :--- | :--- |
| **1. Critical** | **LETHAL** | `1000+` | Can I win the game **right now**? |
| **2. High** | **SURVIVAL** | `800+` | Is my HP < 300? Do I need defense? |
| **3. Medium** | **SYNTHESIS** | `500 - 700` | Can I craft a stronger card? |
| **4. Standard** | **ATTACK** | `300 - 500` | What is the most damaging attack available? |
| **5. Low** | **SETUP** | `200` | Set a generic trap if slot is empty. |
| **6. Idle** | **DRAW** | `100` | Draw cards if hand is low & energy exists. |

---

## Detailed Logic

### 1. Lethal Check (Score: 1000 + Damage)
*   **Goal**: End the game immediately.
*   **Logic**: Iterates through all cards in hand. Simulates `calculateReaction` against the player.
*   **Trigger**: If `Damage >= Player HP`, this move gets a massive score boost.

### 2. Survival Check (Score: 800 + Cost)
*   **Goal**: Prevent defeat.
*   **Trigger**: Active only when `AI HP < 300`.
*   **Logic**: If the Defense Slot is empty, prioritizes setting a Trap card (Salt/Synthesis) to block incoming damage.

### 3. Synthesis Engine (Score: 500 + Tier Bonus)
*   **Goal**: Power scaling.
*   **Logic**:
    *   Scans `synthesisZone` and `hand` for ingredients matching valid recipes (`sintesisCards`, `garamCards`).
    *   Checks Energy (E) and Mass (M) availability.
    *   **Score Calculation**: `500 + (Card Tier * 50) + Card Power`. Higher tier cards are prioritized.

### 4. Attack Efficiency (Score: 300 + Damage)
*   **Goal**: Apply constant pressure.
*   **Logic**:
    *   Evaluates every offensive card in hand.
    *   Calculates projected damage.
    *   **Bonus**: Adds `+50` score if the attack applies a status effect (e.g., Toxic, Drain).

### 5. Setup / Traps (Score: 200)
*   **Goal**: Passive defense.
*   **Logic**: If no specific urgent move is found and Defense Slot is empty, sets any playable card as a Trap to maintain board presence.

### 6. Resource Management (Score: 100)
*   **Goal**: Maintain options.
*   **Logic**: If `Hand Size < 5` and `Energy > 1`, prioritize drawing a card to replenish options.

## Fallback Mechanism
If **zero** candidate moves are generated (e.g., no Energy, full hand but unplayable cards), the AI defaults to:
1.  **Force Draw**: If Hand < 7 and Deck > 0.
2.  **End Turn**: If nothing else is possible.

## Future 'Gemini' Integration
The file also contains a `GeminiService` stub.
*   **Concept**: Uses a Large Language Model (LLM) to generate moves based on a text description of the game state.
*   **Current Status**: Optional fallback. The Rule-Based AI is the primary driver for reliability and speed.
