# Kimia TCG v2.0 - Chemistry & Strategy Card Game

![Kimia TCG Banner](public/logo.png)

**Kimia TCG** is an educational yet competitive Trading Card Game (TCG) where players use real chemical elements to synthesize compounds, create powerful acids and bases, and battle opponents using scientific reactions.

## 🌟 New in v2.0 (The Reaction Update)

*   **🧪 Advanced Reaction System**: 
    *   **Salt Generation**: Mixing an Acid + Base (e.g., `HCl + NaOH`) now guarantees a specific Salt card (e.g., `Natrium Klorida`) with unique effects.
    *   **Specific Recipes**: Over 15 unique Acid-Base combinations producing distinct salts like *Ammonium Nitrate* (Explosive) or *Magnesium Sulfate* (Muscle Relaxant).
*   **⚖️ Tier System (Dissociation Level)**:
    *   **T0 (Strong)**: Full dissociation acids like `HCl` deal **2.0x Damage** in clashes.
    *   **T2 (Weak)**: Weak acids like `Acetic Acid` deal standard damage.
*   **🤖 Smart AI Opponent**:
    *   **Strict Timing**: The AI plays with a strategic 8-second turn timer.
    *   **Intelligent Moves**: Prioritizes synthesis and attacks, and intelligently recycles duplicate elements.
*   **💧 Buffers & pH Neutralization (v2.1)**:
    *   **pH Stability**: Use Water ($H_2O$) to reset dangerous pH levels.
    *   **Buffers**: Use specific salts to resist pH changes. [Read full documentation](docs/updates/UPDATE_1_6_PH_NEUTRALIZATION.md).
*   **📱 Mobile Touch Support (v2.1)**:
    *   **Drag & Drop**: Native-like touch support enabled via polyfill. [Read technical details](docs/updates/UPDATE_1_7_MOBILE_SUPPORT.md).

## 🎮 How to Play

1.  **Draft Your Deck**: You start with a deck of Elements (`H`, `O`, `Na`, `Cl`, etc.).
2.  **Synthesize Compounds**:
    *   Drag Elements into the **Synthesis Chamber**.
    *   Example: `Na` + `O` + `H` = **Natrium Hidroksida** (Base).
3.  **Battle & React**:
    *   **Attack**: Use Acids to deal damage.
    *   **Defend**: Place a Base in your Defense Slot.
    *   **Neutralize**: If an Acid attacks a Base, they react to form a **Salt**!
4.  **Win Condition**: Reduce your opponent's HP to 0.

## 📚 Documentation Library (For Every Skill Level)

We have detailed guides for everyone from complete beginners to advanced developers:

*   **🆕 Absolute Beginners**: Start here! [Read the Beginner's Guide](docs/GUIDE_FOR_BEGINNERS.md) to learn how to install, play, and win.
*   **🚀 Deployment (Vercel)**: How to put your game online. [Read Vercel Guide](docs/deployment/VERCEL_GUIDE.md).
*   **🔌 Database (Supabase)**: Connecting your database. [Read Connection Guide](docs/deployment/SUPABASE_CONNECTION.md).
*   **🧪 Game Mechanics**: Deep dive into the chemistry engine. [Read Mechanics Deep Dive](docs/technical/GAME_MECHANICS_DEEP_DIVE.md).

## 🛠️ Quick Setup (For Developers)

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the game**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🧪 Tech Stack

*   **Framework**: Next.js 14, React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand (implicit via GameState hook patterns)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
