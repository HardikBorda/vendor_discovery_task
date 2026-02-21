// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeatureMatch {
  requirement: string;
  matched: boolean;
  detail: string;
}

export interface EvidenceLink {
  title: string;
  url: string;
  snippet: string;
}

export interface VendorResult {
  name: string;
  website: string;
  summary: string;
  score: number;
  priceRange: string;
  matchedFeatures: FeatureMatch[];
  risks: string[];
  evidenceLinks: EvidenceLink[];
}

export interface ShortlistResult {
  summary: string;
  vendors: VendorResult[];
  recommendation: string;
  generatedAt: string;
  /** True when quota was exhausted and results are static demo data */
  quotaExhausted?: boolean;
}

// ─── Static mode helpers ──────────────────────────────────────────────────────

function buildStaticResult(
  need: string,
  requirements: string[],
  weights: Record<string, number>,
): ShortlistResult {
  const STATIC_VENDORS: Omit<VendorResult, "matchedFeatures" | "score">[] = [
    {
      name: "Salesforce",
      website: "https://www.salesforce.com",
      summary:
        "Industry-leading CRM and enterprise platform with an extensive ecosystem of apps, integrations, and support options.",
      priceRange: "$25–$300 /user/mo",
      risks: [
        "Steeper learning curve for non-technical teams.",
        "Cost can escalate quickly for larger organisations.",
      ],
      evidenceLinks: [
        {
          title: "Salesforce Pricing",
          url: "https://www.salesforce.com/editions-pricing/",
          snippet:
            "Transparent tier-based pricing across all Salesforce clouds.",
        },
        {
          title: "Salesforce AppExchange",
          url: "https://appexchange.salesforce.com",
          snippet:
            "Thousands of pre-built integrations covering most business needs.",
        },
      ],
    },
    {
      name: "HubSpot",
      website: "https://www.hubspot.com",
      summary:
        "All-in-one growth platform covering CRM, marketing, sales, and service with an intuitive UI and generous free tier.",
      priceRange: "Free – $1,200/mo",
      risks: [
        "Advanced features are gated behind higher-priced tiers.",
        "Reporting depth is limited compared to enterprise tools.",
      ],
      evidenceLinks: [
        {
          title: "HubSpot Pricing",
          url: "https://www.hubspot.com/pricing",
          snippet: "Modular pricing lets teams start free and scale as needed.",
        },
        {
          title: "HubSpot Integrations",
          url: "https://ecosystem.hubspot.com/marketplace/apps",
          snippet:
            "Over 1,000 integrations available in the HubSpot marketplace.",
        },
      ],
    },
    {
      name: "Notion",
      website: "https://www.notion.so",
      summary:
        "Flexible all-in-one workspace for notes, docs, wikis, and lightweight project management used by teams of all sizes.",
      priceRange: "Free – $16 /user/mo",
      risks: [
        "Not a dedicated project management tool; complex workflows may feel limited.",
        "Offline support is minimal.",
      ],
      evidenceLinks: [
        {
          title: "Notion Pricing",
          url: "https://www.notion.so/pricing",
          snippet:
            "Affordable plans with a solid free tier for individuals and small teams.",
        },
        {
          title: "Notion Integrations",
          url: "https://www.notion.so/integrations",
          snippet:
            "Native and Zapier-powered integrations with popular productivity tools.",
        },
      ],
    },
    {
      name: "Monday.com",
      website: "https://monday.com",
      summary:
        "Visual work-management platform with strong collaboration features, automations, and boards suited to diverse workflows.",
      priceRange: "$9–$19 /seat/mo",
      risks: [
        "Free plan is very limited (2 seats only).",
        "Per-seat pricing becomes expensive for larger teams.",
      ],
      evidenceLinks: [
        {
          title: "Monday.com Pricing",
          url: "https://monday.com/pricing",
          snippet: "Tiered seat-based pricing with annual discount options.",
        },
        {
          title: "Monday.com Integrations",
          url: "https://monday.com/integrations",
          snippet:
            "200+ integrations including Slack, Google Drive, and GitHub.",
        },
      ],
    },
    {
      name: "Airtable",
      website: "https://www.airtable.com",
      summary:
        "Hybrid spreadsheet-database platform with powerful views, automations, and an API-first design for custom workflows.",
      priceRange: "Free – $20 /user/mo",
      risks: [
        "Record limits on free and lower-tier plans can be restrictive.",
        "Advanced automations require higher plans.",
      ],
      evidenceLinks: [
        {
          title: "Airtable Pricing",
          url: "https://airtable.com/pricing",
          snippet: "Plan comparison with record limits and automation quotas.",
        },
        {
          title: "Airtable API Docs",
          url: "https://airtable.com/developers/web/api/introduction",
          snippet: "REST API and webhooks for building custom integrations.",
        },
      ],
    },
  ];

  const baseScores = [91, 83, 74, 67, 58];

  const vendors: VendorResult[] = STATIC_VENDORS.map((v, i) => ({
    ...v,
    score: baseScores[i] ?? 50,
    matchedFeatures: requirements.map((req, ri) => ({
      requirement: req,
      matched: (weights[req] ?? 5) <= 7 || ri % 2 === 0,
      detail:
        (weights[req] ?? 5) <= 7 || ri % 2 === 0
          ? `${v.name} supports this requirement out of the box.`
          : `${v.name} requires a third-party add-on or custom configuration for this requirement.`,
    })),
  }));

  return {
    summary: `Static demo results for: "${need}". These are illustrative vendors — add your GROQ_API_KEY to get live AI-researched results tailored to your exact requirements.`,
    vendors,
    recommendation: `Based on the requirements provided, ${vendors[0].name} scores highest in this demo. Connect your GROQ_API_KEY to receive real, AI-researched recommendations.`,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Groq client (lazy singleton, uses OpenAI-compatible SDK) ─────────────────

let _groqClient: import("openai").default | null = null;

async function tryGetClient(): Promise<import("openai").default | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  if (!_groqClient) {
    const { default: OpenAI } = await import("openai");
    _groqClient = new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return _groqClient;
}

// ─── Build shortlist ──────────────────────────────────────────────────────────

export async function buildShortlist(
  need: string,
  requirements: string[],
  weights: Record<string, number>,
  excludedVendors: string[],
): Promise<ShortlistResult> {
  const client = await tryGetClient();

  if (!client) {
    console.info("[llm] GROQ_API_KEY not set — returning static demo results.");
    return buildStaticResult(need, requirements, weights);
  }

  const weightLines = requirements
    .map((r) => `  - "${r}" (weight: ${weights[r] ?? 5}/10)`)
    .join("\n");
  const excludeLine =
    excludedVendors.length > 0
      ? `\nExclude these vendors entirely: ${excludedVendors.join(", ")}.`
      : "";

  const prompt = `You are a B2B vendor research analyst. A buyer needs help shortlisting vendors.

NEED: ${need}

WEIGHTED REQUIREMENTS:
${weightLines}
${excludeLine}

Return a JSON object matching this exact schema (no markdown, no extra text — raw JSON only):
{
  "summary": "string — 2-3 sentence overview of the landscape",
  "vendors": [
    {
      "name": "string",
      "website": "string (full URL, e.g. https://example.com)",
      "summary": "string — 2-3 sentences about what this vendor offers",
      "score": number (0-100, weighted match against requirements),
      "priceRange": "string (e.g. '$9–$99/mo' or 'Contact for pricing')",
      "matchedFeatures": [
        {
          "requirement": "string (exact requirement text from the list above)",
          "matched": boolean,
          "detail": "string — one sentence explaining the match/miss"
        }
      ],
      "risks": ["string — one sentence per risk, 1-3 risks"],
      "evidenceLinks": [
        {
          "title": "string",
          "url": "string",
          "snippet": "string — 1 sentence"
        }
      ]
    }
  ],
  "recommendation": "string — 1-2 sentence top recommendation with reasoning"
}

Rules:
- Return 4-6 vendors, sorted by score descending.
- matchedFeatures must include one entry per requirement.
- evidenceLinks: 1-2 real, plausible links per vendor (pricing pages, docs, reviews).
- Be accurate with pricing and features. Do NOT invent features a vendor does not offer.
- Return ONLY the JSON object, no markdown fences or extra text.`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a B2B vendor research analyst. Always respond with valid JSON only — no markdown, no explanation, just the raw JSON object.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Groq returned an empty response");

    // Strip any accidental markdown fences the model might still add
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: ShortlistResult;
    try {
      parsed = JSON.parse(cleaned) as ShortlistResult;
    } catch {
      throw new Error("Groq response was not valid JSON. Please try again.");
    }

    if (!Array.isArray(parsed.vendors) || parsed.vendors.length === 0) {
      throw new Error("Groq returned no vendors. Please try again.");
    }

    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[llm] Error generating shortlist:", err);
    const msg = err instanceof Error ? err.message : String(err);

    // Rate-limited / quota exhausted → fall back gracefully
    if (
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate_limit") ||
      msg.includes("Rate limit") ||
      msg.includes("insufficient_quota")
    ) {
      console.info("[llm] Rate limited — falling back to static demo results.");
      return {
        ...buildStaticResult(need, requirements, weights),
        quotaExhausted: true,
      };
    }

    throw err;
  }
}

// ─── Health check ─────────────────────────────────────────────────────────────

export async function checkLLMHealth(): Promise<{
  healthy: boolean;
  message: string;
}> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return {
      healthy: true,
      message: "Static mode — add GROQ_API_KEY for live AI results",
    };
  }

  // Validate key format only — Groq keys start with "gsk_"
  const keyLooksValid = /^gsk_/.test(apiKey.trim());
  if (!keyLooksValid) {
    return { healthy: false, message: "GROQ_API_KEY format looks invalid" };
  }

  return {
    healthy: true,
    message: "Groq Llama 3.3 70B — API key configured",
  };
}
