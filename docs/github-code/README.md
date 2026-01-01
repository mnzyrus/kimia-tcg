# GitHub Repository Code Documentation - Index

**Project**: Kimia TCG  
**Repository**: https://github.com/mnzyrus/kimia-tcg  
**Framework**: Next.js 14+ (App Router)  
**Last Updated**: January 1, 2026

---

## 📚 Documentation Files

### Core Documentation:
1. **[APP_FOLDER.md](./APP_FOLDER.md)** - Routing & Pages
   - Complete guide to Next.js app directory structure
   - Critical file: `app/game/page.tsx` (game entry point)
   - Routing architecture and file-based routing explained

2. **[LIB_FOLDER.md](./LIB_FOLDER.md)** - Core Services & Game Logic
   - 8 service files documented
   - Critical files: `gameData.ts`, `gameLogic.ts`, `ai.ts`
   - Card database, reaction system, AI logic

3. **[QUICK_START.md](./QUICK_START.md)** - Getting Started (Coming Soon)
   - How to run the project
   - Key files to understand first
   - Common development tasks

---

## 🎯 Quick Reference

### Most Critical Files (DO NOT DELETE):

| File | Purpose | Lines | Critical Level |
|------|---------|-------|----------------|
| `app/game/page.tsx` | Game entry point | 11 | 🔴🔴🔴 MAX |
| `lib/gameData.ts` | All card data | 1066 | 🔴🔴🔴 MAX |
| `lib/gameLogic.ts` | Core mechanics | 320 | 🔴🔴🔴 MAX |
| `lib/ai.ts` | AI opponent | 285 | 🔴🔴 HIGH |
| `app/layout.tsx` | Root layout | 20 | 🔴🔴 HIGH |
| `components/game/GameInterface.tsx` | Main game UI | ~1400 | 🔴🔴🔴 MAX |

---

## 📁 Repository Structure

```
kimia-tcg-github/
├── app/                    ← Next.js routing (SKELETON)
│   ├── layout.tsx          ← Root layout
│   ├── page.tsx            ← Landing page
│   ├── game/
│   │   └── page.tsx        ← 🔴 CRITICAL: Game entry
│   ├── auth/               ← Authentication pages
│   └── api/                ← API endpoints
│
├── lib/                    ← Core services (BRAIN)
│   ├── gameData.ts         ← 🔴 CRITICAL: Card database
│   ├── gameLogic.ts        ← 🔴 CRITICAL: Game mechanics
│   ├── ai.ts               ← 🔴 CRITICAL: AI logic
│   ├── audio.ts            ← Sound system
│   ├── settings.ts         ← Settings persistence
│   ├── matchmaking.ts      ← Multiplayer
│   ├── phEvents.ts         ← pH animations
│   └── supabaseClient.ts   ← Database connection
│
├── components/             ← UI components (SKIN)
│   ├── game/
│   │   └── GameInterface.tsx  ← 🔴 CRITICAL: Main game UI
│   ├── AuthForm.tsx        ← Login/signup form
│   └── PeriodicTable.tsx   ← Periodic table UI
│
├── types/                  ← TypeScript definitions
│   └── index.ts            ← Game types
│
└── verification/           ← Test files
```

---

## 🧠 Understanding the Architecture

### Three-Layer System:

```
┌─────────────────────────────────────┐
│  APP FOLDER (Routing/Pages)        │  ← SKELETON
│  - File-based routing              │
│  - Page components                 │
│  - Metadata                        │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  COMPONENTS (UI)                    │  ← SKIN
│  - GameInterface (main game)       │
│  - Menus, modals, cards            │
│  - Visual effects                  │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│  LIB (Services/Logic)               │  ← BRAIN
│  - Game data & rules               │
│  - AI logic                         │
│  - Audio, settings, multiplayer    │
└─────────────────────────────────────┘
```

### Data Flow:
```
User Action (Click Attack)
    ↓
GameInterface.tsx (UI)
    ↓
gameLogic.calculateReaction() (Logic)
    ↓
gameData.ts (Card Data)
    ↓
Result displayed in UI
```

---

## 🔑 Key Concepts

### 1. pH System
- Unique mechanic: pH affects damage multipliers
- pH 7.0 = neutral (bonus resources)
- pH extremes = vulnerability to matching damage type

### 2. Card Types
- **Element**: Building blocks (H, O, C, etc.)
- **Sintesis**: Acids/Bases (attack/heal)
- **Garam**: Salts (special effects)

### 3. Reaction System
- Acid + Base → Salt (neutralization)
- Same type clash → Amplified damage
- Direct hit → pH change

### 4. AI System
- Rule-based AI (always available)
- Gemini AI (optional, requires API key)
- Fallback chain ensures game never breaks

---

## 🚀 Development Workflow

### To Add a New Feature:
1. **Plan**: Determine which layer (app/lib/components)
2. **Data**: Update `gameData.ts` if adding cards
3. **Logic**: Update `gameLogic.ts` if changing mechanics
4. **UI**: Update `GameInterface.tsx` for visual changes
5. **Test**: Verify in browser

### To Fix a Bug:
1. **Identify Layer**: Is it routing, logic, or UI?
2. **Check Dependencies**: What files import the broken file?
3. **Fix**: Make minimal changes
4. **Verify**: Test all affected features

---

## ⚠️ Common Mistakes

1. **Modifying card IDs**: Breaks save files
2. **Deleting critical files**: Game becomes unplayable
3. **Changing formulas without updating reactions**: Breaks game balance
4. **Removing AI fallback**: Crashes if Gemini fails
5. **Hardcoding URLs**: Use Next.js `<Link>` component

---

## 📖 Reading Order for New Developers

1. **Start**: [APP_FOLDER.md](./APP_FOLDER.md)
   - Understand routing and page structure
   
2. **Next**: [LIB_FOLDER.md](./LIB_FOLDER.md)
   - Learn game logic and data structures
   
3. **Then**: Browse `components/game/GameInterface.tsx`
   - See how UI connects to logic
   
4. **Finally**: Experiment with small changes
   - Add a card, tweak AI, change colors

---

## 🔗 External Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Gemini AI API](https://ai.google.dev/docs)

---

## 📝 Notes

- **GitHub Version**: Uses Next.js (server-side)
- **Local Version**: Uses Vite (client-side)
- **Key Difference**: Local has Master Volume feature
- **Sync Strategy**: Port features carefully, test thoroughly

---

**Last Sync**: January 1, 2026  
**Documentation Status**: Complete for app/ and lib/ folders  
**Next**: Components folder documentation (if needed)
