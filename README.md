# VendorDiscovery 🔍

> AI-powered vendor shortlist builder — enter a need, set requirements with weights, get a ranked comparison table in seconds.

**Live Demo:** _(add your deployed URL here)_

---

## What It Does

VendorDiscovery helps you find the right software vendor for any need. You:

1. **Describe your need** — e.g. "email delivery service for India"
2. **Add 1–10 requirements** — e.g. "budget under $50/month", "GDPR compliant", "99.9% uptime SLA"
3. **Set importance weights (1–10)** — drag sliders to prioritize what matters most
4. **Optionally exclude vendors** — e.g. "AWS", "Salesforce"
5. **Click Build Shortlist** — AI researches 4–6 real vendors and returns:
   - Weighted score (0–100) factoring in your priorities
   - Price range (real pricing data)
   - Per-requirement match/no-match with details
   - Risks and limitations
   - Evidence links with quoted snippets
6. **View as cards or comparison table**, export to Markdown, save history

Your **last 5 shortlists** are saved to SQLite and accessible from the History page.

---

## Tech Stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Framework | Next.js 15 (App Router)                                    |
| Language  | TypeScript                                                 |
| LLM       | Groq — Llama 3.3 70B Versatile (`llama-3.3-70b-versatile`) |
| Database  | SQLite via `better-sqlite3`                                |
| Styling   | Vanilla CSS (clean, minimal dark design system)            |
| Runtime   | Node.js                                                    |

---

## How to Run

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com) (free tier available — no credit card required)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/VendorDiscovery.git
cd VendorDiscovery

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env.local
# Then edit .env.local and add your GROQ_API_KEY

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The app works without an API key — it returns static demo results so you can explore the UI. Add `GROQ_API_KEY` for live AI-researched results.

### With Docker (one command)

```bash
# Build
docker build -t vendor-discovery .

# Run (replace with your actual Groq key)
docker run -p 3000:3000 \
  -e GROQ_API_KEY=your_key_here \
  -v vendor-data:/app/data \
  vendor-discovery
```

Open [http://localhost:3000](http://localhost:3000).

> The `-v vendor-data:/app/data` flag mounts a named volume so your SQLite history persists between container restarts.

---

## Hosting Guide

> The app uses **SQLite** for storage so it needs a host with a **persistent disk** — standard serverless platforms (Vercel, Netlify) won't work for the database layer.

### Option 1 — Railway (Recommended ⭐)

Railway supports Docker + persistent volumes natively. A `railway.toml` config is already included.

1. Push your repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub Repo**
3. Select your repo — Railway auto-detects the `Dockerfile`
4. In **Settings → Variables**, add:
   ```
   GROQ_API_KEY = your_groq_api_key_here
   ```
5. In **Settings → Volumes**, add a volume mounted at `/app/data` (for SQLite)
6. Deploy — Railway gives you a public `.railway.app` URL

Free tier: 500 hours/month (enough to keep it always-on for a month).

---

### Option 2 — Render

A `render.yaml` is included for one-click Render deployment.

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service → Connect GitHub**
3. Select your repo — Render reads `render.yaml` automatically
4. In the **Environment** tab, set:
   ```
   GROQ_API_KEY = your_groq_api_key_here
   ```
5. The 1 GB disk for `/app/data` is defined in `render.yaml` automatically
6. Deploy — Render gives you a public `.onrender.com` URL

> **Note:** Free tier Render web services spin down after 15 min of inactivity. Use the Starter plan ($7/mo) to keep it always-on.

---

### Option 3 — Any VPS / Cloud VM

```bash
# On your server (Ubuntu/Debian):
git clone https://github.com/YOUR_USERNAME/VendorDiscovery.git
cd VendorDiscovery

# Set your env var
echo "GROQ_API_KEY=your_key_here" > .env.local

# Run with Docker (persistent volume)
docker build -t vendor-discovery .
docker run -d -p 3000:3000 \
  --env-file .env.local \
  -v /opt/vendor-data:/app/data \
  --restart unless-stopped \
  vendor-discovery
```

Point your domain / reverse proxy (nginx, Caddy) to port 3000.

---

## Project Structure

```
VendorDiscovery/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts       # GET /api/health
│   │   │   ├── history/route.ts      # GET /api/history
│   │   │   └── shortlist/
│   │   │       ├── route.ts          # POST /api/shortlist
│   │   │       └── [id]/route.ts     # GET /api/shortlist/:id
│   │   ├── history/page.tsx          # History page
│   │   ├── status/page.tsx           # Status / health page
│   │   ├── globals.css               # Design system (clean dark theme)
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── Navbar.tsx                # Navigation bar
│   │   ├── ShortlistBuilder.tsx      # Main form + results orchestrator
│   │   ├── shortlist/
│   │   │   ├── ShortlistForm.tsx     # Input form
│   │   │   ├── ShortlistResults.tsx  # Results header + view toggle
│   │   │   ├── VendorCard.tsx        # Expandable vendor card
│   │   │   ├── ComparisonTable.tsx   # Table view
│   │   │   ├── LoadingProgress.tsx   # Step-by-step loading UI
│   │   │   └── ScoreRing.tsx         # SVG score ring
│   │   ├── history/
│   │   │   └── HistoryCard.tsx       # Expandable history entry
│   │   └── status/
│   │       └── StatusItem.tsx        # Subsystem health row
│   ├── lib/
│   │   ├── db.ts                     # SQLite helpers
│   │   ├── gemini.ts                 # Groq / LLM integration
│   │   └── markdown.ts               # Markdown export
│   └── types/
│       └── shortlist.ts              # Shared TypeScript types
├── data/                             # Auto-created, holds shortlists.db
├── .env.example                      # Environment variable template
├── README.md
├── AI_NOTES.md
├── ABOUTME.md
└── PROMPTS_USED.md
```

---

## API Endpoints

| Method | Path                                 | Description                       |
| ------ | ------------------------------------ | --------------------------------- |
| `POST` | `/api/shortlist`                     | Build a new shortlist             |
| `GET`  | `/api/shortlist/:id`                 | Fetch a saved shortlist           |
| `GET`  | `/api/shortlist/:id?format=markdown` | Export as Markdown                |
| `GET`  | `/api/history`                       | List last 5 shortlists            |
| `GET`  | `/api/health`                        | Health check (backend + DB + LLM) |

---

## What Is Done

- ✅ Need + requirements input with validation
- ✅ Requirement importance weights (1–10 sliders)
- ✅ Exclude specific vendors
- ✅ Groq Llama 3.3 70B LLM integration
- ✅ Graceful static fallback when no API key is set
- ✅ Weighted vendor scoring (0–100)
- ✅ Price range, feature match, risks, evidence links per vendor
- ✅ Card view + comparison table view
- ✅ Markdown export of full report
- ✅ Last 5 shortlists saved to SQLite
- ✅ History page with expandable detail
- ✅ Status page (backend / DB / LLM health check)
- ✅ Step-by-step loading animation
- ✅ Input validation with helpful inline errors
- ✅ Error banner above form with Reset + Retry actions
- ✅ Clean, minimal dark UI design system
- ✅ Fully responsive (desktop + mobile bottom nav)
- ✅ Example need chips for quick start

## What Is NOT Done

- ❌ User authentication / multi-user support
- ❌ Real-time web scraping (uses LLM knowledge + URLs it provides)
- ❌ Saved vendor exclusion lists / profiles
- ❌ Vendor logo fetching
- ❌ Email / share shortlist
- ❌ PDF export (Markdown only)
- ❌ Price data freshness guarantee (LLM knowledge has a cutoff)

---

## Environment Variables

| Variable       | Required | Description                                                                                                     |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `GROQ_API_KEY` | No\*     | Groq API key from [console.groq.com](https://console.groq.com). Without it the app returns static demo results. |

\* The app runs in **static demo mode** with no key — useful for UI exploration without an account.
