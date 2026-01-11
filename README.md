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

## 🛠️ Installation & Setup

Ensure you have Node.js installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mnzyrus/kimia-tcg.git
    cd kimia-tcg
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the game**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand (implicit via GameState hook patterns)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
