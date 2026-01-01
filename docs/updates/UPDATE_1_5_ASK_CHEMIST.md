# Update 1.5: AskChemist AI Integration 🧪🤖

**Status**: ✅ Complete & Verified
**Date**: 2026-01-02
**Version**: 1.5.0

## 📝 Overview
This update enables the **"Ask Chemist"** feature, allowing players to have natural language conversations with an AI mentor ("Ahli Kimia AI") directly within the game. The system is powered by Google's **Gemini 1.5 Flash 8b** model, optimized for low latency and high reliability on free-tier usage.

## ✨ New Features

### 1. Interactive AI Chat
-   **Context-Aware**: The AI knows the *exact* state of your game. It can see your hand, your HP, your pH level, and the opponent's status.
-   **Persona**: "Ahli Kimia AI" acts as a wise, encouraging chemistry mentor, answering in Bahasa Melayu (with English scientific terms).
-   **Strategy Advice**: You can ask specific strategy questions like *"What should I play next?"* or *"How do I beat a pH 2 acid?"* and get relevant advice based on your current cards.

### 2. Zero-Config Authentication
-   **Hardcoded Default Key**: We have embedded a default, restricted-scope API Key so players can use the feature immediately without needing to generate their own key.
-   **Seamless Experience**: The "API Key" input field has been removed from the Settings menu to declutter the UI.

### 3. Smart Error Handling
-   **Quota Protection**: The system automatically detects `429 Quota Exceeded` errors and informs the user politely ("Had Kouta Dicapai").
-   **Model Fallback**: If a specific model version is unavailable (404), the system provides clear feedback.

## 🔧 Technical Implementation

### AI Service (`lib/ai.ts`)
-   **Service**: `GeminiService`
-   **Model**: `gemini-1.5-flash-8b` (Chosen for stability and speed).
-   **Method**: `chat(query, gameState, apiKey)`
-   **Prompt Engineering**: A dynamic `createChatPrompt` function injects a JSON stringification of the `GameState` into the system instructions, ensuring the AI never hallucinates the game state.

### UI Integration (`Modals.tsx`)
-   **Component**: `AskChemistModal`
-   **State Management**: Handles generic loading states (`isLoading`) and connects directly to the global Settings Context.

## 📸 Usage
1.  Click the **"Ask Chemist"** (Bot Icon) button in the top-right corner.
2.  Type a question (e.g., *"Macam mana nak buat Garam?"* or *"Help me survive!"*).
3.  Receive an instant, context-aware answer.

## 🐛 Bug Fixes
-   **Model Compatibility**: Resolved `404` and `429` errors by switching from experimental `v2` models to the stable `gemini-1.5-flash-8b` alias.
-   **Syntax Errors**: Fixed missing function signatures in previous iterations.

---
> [!NOTE]
> This feature relies on the Google Gemini API. Response times may vary based on server load.
