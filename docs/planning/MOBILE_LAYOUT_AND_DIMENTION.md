# IMPLEMETATION PLAN: Dynamic Mobile Layout Dimensions

**Goal**: Fix the "rigid" scaling that causes black bars on modern mobile phones (19:9, 20:9 ratios) by making the base dimensions dynamic.

## The Problem
Currently, `GameInterface.tsx` uses a hardcoded 1366x768 (~16:9) aspect ratio.
```typescript
const BASE_WIDTH = 1366;
const BASE_HEIGHT = 768;
```
If a phone is wider (e.g. 2400x1080), the `Math.min` logic forces scale based on height, leaving empty space on the sides.

## User Review Required
> [!IMPORTANT]
> This change alters the fundamental "Canvas Size". UI elements anchored to the center might shift relative to the edges. We will rely on Flexbox/Grid for inner layout to handle this.

## Proposed Changes

### 1. `components/game/GameInterface.tsx`
We will replace the static constants with a dynamic calculation inside the `handleResize` effect.

#### Logic:
1.  Detect Window Aspect Ratio (`currentRatio = w / h`).
2.  Target defined constraints:
    *   Minimum Ratio: 16:9 (Standard Desktop/Laptop)
    *   Maximum Ratio: 21:9 (Ultrawide Monitor / Modern Phone)
3.  **Dynamic Base Width**:
    *   Fix `BASE_HEIGHT` at 768 (Our design anchor).
    *   Calculate `BASE_WIDTH = 768 * currentRatio`.
    *   Clamp `BASE_WIDTH` between `1366` (16:9) and `1792` (21:9) or higher.
4.  Apply this new `BASE_WIDTH` to the container styles.

#### [MODIFY] [GameInterface.tsx](file:///c:/Users/A%20C%20E%20R/.gemini/antigravity/scratch/kimia-tcg-main/components/game/GameInterface.tsx)
-   Remove `const BASE_WIDTH = 1366;` constant.
-   Add state `dimensions`: `{ width: 1366, height: 768 }`.
-   Update `useEffect` resize listener to set `dimensions` state.
-   Update standard container `div` to use `style={{ width: dimensions.width, ... }}`.

## Verification Plan

### Manual Verification
1.  **Browser DevTools**:
    *   Open Game in Localhost (`npm run dev`).
    *   Toggle Device Toolbar (`Ctrl+Shift+M`).
    *   Test "iPhone 12/14 Pro" (Rotate to Landscape). Verify full width.
    *   Test "Standard Desktop" (1920x1080). Verify 16:9 ratio maintained or expanded safely.
    *   Test "Ultrawide" simulation. Verify no massive black bars.

### Automated Checks
*   Ensure no TS errors in `GameInterface.tsx`.
