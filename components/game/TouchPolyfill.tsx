'use client';
import { useEffect } from 'react';
import { polyfill } from "mobile-drag-drop";
// Using the default CSS provided by the package is often the easiest start
import "mobile-drag-drop/default.css";

export function TouchDragPolyfill() {
    useEffect(() => {
        // Initialize polyfill options
        console.log("Initializing Touch Drag Polyfill...");
        polyfill({
            dragImageCenterOnTouch: true,
            iterationInterval: 10, // Reduced from 50ms to 10ms for 60fps+ smoothness
            forceApply: false // Only apply on mobile/touch devices
        });

        // Prevent Pull-to-Refresh / Bounce on mobile which interferes with game gestures
        const preventDefault = (e: TouchEvent) => {
            // Only prevent if we are interacting with game elements? 
            // For a full screen game, generally preventing default behavior is safer.
            // But we might want scroll if not engaging. 
            // In our layout, we use 'overflow-hidden' on body, so this is mostly for bounce.
            if (e.touches.length > 1) e.preventDefault();
        };

        // Note: 'passive: false' is required to call preventDefault
        document.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            document.removeEventListener('touchmove', preventDefault);
        };
    }, []);
    return null;
}
