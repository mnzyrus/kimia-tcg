# FEASIBILITY STUDY: Portrait Mode Implementation 📱
**Context**: The user encountered the "Landscape Required" enforcer screen.
**Goal**: Determine viable solutions for supporting Portrait orientation.

## 1. The Current State
*   **Mechanism**: A `<div>` overlay with the class `landscape:hidden`. This covers the screen purely via CSS when the device/browser is taller than it is wide.
*   **The "Why"**: The game is hard-coded to a `1366x768` (1.77 AR) coordinate system. Scaling this onto a portrait phone (e.g., `390x844`) without changes results in the game being shrunk to ~25% size with massive top/bottom black bars, making text unreadable and buttons unclickable.

## 2. Options Analysis

### Option A: The "Quick Bypass" (Not Recommended)
*   **Action**: Simply remove the "Landscape Enforcer" div.
*   **Result**: The game "runs", but the `GameInterface` scaling logic will force the massive 1366px width to fit into the 390px phone width.
*   **Verdict**: ❌ **Unplayable**. UI Elements will be microscopic.

### Option B: The "Responsive Refactor" (Professional)
*   **Action**: Implement a "Dual-Layout" system.
*   **Changes Required**:
    1.  **CSS/Tailwind**: Use `portrait:` modifiers to re-stack the grid.
        *   *Sidebar*: Moves to a Slide-out Drawer / Hamburger Menu.
        *   *Opponent*: Stays Top.
        *   *Player Hand*: Stays Bottom.
        *   *Battle Zone*: Condensed middle.
    2.  **Scaling Logic**: Update `GameInterface.tsx` to switch `BASE_WIDTH` / `BASE_HEIGHT` references when `window.innerHeight > window.innerWidth`.
        *   *New Base*: `768x1366` (Inverted).
*   **Verdict**: ✅ **Best User Experience**, but High Effort.

### Option C: The "Canvas Rotate" (Intermediate)
*   **Action**: Force the CSS `rotate-90` transform on the container when in portrait.
*   **Result**: The user holds the phone vertically, but the game renders sideways.
*   **Verdict**: ⚠️ Confusing UX. The user sees the phone vertical, but text is sideways. Better to just ask them to rotate the phone (Current Solution).

## 3. Recommendation
If we **must** support Portrait (vertical) play, **Option B** is the only professional path.

### Proposed Architecture for Option B (True Portrait)
1.  **State**: `isPortrait` boolean in `dimensions`.
2.  **Logic**:
    ```typescript
    if (w < h) {
       // Portrait Mode
       setDimensions({ width: 768, height: 1366 }); 
       // We virtually flip the canvas base size
    }
    ```
3.  **UI**:
    *   Hide `GameSidebar`. Add `<MenuButton />` trigger.
    *   Change `flex-row` to `flex-col` for the main container.

---
**Decision Needed**: Do you want to invest in **Option B (True Portrait Mode)**, or stick to the "Landscape Only" rule which is standard for complicated TCGs (e.g., Hearthstone, Yu-Gi-Oh Master Duel)?
