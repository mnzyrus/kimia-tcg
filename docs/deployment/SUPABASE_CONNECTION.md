# Connecting Supabase to Vercel

Since your site is **already deployed** on Vercel, you just need to tell Vercel where your database is. You do this by setting **Environment Variables**.

## Step 1: Get Supabase Credentials
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click on your Project (`mnzyrus's Project`).
3. Click **Settings** (Gear Icon) -> **API**.
4. Copy these two values:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **anon public key** (long string starting with `ey...`)

## Step 2: Add to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your Project (`kimia-tcg` or similar).
3. Go to **Settings** -> **Environment Variables**.
4. Add the following variables (copy values from Step 1):

   | Key | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | *(Paste Project URL)* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(Paste anon public key)* |

5. Click **Save**.

## Step 3: Redeploy (Important!)
Vercel only applies new variables when you **Build** again.
1. Go to the **Deployments** tab in Vercel.
2. Click the **three dots** (...) on your latest deployment.
3. Select **"Redeploy"**.

## Step 4: Configure Supabase Auth URL
1. Back in **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your Vercel Link (e.g., `https://kimia-tcg.vercel.app`).
3. Add the same link to **Redirect URLs**.

---
**Done!** Your Vercel site is now connected to your Supabase database.
