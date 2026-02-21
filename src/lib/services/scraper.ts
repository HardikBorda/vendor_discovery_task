// Scraping is not used in the current implementation.
// The LLM (Groq Llama 3.3) provides vendor data directly from its knowledge base.

export interface ScrapedPage {
  url: string;
  title: string;
  text: string;
  success: boolean;
  error?: string;
}

export async function scrapePage(url: string): Promise<ScrapedPage> {
  return {
    url,
    title: url,
    text: "",
    success: false,
    error: "Scraping not enabled",
  };
}

export async function scrapePages(urls: string[]): Promise<ScrapedPage[]> {
  void urls;
  return [];
}
