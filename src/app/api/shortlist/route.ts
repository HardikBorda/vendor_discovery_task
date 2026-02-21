import { NextResponse } from "next/server";
import { buildShortlist } from "../../../lib/gemini";
import { saveShortlist } from "../../../lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { need, requirements, weights, excludedVendors } = body;

    if (!need || typeof need !== "string" || need.trim().length < 5) {
      return NextResponse.json(
        { error: "Please describe your need in at least 5 characters." },
        { status: 400 },
      );
    }

    if (
      !requirements ||
      !Array.isArray(requirements) ||
      requirements.length < 1
    ) {
      return NextResponse.json(
        { error: "Please add at least 1 requirement." },
        { status: 400 },
      );
    }

    if (requirements.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 requirements allowed." },
        { status: 400 },
      );
    }

    const cleanRequirements = requirements.filter(
      (r: unknown) => typeof r === "string" && r.trim().length > 0,
    );
    if (cleanRequirements.length === 0) {
      return NextResponse.json(
        { error: "Requirements cannot be empty strings." },
        { status: 400 },
      );
    }

    const cleanWeights: Record<string, number> = {};
    for (const req of cleanRequirements) {
      const w = weights?.[req];
      cleanWeights[req] = typeof w === "number" && w >= 1 && w <= 10 ? w : 5;
    }

    const cleanExcluded = Array.isArray(excludedVendors)
      ? excludedVendors.filter(
          (v: unknown) => typeof v === "string" && v.trim().length > 0,
        )
      : [];

    const result = await buildShortlist(
      need.trim(),
      cleanRequirements,
      cleanWeights,
      cleanExcluded,
    );

    const id = uuidv4();
    await saveShortlist({
      id,
      need: need.trim(),
      requirements: cleanRequirements,
      weights: cleanWeights,
      excludedVendors: cleanExcluded,
      results: result,
    });

    return NextResponse.json({ id, result });
  } catch (err: unknown) {
    console.error("Shortlist API error:", err);
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";

    if (message.includes("API_KEY") || message.includes("GROQ_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "LLM API key not configured. Please set GROQ_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: `Failed to build shortlist: ${message}` },
      { status: 500 },
    );
  }
}
