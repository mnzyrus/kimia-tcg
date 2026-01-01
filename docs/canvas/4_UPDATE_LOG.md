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
*End of Update Log*
