# Local Development & Configuration Guide
**Last Updated**: 2026-01-02

This document provides detailed instructions for setting up the "Local File" (`.env.local`) and running the project in a local development environment. These files are **not** on GitHub for security reasons, so every developer must create them manually.

## 1. The Local File: `.env.local` 🔑

The `.env.local` file stores your private API keys and local configuration. It is ignored by Git.

### **How to Create It**
1.  Go to the root of the project (where `package.json` is).
2.  Create a new file named `.env.local`.
3.  Paste the following template into it:

```env
# Google Gemini API Key (Required for AI Opponent)
# Get one at: https://aistudio.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here

# Supabase Configuration (Required for Multiplayer)
# Get these from your Supabase Project Settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Game Configuration (Optional)
# Set to 'true' to enable debug logs in browser console
NEXT_PUBLIC_DEBUG_MODE=false
```

### **Critical Variables Explained**
-   **`NEXT_PUBLIC_GEMINI_API_KEY`**: The AI uses this to generate witty banter and strategic decisions. Without it, the AI might be silent or fallback to basic logic.
-   **`NEXT_PUBLIC_SUPABASE_URL`**: Connects the game to the realtime matchmaking server.

---

## 2. The Local Fix: `lib/audio.ts` 🔊

We recently patched this file to work locally.

**The Problem**: Code running on the "Server" (Node.js) cannot see the "Window" (Browser).
**The Fix**: We added a check:
```typescript
if (typeof window !== 'undefined') { ... }
```
**Developer Note**: If you edit this file, **ALWAYS** keep this check. Removing it will cause the "Blank Screen of Death" when you restart the local server.

---

## 3. How to Run Locally 🏃‍♂️

Once your `.env.local` is set up:

1.  **Install Dependencies** (Only needed once):
    ```bash
    npm install
    ```
2.  **Start the Server**:
    ```bash
    npm run dev
    ```
3.  **Open in Browser**:
    -   Go to [http://localhost:3000](http://localhost:3000)
    -   *Note*: If port 3000 is busy, check the terminal (it might be 3001).

---

## 4. Troubleshooting Local Issues

| Issue | Solution |
| :--- | :--- |
| **Blank White Screen** | Check terminal for errors. Likely an SSR issue (see Section 2). |
| **"API Key Missing"** | Check your `.env.local` file. Ensure it is named exactly `.env.local`. |
| **Changes not showing** | Refresh the browser (F5). If stubborn, stop server (`Ctrl+C`) and run `npm run dev` again. |
