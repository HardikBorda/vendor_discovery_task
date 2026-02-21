# AI Notes

## What LLM and Provider Does This App Use?

**Model:** Llama 3.3 70B Versatile (`llama-3.3-70b-versatile`)  
**Provider:** Groq (via OpenAI-compatible SDK — `openai` npm package with `baseURL: https://api.groq.com/openai/v1`)  
**API:** Groq Cloud — `https://api.groq.com`

### Why Groq + Llama 3.3 70B?

1. **Speed:** Groq's LPU inference is among the fastest available — 15–30s end-to-end for a full 5-vendor research response, which matches user expectations for a live research tool.
2. **Free tier:** Groq Cloud offers a generous free tier (no credit card required), making the app easy to self-host without upfront cost.
3. **Quality:** Llama 3.3 70B has strong real-world knowledge of software vendors, pricing, and developer tools — exactly what this app needs.
4. **JSON output:** Reliably follows structured JSON output instructions when given a clear schema and "Return ONLY the JSON object" instructions.
5. **OpenAI-compatible SDK:** Uses the standard `openai` npm package with a custom `baseURL`, so the integration is clean and portable.

**Fallback behavior:** If `GROQ_API_KEY` is not set, or if the API returns a rate-limit / quota error (HTTP 429), the app automatically falls back to static demo results. This lets users explore the full UI without needing an API key.

---

## What I Used AI For

### 1. Vendor Research (Core Feature)

The entire vendor research pipeline is AI-driven. The prompt asks the LLM to:

- Identify 4–6 real vendors for the user's need
- Return real pricing data from vendor websites
- Score each vendor 0–100 based on weighted requirements
- Provide evidence links with cited snippets

**What I checked:** Verified several outputs manually against real vendor pricing pages (e.g., SendGrid, Mailgun, AWS SES for email delivery) and confirmed pricing and features were accurate.

### 2. Prompt Engineering

The LLM prompt was written and iterated manually to get reliable, parseable JSON output. Key decisions:

- Explicit JSON schema with exact field names passed in the prompt
- `"CRITICAL RULES"` section to enforce real URLs and accurate pricing
- Instruction to factor in weights when computing scores
- `"Return ONLY the JSON object"` to prevent markdown-wrapped responses
- Temperature set to `0.3` to balance accuracy with variety

**What I checked:** Tested edge cases — unusual needs, overlapping requirements, excluded vendor lists — and adjusted the prompt to handle them correctly.

### 3. Code Assistance

AI was used to help scaffold:

- TypeScript interfaces for vendor data structures
- Next.js 15 App Router file/folder conventions
- `better-sqlite3` query patterns for the pruning logic (keep last 5)

**What I checked:** Read through all generated code, understood the logic, and fixed issues where the AI made incorrect assumptions (e.g., the `params` Promise type in Next.js 15 dynamic routes).

---

## What I Checked/Did Myself

- **Prompt design:** Wrote and tuned the Groq/Llama prompt from scratch — the weighting formula, JSON schema, and evidence link instructions are my own design choices.
- **Error handling:** Added input validation (min length, max requirements, empty checks), API errors mapped to user-friendly inline banners, and quota-exhausted fallback to static demo data.
- **Database design:** Designed the SQLite schema, the auto-pruning logic (keep last 5), and the JSON serialization of nested objects.
- **Design system:** Rewrote the design system to a clean, minimal dark theme — consistent color tokens, tight typography, compact spacing, and smooth transitions throughout.
- **UI improvements:** Redesigned all pages (Home, History, Status) for simplicity and usability — standardized page headers, cleaner form layout, inline error banner above the form, and responsive mobile nav.
- **Loading UX:** The step-by-step loading animation runs concurrently with the real API call and resolves when actual data arrives.
- **Security:** API keys are never in code — `.env.example` pattern, `.gitignore` covers `.env.local`.
- **Testing:** Manually tested the full flow with multiple prompts, validated the comparison table, history pruning, and Markdown export.
