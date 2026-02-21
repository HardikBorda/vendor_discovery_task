import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedPage {
  url: string;
  title: string;
  text: string;
  success: boolean;
  error?: string;
}

const SCRAPE_TIMEOUT_MS = 6000;
const MAX_TEXT_LENGTH = 3000;

// Tags to remove before extracting text
const REMOVE_SELECTORS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "nav",
  "footer",
  "header",
  '[class*="cookie"]',
  '[class*="banner"]',
  '[class*="popup"]',
  '[class*="modal"]',
  '[id*="cookie"]',
  '[id*="chat"]',
];

// Priority content selectors to extract from first
const CONTENT_SELECTORS = [
  '[class*="pricing"]',
  '[id*="pricing"]',
  '[class*="price"]',
  '[id*="price"]',
  '[class*="feature"]',
  '[id*="feature"]',
  "main",
  "article",
  '[role="main"]',
  ".content",
  "#content",
];

export async function scrapePage(url: string): Promise<ScrapedPage> {
  try {
    const res = await axios.get(url, {
      timeout: SCRAPE_TIMEOUT_MS,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VendorDiscoveryBot/1.0; +https://vendordiscovery.app)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      maxRedirects: 3,
      validateStatus: (s) => s < 500,
    });

    const html = res.data as string;
    const $ = cheerio.load(html);

    // Remove noise
    REMOVE_SELECTORS.forEach((sel) => $(sel).remove());

    const title = $("title").text().trim() || $("h1").first().text().trim();

    // Try to find pricing/feature content first
    let text = "";
    for (const sel of CONTENT_SELECTORS) {
      const found = $(sel).text();
      if (found && found.trim().length > 200) {
        text = found;
        break;
      }
    }

    // Fall back to body
    if (!text || text.trim().length < 100) {
      text = $("body").text();
    }

    // Normalize whitespace and trim
    text = text
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.slice(0, MAX_TEXT_LENGTH) + "…";
    }

    return { url, title, text, success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown scrape error";
    return { url, title: url, text: "", success: false, error };
  }
}

export async function scrapePages(urls: string[]): Promise<ScrapedPage[]> {
  const results = await Promise.allSettled(urls.map((url) => scrapePage(url)));
  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(
      (r): r is ScrapedPage => r !== null && r.success && r.text.length > 50,
    );
}
