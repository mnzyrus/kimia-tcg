# CANVAS PART 4: UPDATE LOG & CONTINUITY 📝
**Status**: Detailed History
**Last Updated**: 2026-01-02

This file records the "Gap" between versions. New updates are appended here.

---

## 📅 UPDATE HISTORY

### [LATEST] Update 1.5 - Local Development Infrastructure & Audio Stability
**Release Date**: 2026-01-02
**Focus**: Stability / Developer Experience (DX)
**Tally with Library**: Matches `docs/updates/UPDATE_1_5_LOCALHOST_AND_REPO.md`

#### 1. Critical Bug Fix: Server-Side Rendering (SSR) Crash
*   **The Issue**: The `SoundManager` class (`lib/audio.ts`) attempted to instantiate `window.AudioContext` during the module build phase on the Node.js server. This caused a `ReferenceError: window is not defined` and a generic blank screen on localhost.
*   **The Fix**: Implemented a "Guard Clause" pattern. The constructor now strictly validates `typeof window !== 'undefined'` before execution.
*   **Code Change**:
    ```typescript
    // In lib/audio.ts
    constructor() {
        if (typeof window !== 'undefined') { ... } // Replaced naive instantiation
    }
    ```
*   **Impact**: Local development server (`npm run dev`) now serves the application correctly without crashing.

#### 2. Infrastructure: Local Configuration Guide
*   **The Issue**: New developers (and cloned environments) lacked clear instructions for setting up environment variables (`.env.local`), causing AI features to fail silently.
*   **The Fix**: Created a dedicated `docs/technical/LOCAL_SETUP_GUIDE.md`.
*   **Content**: Standardization of `NEXT_PUBLIC_GEMINI_API_KEY` and Supabase credentials setup. This ensures the generative AI opponent functions correctly.

#### 3. Repository Synchronization
*   **Action**: Force-sync with origin `mnzyrus/kimia-tcg`.
*   **Result**: Local environment is now the definitive "Source of Truth", replacing any fragmented history. The `main` branch now contains the specific audio fixes.

### [LATEST] Update 1.6 - Dynamic Mobile Layout
**Release Date**: 2026-01-02
**Focus**: Visual / Mobile UX

#### 1. Dynamic "Fit-to-Screen" Engine
*   **Problem**: The game canvas was hardcoded to `1366x768`. Modern mobile phones (with 19:9 or 20:9 aspect ratios) displayed large black bars on the sides.
*   **Solution**: Refactored `GameInterface.tsx` to use a dynamic `BASE_WIDTH`.
*   **Logic**:
    *   Detects Window Aspect Ratio (`Width / Height`).
    *   Calculates new Base Width: `768 * CurrentRatio`.
    *   **Clamping**: Minimum `1366px` (16:9), Maximum `1800px` (~21:9).
*   **Impact**: The game now expands to fill the screen on wider devices while maintaining specific pixel-perfect vertical scaling.

### [LATEST] Update 1.7 - Experimental Portrait Support (Auto-Rotate)
**Release Date**: 2026-01-02
**Focus**: Mobile Accessibility
**Status**: Experimental

#### 1. Auto-Rotation Logic
*   **The Request**: Support Portrait devices by strictly enforcing "Landscape Orientation" via software, rather than blocking the user with an overlay.
*   **The Implementation**:
    *   Removed the "Please Rotate Device" overlay.
    *   Added logic to detect `isPortrait` (`window.innerHeight > window.innerWidth`).
    *   **Dimension Swap**: If Portrait, the engine treats `Height` as Width and `Width` as Height for scaling calculations.
    *   **Visual Transform**: Applies `transform: rotate(90deg)` to the game container.
*   **Result**: If a user holds the phone vertically, the game renders sideways (filling the long axis), forcing the user to physically rotate the phone to play, but allowing the game to load immediately.

### [PREVIOUS] Update 1.1 - Audio System (Archived)
**Release Date**: 2026-01-02
**Focus**: Feature (Audio)
**Tally with Library**: Matches `docs/updates/UPDATE_1_1_AUDIO.md`

*   **Feature**: Implemented global audio control via `SettingsContext`.
*   **UI**: Added gradient sliders to the Settings Modal.
*   **Tech**: Moved audio state from local component state to React Context Provider (`GameProvider` wrapper).

---
### [LATEST] Update 1.8 - Responsive Layout Refinement
**Release Date**: 2026-01-02
**Focus**: Mobile / Tablet Optimization

#### 1. Stacked Layout for Narrow Screens
*   **The Change**: Devices narrower than `1366px` (e.g., Vertical Phones, Square Monitors, Laptops) now default to a **Vertical Stacked Layout**.
*   **Structure**: Header Band -> Game Board -> Player Hand (Bottom).
*   **Significance**: Prevents the side-by-side Desktop layout from being crushed on screens that lack the physical width to support it.

#### 2. Scrollable Mobile Canvas
*   **Feature**: In Narrow Mode, the page is now vertically scrollable.
*   **Benefit**: The game no longer attempts to squeeze everything into a fixed height. Content flows naturally, requiring a scroll to see the hand or top opponent bar if the screen is short.

#### 3. Standard Hand Sizing
*   **Refinement**: Removed experimental "Dynamic Shrink" logic for cards.
*   **Result**: Cards in Mobile Mode now use a consistent size (`scale-90`) and spacing, ensuring readability is never compromised for "fit".

---
### [LATEST] Update 1.9 - Codebase Stabilization & Interactive Overlays
**Release Date**: 2026-01-02
**Focus**: Bug Fixing / UX Polish

#### 1. Core Component Restoration
*   **The Issue**: Critical files (`useGameState`, `Overlays`) were missing or disconnected, causing the game to crash on load.
*   **The Fix**: Restored `useGameState.ts` hook logic and created `Overlays.tsx` with proper animations.
*   **Result**: Game now loads 100% sans errors.

#### 2. Non-Blocking Animations
*   **The Issue**: The "Start Turn" banner would stay on screen forever, blocking gameplay.
*   **The Fix**: Implemented a self-cleaning timer (2.5s) in `StartTurnOverlay`.
*   **Result**: Overlays now appear, animate, and disappear automatically.

#### 3. Mobile Player Zone
*   **The Issue**: Mobile layout was indistinguishable from Desktop in the Player Zone.
*   **The Fix**: Enforced a distinct Vertical Stack layout with horizontal scrolling for the hand.
*   **Impact**: clear separation of content on narrow screens (Phone/Tablet).

### [LATEST] Update 1.10 - Audio Volume Integrity
**Release Date**: 2026-01-03
**Focus**: Bug Fixing / System Stability

#### 1. Volume Control Decoupling
*   **The Issue**: Users reported volume settings in the UI had no effect.
*   **The Cause**: `GameInterface` contained redundant audio initialization logic that overrode the `SettingsContext` updates, locking volume to default values or creating race conditions.
*   **The Fix**: Removed volume management from `GameInterface.tsx`. It now strictly handles *Playback State* (Play/Stop), while `SettingsContext.tsx` remains the sole authority for *Volume State*.
*   **Result**: Volume sliders now correctly adjust the global `SoundManager` in real-time.

#### 2. Slider UX Optimization
*   **The Request**: User requested smoother, more precise dragging.
*   **The Fix**:
    *   **Debounced Storage**: Moved `localStorage` writes to a debounced `useEffect` (500ms delay). This prevents synchronous file I/O on every pixel of drag movement, ensuring 60fps performance.
    *   **Visual Precision**: Removed `Math.round` from the CSS width/position calculations. The visual thumb now follows the cursor exactly (sub-pixel), while the displayed number remains readable as an integer.

#### 3. Hotfix: SettingsContext Import Restoration
*   **The Bug**: `ReferenceError: soundManager is not defined` crashed the app.
*   **The Cause**: The import statement for `soundManager` was accidentally removed during a previous refactor or merge.
*   **The Fix**: Restored `import { soundManager } from '@/lib/audio';` to `lib/SettingsContext.tsx`.

#### 4. Slider UX Structural Fix
*   **The Issue**: Sliders would stop dragging randomly.
*   **Root Cause**: The `GradientSlider` component was defined *inside* `SettingsModal`, causing it to unmount and remount on every render (losing drag state).
*   **The Fix**:
    *   **Extracted Component**: Moved `GradientSlider` to module scope.
    *   **Local State**: Implemented internal state for instant 60fps feedback.
    *   **Touch Optimization**: Added `touch-action: none` and increased hit-box height (48px) for effortless mobile grabbing.

#### 5. Surrender Feature
*   **The Request**: Add "Tamatkan Permainan" button to Settings.
*   **The Logic**: gracefully exits the game.
    *   **UI**: Red danger button added above "Reset Default".
    *   **Flow**: Click -> Modal Closes -> AI displays "Analisis data selesai. Jumpa lagi!" -> 3s Delay -> Return to Main Menu.
    *   **Condition**: Only visible during active gameplay (not in Main Menu settings).

#### 6. Mechanics Restoration (Draw, Defense, AI)
*   **Draw Card**: Implemented standard logic (Cost: 1 Energy, Max 3 per turn).
*   **Defense (Self Apply)**: Enabled consumption of `heal` and `status` type cards (e.g., Potions).
*   **AI Opponent**: Re-activated the AI Turn Loop. The AI now waits 2 seconds and ends its turn, passing control back to the player, resolving the "frozen game" state.

### [LATEST] Update 1.11 - Deep Mechanics Restoration (Restore Point)
**Release Date**: 2026-01-03
**Focus**: Feature Parity / Gameplay Depth

#### 1. Attack System Revamped (Restore Point)
*   **pH Vulnerability**: Implemented dynamic damage multipliers based on attacker's *Sintesis Type* and defender's *pH*.
    *   **Acid Attacks**: Deal x1.25-2.0 damage to Low pH (Acidic) targets.
    *   **Base Attacks**: Deal x1.25-2.0 damage to High pH (Alkaline) targets.
*   **Status Effects**: Restored logic to apply **Blind**, **Stun**, **Weakness**, and **Dryness** based on reaction results.
*   **Buffer Activation**: Defensive buffer cards now correctly activate and apply duration-based protection.

#### 2. Synthesis & Economy
*   **Catalyst Logic**: Holding a 'CAT' card (in Zone or Hand) now reduces Synthesis Energy cost by 2.
*   **Neutral pH Bonus**: Ending turn with perfect **pH 7.0** awards **+2 Energy / +2 Mass**. (pH 6-8 awards +1/+1).
*   **Round Start Draw**: Implemented rule where **BOTH players draw 2 cards** when the Turn Number increases (Start of Round).

#### 3. Technical Stability
*   **Log Type Fixes**: Enforced strict typing for `LogEntry` (`as const`) to prevent TypeScript compilation errors.
*   **SSR Crash Diagnosis**: Identified environmental file-lock causing 500 Errors during `npm run build` vs `dev` conflict.


### [LATEST] Update 1.12 - AI Polish & Glitch Fixes
**Release Date**: 2026-01-03
**Focus**: UX Polish / Bug Fixing

#### 1. AI "Liveness" & Pacing
*   **The Issue**: AI moves felt instant and robotic, overwhelming the player.
*   **The Fix**:
    *   **Thinking Delay**: Added a 1.0s "Thinking..." pause before the AI starts its turn.
    *   **Action Pacing**: Increased delay between AI actions from 1.5s to **2.5s**, making the flow easier to follow.
    *   **Notification**: "AI Thinking..." status is now visually distinct.

#### 2. Energy & Resource Rules (Finalized)
*   **Base Rule**: Both players now receive **+3 Energy** at the start of every turn.
*   **Bonus Rule**: The "pH Stability Bonus" (User request) has been restored. Players ending their turn with **stable pH (6-8)** receive an *additional* +1/+2 Energy & Mass.
*   **Symmetry**: This logic is now identical for both Human and AI players.

#### 3. Self-Apply pH Adjustment
*   **Feature**: Enabled players to use Acid/Base/Chemical cards on themselves.
*   **Logic**: Instead of an error, the card now adjusts the player's pH (calculating buffers and delta) without dealing damage.
*   **Feedback**: The system notifies exactly how much pH increased or decreased (e.g., "pH berkurang 1.5").

#### 4. Critical Fix: Card Duplication Glitch
*   **The Bug**: Rapidly dragging cards between Hand and Synthesis Zone could duplicate them due to validation race conditions.
*   **The Fix**: Implemented strict **ID-based validation** in `useGameState.ts`. The system now verifies the unique Card ID exists in the source before moving it, preventing "phantom" duplicates.
*   **Enhancement**: Added **Drag-to-Hand** support. Players can now drag cards OUT of the Synthesis Zone and drop them back onto the Hand area to retrieve them.


### [LATEST] Update 1.13 - pH Mechanics & UX Refinement
**Release Date**: 2026-01-08
**Focus**: Gameplay Mechanics / UX Polish / Code Quality

#### 1. pH Animation Restoration
*   **The Change**: Reverted the experimental separation of the pH Animation component (`PHAnimationDisplay.tsx`).
*   **Reasoning**: To simplify the component architecture and ensure consistent behavior, the animation logic was reintegrated directly into the `PHMeter.tsx` component.
*   **Outcome**: A single, robust component now handles both pH display and the calculation animation sequence.

#### 2. Enhanced "Self-Apply" UX
*   **The Issue**: Players found it difficult to trigger "Self-Apply" because the drop zone was too small (limited to the meter box), and the "LEPASKAN!" overlay blocked interaction.
*   **The Fix**:
    *   **Interactive Overlay**: The full-screen "LEPASKAN!" drag feedback layer was converted from a passive visual to an active **Drop Zone**.
    *   **Result**: Players can now drop a card *anywhere* on the screen once the overlay appears to trigger the effect.

#### 3. Standardized pH Calculation Signs
*   **The Change**: Inverted the mathematical signs for pH changes to match intuitive expectations.
*   **New Standard**:
    *   **Acidic Changes**: Represented as **Negative (-)** (e.g., pH 7.0 -> 1.0 is a change of `-6.0`).
    *   **Alkaline Changes**: Represented as **Positive (+)** (e.g., pH 7.0 -> 14.0 is a change of `+7.0`).
*   **Impact**: clearer visual feedback for players understanding the direction of pH shifts.

#### 4. AI Attack Visualization
*   **The Feature**: Enabled the pH Calculation Animation when the **AI attacks the player**.
*   **Logic**: Hooked the `triggerPHAnimation` event into the AI's `processAITurn` logic in `useGameState.ts`.
*   **Benefit**: Users can now visualize exactly how the AI's acid/base attacks are affecting their own pH balance, seeing the same math breakdown as their own moves.

#### 5. Code Quality & Type Safety
*   **Action**: Resolved persistent TypeScript errors and React state update warnings.
*   **Fixes**:
    *   **Deferral**: Wrapped state updates in `requestAnimationFrame` to prevent `Cannot update component while rendering` errors during synchronous event triggers.
    *   **Type Definitions**: Updated `types/index.ts` to include missing properties (`drawCount`, `LogEntry` timestamps, `ReactionResult`).

---
---
*End of Update Log*
