# Quick Reference: Audio System Updates

**Last Updated**: January 1, 2026

---

## 🎯 What Changed?

Two major audio improvements:

1. **Master Volume Control** - Added a global volume slider that controls ALL audio
2. **Background Music** - Music now plays automatically based on which screen you're on

---

## ⚡ Quick Facts

### Volume Settings
- **3 Volume Sliders**: Master, Music (BGM), Sound Effects (SFX)
- **How They Work**: Master × BGM = Actual Music Volume
- **Persistence**: Settings saved automatically, restored on page reload
- **Files Changed**: 3 files

### BGM Integration  
- **Menu Music**: Plays on main menu
- **Battle Music**: Plays during gameplay
- **Auto-Switch**: Changes automatically when you switch screens
- **Files Changed**: 1 file

---

## 📁 All Documentation Files

Located in `docs/updates/`:

1. **[01_VOLUME_SETTINGS_IMPLEMENTATION.md](./01_VOLUME_SETTINGS_IMPLEMENTATION.md)** (15 pages)
   - Complete guide to Master Volume system
   - Includes code examples, diagrams, and troubleshooting
   - Perfect for beginners

2. **[02_BGM_INTEGRATION.md](./02_BGM_INTEGRATION.md)** (12 pages)
   - Complete guide to BGM playback system
   - Explains GitHub sync process
   - Includes testing and debugging tips

3. **[README.md](./README.md)** (Index)
   - Overview of all updates
   - Quick reference table
   - Learning path for new developers

4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** (This file)
   - Ultra-condensed summary
   - Quick lookup for experienced devs

---

## 🧪 Quick Test

### Test Volume Settings (30 seconds):
1. Open game → Settings → Audio tab
2. Move Master slider → All sound changes ✅
3. Move BGM slider → Only music changes ✅
4. Move SFX slider → Only clicks change ✅

### Test BGM (20 seconds):
1. Open game → Hear menu music ✅
2. Click "Lawan AI" → Music changes to battle theme ✅
3. Quit game → Music changes back to menu ✅

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| No sound | Check Master Volume > 0% |
| No music | Check internet connection (BGM loads from URLs) |
| Settings don't save | Check browser allows localStorage |
| Music doesn't change | Refresh page, clear cache |

---

## 📊 File Changes Summary

```
Modified Files:
├── src/services/audio.ts        (+49 lines)  [Volume Settings]
├── src/components/SettingsPage.tsx  (+3 lines)   [Volume Settings]
├── src/App.tsx                  (+13 lines)  [Volume + BGM]
└── docs/updates/                (+4 files)   [Documentation]
```

---

## 🔗 Quick Links

- [Full Volume Guide](./01_VOLUME_SETTINGS_IMPLEMENTATION.md#how-it-works-simple-explanation)
- [Full BGM Guide](./02_BGM_INTEGRATION.md#how-it-works-simple-explanation)
- [Troubleshooting Volume](./01_VOLUME_SETTINGS_IMPLEMENTATION.md#troubleshooting)
- [Troubleshooting BGM](./02_BGM_INTEGRATION.md#troubleshooting)

---

## 💡 For Developers

### Volume System Architecture:
```
Settings UI → Raw Values → SoundManager → Calculates Effective Volume → Plays Sound
```

### BGM Trigger Logic:
```
User Action → View State Changes → useEffect Detects → playBGM() Called → Music Plays
```

### Key Methods:
- `setMasterVolume(vol)` - Set master volume (0.0 to 1.0)
- `setBGMVolume(vol)` - Set music volume (0.0 to 1.0)
- `setSFXVolume(vol)` - Set SFX volume (0.0 to 1.0)
- `playBGM(type)` - Play 'menu' or 'battle' music
- `stopBGM()` - Stop all music

---

## ✅ Verification Checklist

- [x] Volume sliders work independently
- [x] Master Volume affects all sounds
- [x] Settings persist after page reload
- [x] BGM plays on menu screen
- [x] BGM switches during gameplay
- [x] BGM respects volume settings
- [x] No console errors
- [x] Documentation is complete

---

**Need More Details?** See the full documentation files linked above.
