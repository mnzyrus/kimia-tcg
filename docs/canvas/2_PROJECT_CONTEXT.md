# CANVAS PART 2: PROJECT CONTEXT 🌍
**Project**: Kimia TCG (Trading Card Game) v2.0
**Core Theme**: Educational Chemistry Strategy
**Repo**: `mnzyrus/kimia-tcg`

---

## 🎮 The Game State (v2.0)
**"The Reaction Update"**

### 1. Core Mechanics
*   **Chemistry Engine**:
    *   Players synthesize compounds from Elements (H, O, Na, Cl, etc.).
    *   Players clash using Acids (Attack) and Bases (Defense).
    *   **Reaction System**: `Acid + Base = Salt + Water`. Generating specific salts triggers unique effects (Buffs, Debuffs, Damage).
    *   **pH System**: Dynamic pH calculation. `Delta pH = 7.0 - Substance pH`.
        *   Acids lower pH.
        *   Bases raise pH.
        *   Extreme pH (<1 or >13) triggers "Vulnerability" multipliers.

### 2. Modes
*   **PvE (vs AI)**:
    *   **Opponent**: "Gemini AI" (Simulated in `lib/ai.ts` via API).
    *   **Behavior**: Managed by `processAITurn` logic.
*   **PvP (Multiplayer)**:
    *   **Engine**: Supabase Realtime Channels.
    *   **Connect**: Room Codes. Host/Guest architecture.

### 3. Active Technical Features
*   **Audio System**: Global `SoundManager` with `AudioContext`.
    *   Background Music (BGM) + Sound Effects (SFX).
    *   State: **Stable** (SSR Crash Fixed in Update 1.5).
*   **Mobile Scaling**:
    *   "Fit-to-Screen" CSS Transform logic implemented in `GameInterface.tsx`.
    *   Touch Drag Polyfill enabled.

### 3. System Architecture (The "Organs")
*Derived from Codebase Reference V2.0*
*   **The Brain (`lib/gameLogic.ts`)**: Pure math and chemistry rules. No UI.
*   **The Face (`components/game/GameInterface.tsx`)**: The UI / View Layer. Handles user input and mobile scaling.
*   **The Voice (`lib/audio.ts`)**: Sound engine. Server-safe (SSR Guarded).
*   **The Opponent (`lib/ai.ts`)**: Dual-core AI (Heuristic + Gemini LLM).

---

## 🛠️ Technology Stack
*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State**: React Hooks (Local) + Supabase (Remote)
*   **Dependencies**: `mobile-drag-drop`, `@supabase/supabase-js`, `@google/generative-ai`

---
*End of Context*
