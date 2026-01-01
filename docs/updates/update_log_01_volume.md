# Update Log - Volume Settings Refactor

**Date**: 2026-01-01
**Component**: Audio System

## Summary
Refactored the `SoundManager` and `SettingsPage` to implement a robust, layered volume control system. The Master Volume logic has been moved from the UI layer into the Core Service layer to ensure consistency across the entire application.

## Changes
1.  **Refactored `SoundManager` (`src/services/audio.ts`)**:
    - Introduced `masterVolume` property.
    - Added `setMasterVolume(vol)` method.
    - Updated `playBGM` and `playSFX` to calculate effective volume (`channel * master`) dynamically.
    - Ensures that even if the UI is closed, the Master Volume setting is respected by all audio sources.

2.  **Updated `App.tsx`**:
    - Added initialization logic to synchronize `SoundManager` with persistent storage (`localStorage`) immediately upon application launch. This fixes the issue where settings were only applied *after* opening the Settings menu.

3.  **Updated `SettingsPage.tsx` (`src/components/SettingsPage.tsx`)**:
    - Simplifed the volume sync logic. Instead of pre-calculating effective volume, it now pushes raw User Preferences to `SoundManager`, which handles the mixing math internally.

## Technical Details
- **Persistence**: Settings are loaded from `localStorage` via the `useGameSettings` hook in the main `App` component.
- **Precision**: Floating point volume levels (0.0 - 1.0) are maintained for high-fidelity fading and mixing.
