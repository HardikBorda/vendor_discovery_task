# Prompts Used During App Development

This file records the key prompts used to build VendorDiscovery. Agent responses, API keys, and output data are not included.

---

## 1. Project Architecture Planning

> "Build a web app called VendorDiscovery. It should let users enter a need (like 'email delivery service for India'), add 5–8 requirements with importance weights, click Build Shortlist, and get a comparison table with price range, features matched to requirements, risks/limits, and evidence links. Save the last 5 shortlists. Use Next.js, SQLite, and an LLM. Include a status page and history page."

---

## 2. LLM Prompt Engineering (Core)

The following is the actual prompt template used in `src/lib/gemini.ts` (with template variables shown):

> "You are a B2B vendor research analyst. A buyer needs help shortlisting vendors.
>
> NEED: `{need}`
>
> WEIGHTED REQUIREMENTS:
> `{requirements with weights}`
>
> Exclude these vendors entirely: `{excludedVendors}`
>
> Return a JSON object matching this exact schema (no markdown, no extra text — raw JSON only):
> `{schema}`
>
> Rules:
>
> - Return 4–6 vendors, sorted by score descending.
> - matchedFeatures must include one entry per requirement.
> - evidenceLinks: 1–2 real, plausible links per vendor (pricing pages, docs, reviews).
> - Be accurate with pricing and features. Do NOT invent features a vendor does not offer.
> - Return ONLY the JSON object, no markdown fences or extra text."

**Model used:** `llama-3.3-70b-versatile` via Groq Cloud  
**Temperature:** `0.3` (balanced accuracy / variety)  
**Max tokens:** `4096`

---

## 3. SQLite Schema Design

> "Design a SQLite schema for storing shortlists. Each shortlist has: id (UUID), created_at, need (text), requirements (JSON array), weights (JSON object), excluded_vendors (JSON array), results (JSON object). Auto-prune to keep only the last 5 records. Use better-sqlite3."

---

## 4. Weighted Scoring Design

> "How should I compute a weighted vendor score from 0–100? I have requirements each with a weight from 1–10, and each requirement is either matched (true) or not matched (false). The score should reward matching high-weight requirements much more than low-weight ones."

_(The answer led to: `score = sum(weight × matched ? 1 : 0) / sum(all weights) × 100`)_

---

## 5. Loading UX Pattern

> "I want to show a multi-step loading animation while an async API call runs. The steps should animate through sequentially (parse → identify → research → score → compile), but the animation should be tied to the real API response — all steps complete when the fetch resolves, not on a fixed timer. How do I implement this in React?"

---

## 6. Next.js 15 Dynamic Route Params

> "In Next.js 15 App Router, how do I correctly type the `params` argument in a dynamic API route like `/api/shortlist/[id]/route.ts`? I'm getting a TypeScript error about params needing to be awaited."

---

## 7. Markdown Export Format

> "Generate a markdown report format for a vendor comparison. It should include: header with timestamp, the user's need, requirements table with weights, comparison table, and detailed section per vendor with matched features (✅/❌), risks (⚠️), and clickable evidence links with quoted snippets."

---

## 8. CSS Design System — Clean & Minimal Redesign

> "Redesign the CSS design system for a developer SaaS tool to be clean, simple, and user-friendly. Use a deep dark background (`#0f1117`), a single solid blue accent (`#5b8dee`) instead of gradients, clean Inter typography, consistent border tokens, and compact spacing. Remove glassmorphism and glow effects. Keep micro-animations (fadeIn, scaleIn) but make them subtle."

---

## 9. Score Ring SVG

> "How do I create a circular progress ring in SVG with React that shows a score from 0–100? The ring color should be green for 75+, amber for 50–74, and red below 50. The stroke should animate as a partial circle."

---

## 10. Error UX — Inline Banner Above Form

> "Move the error box so it displays above the form (not below it), and keep the form visible so the user doesn't lose their inputs. Make the error banner compact and inline with Reset + Retry buttons on the right side."

---

## 11. UI Page Refinements

> "Update all pages UI and make it simple and clean user friendly."

_Applied to: Home page hero + steps, ShortlistForm, ShortlistResults, VendorCard, LoadingProgress, HistoryCard, StatusItem, History page, Status page, and Navbar._
