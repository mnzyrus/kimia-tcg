# Mobile Adaptation Plan (Update 2.0) 📱

**Objective**: Make "Kimia TCG" fully playable on mobile devices with a "native game" feel.
**Approach**: "Fit-to-Screen" Architecture (Game Scaling) + Touch Polyfill.

---

## 1. The Challenge 🛑

Current Desktop games face three major barriers on mobile:
1.  **Layout & Aspect Ratio**: The board is designed for wide screens (16:9). On mobile Portrait, it crushes. On mobile Landscape, browser toolbars (address bar, notch) eat space.
2.  **Input Method**: The game uses **HTML5 Drag & Drop API** (`draggable={true}`), which **DOES NOT WORK** on touch screens (iOS/Android) by default.
3.  **Viewport Scaling**: Mobile browsers automatically "zoom" pages, ruining the game feel. Text becomes unreadable or too large.

## 2. The Solution: "Consolidated Game View" 🌍

We will not try to make the game "Responsive" (reflowing grids). Instead, we will make it **"Adaptive"** (Scaling).
We will treat the game board like a `canvas`: a fixed 16:9 container that mathematically scales down to fit *any* screen while preserving the exact layout.

### Key Components:
1.  **`useGameScale` Hook**: Calculates the perfect CSS `transform: scale(x)` to fit the browser window.
2.  **`mobile-drag-drop` Polyfill**: A lightweight library that tricks the browser into thinking Touch events are Mouse Drag events, enabling your existing code to work instantly.
3.  **Landscape Enforcer**: A "Please Rotate Your Device" overlay for Portrait mode.

---

## 3. Implementation Plan 🛠️

### Step 1: Configure Viewport (Meta Tags) `app/layout.tsx`

We must prevent the user from accidentally pinching-to-zoom the UI itself.

```typescript
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Critical for "App" feel
  themeColor: '#0f172a',
};
```

### Step 2: The Touch Polyfill (Critical Fix)

Instantly fixes dragging without rewriting `GameInterface.tsx`.

**Action**:
1.  Install: `npm install mobile-drag-drop`
2.  Create `components/game/TouchPolyfill.tsx`:

```typescript
'use client';
import { useEffect } from 'react';
import { polyfill } from "mobile-drag-drop";
// Optional: import default css for drag image
import "mobile-drag-drop/default.css";

export function TouchDragPolyfill() {
    useEffect(() => {
        // Initialize polyfill
        polyfill({
            dragImageCenterOnTouch: true,
            iterationIntervalMs: 50,
        });
        
        // Prevent Pull-to-Refresh on mobile which ruins games
        const preventDefault = (e: Event) => e.preventDefault();
        document.addEventListener('touchmove', preventDefault, { passive: false });
        return () => document.removeEventListener('touchmove', preventDefault);
    }, []);
    return null;
}
```

### Step 3:The "Game Scale" Engine

This is the magic sauce. It forces your 1200px game board to fit on a 700px iPhone screen perfectly.

**Modify `GameInterface.tsx` structure:**

```tsx
// 1. Define Base Dimensions (Your current "ideal" desktop size)
const BASE_WIDTH = 1200; // or 1366
const BASE_HEIGHT = 700; // or 768

export default function GameInterface() {
    // ... logic ...

    // 2. Scale Logic
    const [scale, setScale] = useState(1);
    
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            // Calculate scale to fit "contain" style
            const s = Math.min(w / BASE_WIDTH, h / BASE_HEIGHT); 
            setScale(s);
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Init
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
            <TouchDragPolyfill />
            
            {/* LANDSCAPE ENFORCER (CSS hidden on desktop, visible on mobile portrait) */}
            <div className="absolute inset-0 z-[9999] bg-black text-white flex-col items-center justify-center hidden portrait:flex md:hidden">
                <RotateCw className="w-12 h-12 animate-spin mb-4" />
                <p>Sila pusingkan peranti anda.</p>
                <p className="text-xs text-slate-500">(Landscape Required)</p>
            </div>

            {/* SCALED GAME CONTAINER */}
            <div 
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    // transformOrigin: 'center center' // or top left? Center usually best if flex centered
                }}
                className="relative bg-slate-950 shadow-2xl origin-center"
            >
                {/* YOUR EXISTING GAME UI GOES HERE UNCHANGED */}
                 <header>...</header>
                 <main>...</main>
            </div>
        </div>
    );
}
```

## 4. Why This Works (Research Verification) 🔬

1.  **Dimenality**: By forcing `BASE_WIDTH = 1200`, your CSS grid/flex logic works exactly as it does on Desktop. No need to rewrite Tailwind classes to `w-1/2` or `flex-wrap`.
2.  **Readability**: Browser text scaling often breaks layouts. Transforms scale the *pixels* rendered, so a 16px font becomes effectively 10px on mobile but stays proportional to the card it is on.
3.  **Performance**: CSS Transforms are GPU accelerated. It is faster than calculating absolute pixel positions in JavaScript.

## 5. Execution Checklist ✅

- [ ] **Install Polyfill**:  `npm install mobile-drag-drop`
- [ ] **Update Layout**: Add viewport metadata.
- [ ] **Refactor GameInterface**: Wrap content in Scaled Div.
- [ ] **Test**: Use Chrome DevTools "Device Toolbar" -> Select various mobile devices (e.g., iPhone, Pixel, Galaxy) -> Rotate to Landscape.

---
*Plan created by Antigravity Agent, 2026-01-02.*
