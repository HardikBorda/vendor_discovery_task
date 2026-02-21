import { NextResponse } from "next/server";
import { getShortlists } from "@/lib/db";

export async function GET() {
  try {
    const shortlists = await getShortlists();
    return NextResponse.json({ shortlists });
  } catch (err: unknown) {
    console.error("History API error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
