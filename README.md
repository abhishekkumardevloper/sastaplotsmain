# Sasta Plots — Fullstack Real Estate Marketplace (Next.js)

**Your Dream Property. Your Smart Investment.**

A modern, production-ready real estate marketplace built as a unified **Next.js 15 (App Router)** fullstack application combining frontend and backend into a single deployable unit.

---

## Key Features

- **Frontend & Backend Together**: Unified Next.js application with React 19 and App Router API route handlers.
- **Single-Click Vercel Deployment**: No separate Express server, Render, or Railway required. Deploy directly on Vercel.
- **Admin Property Listing**: Full administrative panel to list, review, approve, feature, and manage properties.
- **Zero Demo Data**: Starts clean with 0 demo listings; supports real-time listing creation and management.
- **Database Layer**: Built-in support for Supabase PostgreSQL with local serverless fallback.
- **AI Chatbot**: Powered by Google Gemini with fallback FAQ guidance.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v18+ or v22+
- npm v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Supabase)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Portal & Property Listing

- **Admin URL**: Navigate to `/admin`
- **List a Property**: Go to `/admin/properties/add`
- Fill in the property details (Title, Price, Area, Location, Amenities, Images) and click **"Publish Listing"**.
- The property will be published immediately to `/`, `/buy`, `/plots`, `/commercial`, `/search`, and `/properties/[slug]`.

---

## Deploy to Vercel (Single Deployment)

Because the project is now a unified Next.js application, deployment to Vercel requires **no extra configuration**:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Vercel automatically detects **Next.js** framework preset.
4. Add any environment variables (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
5. Click **Deploy**.

That's it! Your frontend and backend API endpoints (`/api/...`) run together on the same domain with zero CORS setup needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI & Components | React 19 + Tailwind CSS + Framer Motion + Lucide |
| State Management | Zustand + TanStack Query v5 |
| Backend & APIs | Next.js Route Handlers (`app/api/...`) |
| Database | Supabase (PostgreSQL) + Serverless Fallback Store |
| AI Integration | Google Gemini API |
| Deployment | Vercel (Zero configuration) |
