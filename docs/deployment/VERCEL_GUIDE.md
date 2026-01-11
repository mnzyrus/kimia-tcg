# Kimia TCG: Vercel & Supabase Deployment Guide

This guide details how to deploy your local Next.js game to Vercel and connect it to your existing Supabase project.

## Prerequisites
- [x] **Supabase Project** (Already set up)
- [ ] **GitHub Repository** (Project pushed to GitHub)
- [ ] **Vercel Account** (Connected to GitHub)

---

## Part 1: Finalize Codebase (Highly Recommended)
Before deploying, we should ensure the Multiplayer (PVP) mode actually works. Currently, the "Attack" and "Synthesize" buttons are placeholders in Online mode.
- **Action**: Port Game Logic to `usePVPState.ts`.

## Part 2: Push to GitHub
1. Create a new Repository on GitHub (e.g., `kimia-tcg`).
2. Run these commands in your VS Code terminal:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   # Replace with your repo URL
   git remote add origin https://github.com/YOUR_USERNAME/kimia-tcg.git
   git push -u origin main
   ```

## Part 3: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Select your `kimia-tcg` repository.
4. **Configure Project**:
   - **Framework Preset**: Next.js (Auto-detected).
   - **Environment Variables**: You MUST add these from your `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_GAME_VERSION` (Optional, e.g. "v2.0")

5. Click **"Deploy"**.

## Part 4: Supabase Settings (Production)
1. Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Add your **Vercel Production URL** (e.g., `https://kimia-tcg.vercel.app`) to "orb Site URL" and "Redirect URLs".
   - *This ensures users can log in on the live site.*

---

## Regarding "Storage" (Buckets)
In your screenshot, you were on the Storage page.
- **Do you need it?** ONLY if you plan to let users upload custom avatars or if we move card images to the cloud.
- **Status**: For now, we can skip creating Buckets. The game works fine with local assets.

## Summary of Next Steps
1. **Finish PVP Logic** (So players can actually play online).
2. **Push to GitHub**.
3. **Deploy to Vercel**.
