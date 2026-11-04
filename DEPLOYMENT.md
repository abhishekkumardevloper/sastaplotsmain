# Sasta Plots — Vercel Deployment Guide

Deploying Sasta Plots is now seamless with the unified Next.js fullstack architecture. Both frontend and backend API endpoints run together as a single application on Vercel.

---

## 1. Prerequisites

- A [Vercel](https://vercel.com) account.
- (Optional) A [Supabase](https://supabase.com) project for PostgreSQL database and storage.
- (Optional) A [Google AI Studio](https://aistudio.google.com) key for Gemini chatbot.

---

## 2. Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Convert Sasta Plots to fullstack Next.js project"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository.
   - Framework Preset: **Next.js** (Auto-detected).
   - Root Directory: `./` (Leave as default).

3. **Configure Environment Variables**:
   Add the following variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Public Key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase Service Role Secret Key
   - `GEMINI_API_KEY` = your Google Gemini API key (optional)
   - `ADMIN_BOOTSTRAP_SECRET` = your secret phrase for admin setup

4. **Deploy**:
   - Click **Deploy**.
   - Your site will be live at `https://your-project.vercel.app` in 1–2 minutes!

---

## 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy directly from repository root
vercel

# Deploy to production
vercel --prod
```

---

## 4. Admin Property Listing & Management

Once deployed:
1. Open `https://your-domain.vercel.app/admin/properties/add`.
2. Fill out property information (Title, Price, Location, Land Area, Facing, Images, Seller Info).
3. Click **"Publish Listing"** (or **"Publish & Feature on Home"**).
4. The property goes live immediately across the site with real-time search, filters, and dynamic slug URLs (`/properties/[slug]`).
