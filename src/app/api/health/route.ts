import { NextResponse } from "next/server";
import { checkDbHealth, getDbMetadata } from "../../../lib/db";
import { checkLLMHealth } from "../../../lib/gemini";
import os from "os";

export async function GET() {
  const startTime = Date.now();

  const backend = { healthy: true, message: "Next.js API running" };
  const db = await checkDbHealth();
  const dbMeta = await getDbMetadata();

  let llm: { healthy: boolean; message: string };
  try {
    const llmPromise = checkLLMHealth();
    const timeoutPromise = new Promise<{ healthy: boolean; message: string }>(
      (_, reject) =>
        setTimeout(
          () => reject(new Error("LLM health check timed out (5s)")),
          5000,
        ),
    );
    llm = await Promise.race([llmPromise, timeoutPromise]);
  } catch (err: unknown) {
    llm = {
      healthy: false,
      message: err instanceof Error ? err.message : "LLM health check failed",
    };
  }

  const responseTime = Date.now() - startTime;
  const allHealthy = backend.healthy && db.healthy && llm.healthy;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      responseTimeMs: responseTime,
      checks: { backend, db, llm },
      timestamp: new Date().toISOString(),
      system: {
        node: process.version,
        platform: `${os.type()} ${os.release()} (${os.arch()})`,
        uptime: Math.floor(process.uptime()),
        memory: {
          rss: Math.floor(process.memoryUsage().rss / (1024 * 1024)),
          heapUsed: Math.floor(process.memoryUsage().heapUsed / (1024 * 1024)),
        },
      },
      metadata: {
        shortlistCount: dbMeta.count,
        dbSizeMb: dbMeta.sizeMb,
      },
    },
    { status: allHealthy ? 200 : 503 },
  );
}
