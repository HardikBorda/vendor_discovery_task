import axios from "axios";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Search for vendor pages using Serper.dev (primary) or Tavily (fallback).
 * Returns up to `limit` results.
 */
export async function searchVendors(
  query: string,
  limit = 8,
): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (serperKey) {
    return searchWithSerper(query, limit, serperKey);
  } else if (tavilyKey) {
    return searchWithTavily(query, limit, tavilyKey);
  } else {
    throw new Error(
      "No web search API key configured. Set SERPER_API_KEY or TAVILY_API_KEY.",
    );
  }
}

async function searchWithSerper(
  query: string,
  limit: number,
  apiKey: string,
): Promise<SearchResult[]> {
  const res = await axios.post(
    "https://google.serper.dev/search",
    { q: query, num: limit, gl: "us", hl: "en" },
    {
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      timeout: 8000,
    },
  );

  const organic: Array<{ title: string; link: string; snippet: string }> =
    res.data.organic ?? [];
  return organic.slice(0, limit).map((r) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet,
  }));
}

async function searchWithTavily(
  query: string,
  limit: number,
  apiKey: string,
): Promise<SearchResult[]> {
  const res = await axios.post(
    "https://api.tavily.com/search",
    {
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: limit,
      include_answer: false,
    },
    { timeout: 10000 },
  );

  const results: Array<{ title: string; url: string; content: string }> =
    res.data.results ?? [];
  return results.slice(0, limit).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content?.slice(0, 300) ?? "",
  }));
}

export async function checkSearchHealth(): Promise<{
  healthy: boolean;
  message: string;
  provider?: string;
}> {
  const serperKey = process.env.SERPER_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!serperKey && !tavilyKey) {
    return {
      healthy: false,
      message:
        "No search API key configured (SERPER_API_KEY or TAVILY_API_KEY)",
    };
  }

  try {
    const results = await searchVendors("email delivery vendor", 1);
    const provider = serperKey ? "Serper" : "Tavily";
    if (results.length > 0) {
      return { healthy: true, message: `${provider} API connected`, provider };
    }
    return { healthy: false, message: `${provider} returned empty results` };
  } catch (err) {
    return {
      healthy: false,
      message: err instanceof Error ? err.message : "Search API error",
    };
  }
}
