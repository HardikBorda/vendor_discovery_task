import { NextResponse } from "next/server";
import { getShortlistById } from "@/lib/db";
import { generateMarkdownReport } from "@/lib/markdown";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const shortlist = (await getShortlistById(id)) as {
      id: string;
      need: string;
      requirements: string[];
      weights: Record<string, number>;
      excludedVendors: string[];
      createdAt: string;
      results: {
        vendors: any[];
        generatedAt?: string;
        summary: string;
        recommendation: string;
      };
    } | null;

    if (!shortlist) {
      console.warn(`[api] Shortlist not found for ID: ${id}`);
      return NextResponse.json(
        { error: "Shortlist research data no longer exists or was moved." },
        { status: 404 },
      );
    }

    // Clone results to ensure we can modify it safely (especially generatedAt fallback)
    const results = { ...shortlist.results };
    if (!results.generatedAt) {
      results.generatedAt = shortlist.createdAt;
    }
    shortlist.results = results;

    const url = new URL(request.url);
    if (url.searchParams.get("format") === "markdown") {
      const md = generateMarkdownReport(
        shortlist.need,
        shortlist.requirements,
        shortlist.weights,
        shortlist.excludedVendors,
        shortlist.results as Parameters<typeof generateMarkdownReport>[4],
      );

      return new Response(md, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="shortlist-${id.slice(0, 8)}.md"`,
        },
      });
    }

    return NextResponse.json(shortlist);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
