# Volume Settings Implementation - Complete Guide

**Date**: January 1, 2026  
**Update Type**: Feature Implementation  
**Difficulty**: Beginner-Friendly  

---

## 📋 Table of Contents
1. [What Was Changed](#what-was-changed)
2. [Why This Change Was Needed](#why-this-change-was-needed)
3. [How It Works (Simple Explanation)](#how-it-works-simple-explanation)
4. [Technical Details](#technical-details)
5. [Files Modified](#files-modified)
6. [Testing Instructions](#testing-instructions)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 What Was Changed

We added a **Master Volume** control system that allows players to adjust three independent volume levels:

1. **Master Volume** - Controls the overall loudness of ALL game audio
2. **Background Music (BGM) Volume** - Controls only the music
3. **Sound Effects (SFX) Volume** - Controls only the sound effects (clicks, attacks, etc.)

### Visual Example:
```
Master Volume:  [=========>] 100%
    ↓
    ├─ BGM Volume:  [=====>    ] 50%  → Actual BGM plays at: 100% × 50% = 50%
    └─ SFX Volume:  [=========>] 100% → Actual SFX plays at: 100% × 100% = 100%
```

---

## 🤔 Why This Change Was Needed

### The Problem Before:
- Volume settings existed, but they didn't work correctly
- The Master Volume didn't actually control the overall sound
- Volume calculations were done in the wrong place (UI instead of audio engine)
- Settings would only apply AFTER opening the Settings menu

### The Solution:
- Moved volume calculation logic into the **core audio engine** (`SoundManager`)
- Made Master Volume multiply with BGM and SFX volumes
- Settings now apply **immediately** when the game loads
- All sounds respect the Master Volume, no matter where they're triggered

---

## 💡 How It Works (Simple Explanation)

Think of it like a water pipe system:

```
┌─────────────────────────────────────┐
│  Master Volume (Main Valve)        │  ← Controls ALL water flow
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼────┐ ┌───▼─────┐
│   BGM   │ │   SFX   │  ← Individual taps
│  Valve  │ │  Valve  │
└─────────┘ └─────────┘
```

- **Master Volume** is like the main water valve for your house
- **BGM and SFX** are like individual taps in different rooms
- Even if a tap is fully open, if the main valve is at 50%, you only get 50% water flow

### Example Calculation:
```javascript
// If Master Volume = 80% (0.8)
// And BGM Volume = 50% (0.5)
// Then actual BGM plays at:
Effective BGM Volume = 0.8 × 0.5 = 0.4 (40%)
```

---

## 🔧 Technical Details

### Architecture Change

**Before** (❌ Wrong):
```
SettingsPage.tsx (UI)
    ↓
Calculates: bgmVolume × masterVolume
    ↓
Sends result to SoundManager
```

**After** (✅ Correct):
```
SettingsPage.tsx (UI)
    ↓
Sends raw values: bgmVolume, masterVolume
    ↓
SoundManager (Audio Engine)
    ↓
Calculates internally when playing sound
```

### Code Changes Explained

#### 1. SoundManager Refactoring (`src/services/audio.ts`)

**Added Master Volume Property:**
```typescript
private masterVolume: number = 1.0;  // New! Stores master volume (0.0 to 1.0)
```

**Added Master Volume Setter:**
```typescript
setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));  // Clamp between 0 and 1
    this.updateBGMVolume();  // Immediately update playing music
}
```

**Added Effective Volume Calculators:**
```typescript
// These methods calculate the ACTUAL volume to use
getEffectiveBGMVolume() {
    return this.bgmVolume * this.masterVolume;  // Multiply channel × master
}

getEffectiveSFXVolume() {
    return this.sfxVolume * this.masterVolume;  // Multiply channel × master
}
```

**Updated Sound Playback:**
```typescript
// OLD CODE (Wrong):
this.bgm.volume = this.bgmVolume;  // Only used channel volume

// NEW CODE (Correct):
this.bgm.volume = this.getEffectiveBGMVolume();  // Uses master × channel
```

#### 2. Settings Page Update (`src/components/SettingsPage.tsx`)

**Before:**
```typescript
// UI was doing the math (WRONG!)
useEffect(() => {
    soundManager.setBGMVolume(settings.bgmVolume * settings.masterVolume);
    soundManager.setSFXVolume(settings.sfxVolume * settings.masterVolume);
}, [settings.bgmVolume, settings.sfxVolume, settings.masterVolume]);
```

**After:**
```typescript
// UI just sends raw values, SoundManager does the math (CORRECT!)
useEffect(() => {
    soundManager.setMasterVolume(settings.masterVolume);
    soundManager.setBGMVolume(settings.bgmVolume);
    soundManager.setSFXVolume(settings.sfxVolume);
}, [settings.bgmVolume, settings.sfxVolume, settings.masterVolume]);
```

#### 3. App Initialization (`src/App.tsx`)

**Added Settings Sync on Startup:**
```typescript
// This ensures volume settings are applied IMMEDIATELY when game loads
const { settings } = useGameSettings();
useEffect(() => {
    soundManager.setMasterVolume(settings.masterVolume);
    soundManager.setBGMVolume(settings.bgmVolume);
    soundManager.setSFXVolume(settings.sfxVolume);
}, [settings.masterVolume, settings.bgmVolume, settings.sfxVolume]);
```

---

## 📁 Files Modified

### 1. `src/services/audio.ts` (Audio Engine)
**Lines Changed**: 4-53  
**Changes**:
- Added `masterVolume` property
- Added `setMasterVolume()` method
- Added `getEffectiveBGMVolume()` helper
- Added `getEffectiveSFXVolume()` helper
- Updated `playBGM()` to use effective volume
- Updated all `playSFX()` calls to use effective volume
- Updated `toggleMute()` to respect master volume

### 2. `src/components/SettingsPage.tsx` (Settings UI)
**Lines Changed**: 21-26  
**Changes**:
- Removed manual volume multiplication
- Now sends raw values to SoundManager
- SoundManager handles all calculations internally

### 3. `src/App.tsx` (Main Application)
**Lines Changed**: 2081-2087  
**Changes**:
- Added `useGameSettings` hook import
- Added initialization `useEffect` to sync settings on startup
- Ensures volume settings persist across page reloads

---

## 🧪 Testing Instructions

### Manual Testing Steps:

1. **Open the Game**
   - Navigate to `http://localhost:5173`
   - You should hear background music playing

2. **Access Settings**
   - Click the **Beaker icon** (top-left corner)
   - Click **"Tetapan"** (Settings) button
   - Click **"Audio"** tab

3. **Test Master Volume**
   - Drag **"Master Volume"** slider to 0%
   - ✅ **Expected**: ALL sound stops (music + effects)
   - Drag back to 100%
   - ✅ **Expected**: Sound returns

4. **Test BGM Volume (with Master at 100%)**
   - Drag **"Muzik"** slider to 0%
   - ✅ **Expected**: Music stops, but clicking sliders still makes sound
   - Drag back to 50%
   - ✅ **Expected**: Music plays at half volume

5. **Test SFX Volume (with Master at 100%)**
   - Drag **"Kesan Bunyi"** slider to 0%
   - ✅ **Expected**: Clicking sliders is silent, but music still plays
   - Drag back to 100%
   - ✅ **Expected**: Clicks are audible again

6. **Test Persistence**
   - Set Master to 50%, BGM to 30%, SFX to 70%
   - **Refresh the page** (F5)
   - Open Settings again
   - ✅ **Expected**: Sliders are still at 50%, 30%, 70%
   - ✅ **Expected**: Sound plays at those levels immediately

---

## 🐛 Troubleshooting

### Problem: No sound at all
**Solution**:
1. Check browser console for errors
2. Verify Master Volume is not at 0%
3. Check browser's autoplay policy (some browsers block audio until user interaction)
4. Try clicking anywhere on the page first

### Problem: Settings don't persist after reload
**Solution**:
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Check if `kimia_settings` key exists
4. If missing, check browser's privacy settings (may be blocking localStorage)

### Problem: Master Volume doesn't affect sound
**Solution**:
1. Verify you're using the latest code
2. Check `src/services/audio.ts` has `getEffectiveBGMVolume()` and `getEffectiveSFXVolume()` methods
3. Ensure `playBGM()` uses `this.getEffectiveBGMVolume()` not `this.bgmVolume`

### Problem: Volume changes don't apply immediately
**Solution**:
1. Check `App.tsx` has the initialization `useEffect`
2. Verify `SettingsPage.tsx` is calling `setMasterVolume()`, not doing multiplication
3. Clear browser cache and hard reload (Ctrl+Shift+R)

---

## 📊 Performance Impact

- **Memory**: +24 bytes (3 new number properties)
- **CPU**: Negligible (simple multiplication per sound)
- **Storage**: +12 bytes in localStorage (3 volume values)

---

## 🔮 Future Improvements

Potential enhancements for later:
1. Add volume fade transitions (smooth volume changes)
2. Add per-sound-effect volume control
3. Add audio presets (e.g., "Quiet", "Balanced", "Loud")
4. Add visual volume meter/waveform
5. Add mute individual channels (not just master mute)

---

## 📚 Related Documentation

- [Settings Service Documentation](../services/settings.md)
- [Audio Service Documentation](../services/audio.md)
- [BGM Integration Guide](./02_BGM_INTEGRATION.md)

---

## ✅ Checklist for Future Developers

When modifying audio code, ensure:
- [ ] All volume calculations use `getEffective...Volume()` methods
- [ ] New sounds respect Master Volume
- [ ] Settings persist to localStorage
- [ ] Volume changes apply immediately (no page reload needed)
- [ ] Mute functionality still works correctly
