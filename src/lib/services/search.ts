// Web search is not used in the current implementation.
// The LLM (Groq Llama 3.3) provides vendor research directly from its knowledge base.
// Set SERPER_API_KEY or TAVILY_API_KEY if you want to enable live web search in future.

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export async function searchWeb(_query: string): Promise<SearchResponse> {
  return { results: [], query: _query };
}

export async function searchVendorInfo(
  _vendorName: string,
  _need: string,
): Promise<SearchResult[]> {
  return [];
}
