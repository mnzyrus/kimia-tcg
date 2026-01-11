# 🧪 Kimia TCG: The Absolute Beginner's Guide

Welcome to **Kimia TCG**! This guide is designed for anyone, even if you've never coded or played a complex card game before.

---

## 1. Setting Up the Game (Getting Started)

Before you can play, we need to get the game running on your computer.

### Prerequisites (What you need installed)
1.  **Node.js**: This is the engine that runs the game code. Download the "LTS" version from [nodejs.org](https://nodejs.org/) and install it.
2.  **VS Code**: A good code editor. Download from [code.visualstudio.com](https://code.visualstudio.com/).

### Installation Steps
1.  **Open the Folder**: Open this game folder in VS Code.
2.  **Open Terminal**: slightly drag up the bottom panel or go to `Terminal > New Terminal`.
3.  **Install Libraries**: Type this command and press Enter:
    ```bash
    npm install
    ```
    (This downloads all the tools the game needs. It might take a minute.)

4.  **Run the Game**: Type this and Enter:
    ```bash
    npm run dev
    ```
5.  **Play!**: Open your web browser (Chrome/Edge) and go to:
    `http://localhost:3000`

---

## 2. How to Play the Game

Your goal is to defeat the opponent by reducing their **HP (Health)** to 0 using Chemistry!

### The Basics
*   **Elements**: You start with basic cards like `H` (Hydrogen), `O` (Oxygen), `Na` (Sodium), `Cl` (Chlorine).
*   **Synthesis**: You combine Elements to make strong **Compounds** (Acids, Bases, Salts).
*   **Energy (E)**: Every action costs Energy. You gain 2 Energy every turn.

### Step-by-Step Gameplay
1.  **Draw Components**: Look at your hand. Do you have `H` and `Cl`? Or `Na` and `O` and `H`?
2.  **Synthesize**: 
    *   Drag `H` into the **Synthesis Zone** (the middle box).
    *   Drag `Cl` into the **Synthesis Zone**.
    *   Click the **"Sintesis"** button.
    *   *Poof!* They combine to become `Asid Hidroklorik (HCl)` in your hand!
3.  **Attack**:
    *   Drag your new `HCl` card onto the **Attack Zone** (or just double-click it/click "Attack").
    *   It deals damage to the enemy HP!
4.  **Defend**:
    *   Drag a card into the **Defense/Trap Slot**. It will protect you from the next attack.

### Chemistry Cheat Sheet
*   **Acid (`Asid`)**: Great for Attacking.
*   **Base (`Bes`)**: Great for Healing or Neutralizing Acids.
*   **Neutralization**: If you attack an enemy who has a Base in their Defense slot, they React! This creates **Salt (`Garam`)** and **Water**.
    *   *Tip*: Using specific recipes (like `HNO3` + `KOH`) creates powerful Special Salts!

---

## 3. Online PVP Mode (New!)

Want to play against a friend?

1.  Click **"Main Bersama Kawan"** (PVP) in the Main Menu.
2.  **Create Room**: Enter a Code (e.g., `ROOM1`). You are Player 1.
3.  **Join Room**: Your friend enters `ROOM1` on their computer. They are Player 2.
4.  **Battle**: Actions are sent over the internet instantly!

---

## 4. Troubleshooting (If things break)

*   **"Model not found" Error**: This means the AI is having trouble. We fixed this in the latest update, so just refresh the page.
*   **Game Stuck**: Refresh the page.
*   **"Match not found"**: Ensure you and your friend typed the EXACT same Room Code.

---

**Have fun discovering new chemical reactions!**
