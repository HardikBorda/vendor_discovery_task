import { ShortlistResult, ShortlistRow } from "@/types/shortlist";

// ─── SQLite store  ────────────────────────────────────

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let _sqlite: Database.Database | null = null;
const SQLITE_PATH = path.join(process.cwd(), "data", "shortlists.db");

function getSqlite(): Database.Database {
  if (!_sqlite) {
    // Ensure data directory exists
    const dataDir = path.dirname(SQLITE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    _sqlite = new Database(SQLITE_PATH);
    _sqlite.pragma("journal_mode = WAL");

    // Initialize schema
    _sqlite.exec(`
      CREATE TABLE IF NOT EXISTS shortlists (
        id TEXT PRIMARY KEY,
        session_id TEXT DEFAULT 'default',
        need TEXT NOT NULL,
        requirements TEXT NOT NULL,
        weights TEXT NOT NULL,
        excluded_vendors TEXT NOT NULL,
        results TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add session_id if it doesn't exist (handle legacy DBs)
    const tableInfo = _sqlite
      .prepare("PRAGMA table_info(shortlists)")
      .all() as any[];
    const hasSessionId = tableInfo.some((col) => col.name === "session_id");
    if (!hasSessionId) {
      _sqlite.exec(
        "ALTER TABLE shortlists ADD COLUMN session_id TEXT DEFAULT 'default'",
      );
    }
  }
  return _sqlite;
}

const MAX_IN_MEMORY = 20;
const HISTORY_LIMIT = 5;

// ─── PostgreSQL pool (Optional, only used if DATABASE_URL is set) ────────────

let pool: import("pg").Pool | null = null;

async function tryGetPool(): Promise<import("pg").Pool | null> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null; // Use SQLite mode

  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("neon.tech") ||
        connectionString.includes("supabase")
          ? { rejectUnauthorized: false }
          : false,
      max: 5,
    });
  }
  return pool;
}

// ─── initDb ───────────────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  const db = await tryGetPool();
  if (!db) {
    getSqlite(); // Init SQLite
    console.info("[db] Using local SQLite database (Zero-config).");
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS shortlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id TEXT DEFAULT 'default',
      need TEXT NOT NULL,
      requirements JSONB NOT NULL DEFAULT '[]',
      weights JSONB NOT NULL DEFAULT '{}',
      excluded_vendors JSONB NOT NULL DEFAULT '[]',
      results JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

// ─── saveShortlist ────────────────────────────────────────────────────────────

export async function saveShortlist(data: {
  id: string;
  sessionId?: string;
  need: string;
  requirements: string[];
  weights: Record<string, number>;
  excludedVendors: string[];
  results: object;
}): Promise<void> {
  const db = await tryGetPool();
  const sessionId = data.sessionId ?? "default";

  if (!db) {
    const sqlite = getSqlite();

    // Prune logic
    const count = sqlite
      .prepare("SELECT COUNT(*) as total FROM shortlists WHERE session_id = ?")
      .get(sessionId) as { total: number };
    if (count.total >= MAX_IN_MEMORY) {
      sqlite
        .prepare(
          `
        DELETE FROM shortlists WHERE id IN (
          SELECT id FROM shortlists WHERE session_id = ? ORDER BY created_at ASC LIMIT ?
        )
      `,
        )
        .run(sessionId, count.total - MAX_IN_MEMORY + 1);
    }

    const stmt = sqlite.prepare(`
      INSERT INTO shortlists (id, session_id, need, requirements, weights, excluded_vendors, results, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        results = excluded.results,
        created_at = excluded.created_at
    `);

    stmt.run(
      data.id,
      sessionId,
      data.need,
      JSON.stringify(data.requirements),
      JSON.stringify(data.weights),
      JSON.stringify(data.excludedVendors),
      JSON.stringify(data.results),
      new Date().toISOString(),
    );
    return;
  }

  // ── PostgreSQL path ───────────────────────────────────────────────────────
  await db.query(
    `DELETE FROM shortlists WHERE session_id = $1 AND id NOT IN (
       SELECT id FROM shortlists WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2
     )`,
    [sessionId, MAX_IN_MEMORY - 1],
  );

  await db.query(
    `INSERT INTO shortlists (id, session_id, need, requirements, weights, excluded_vendors, results)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
     ON CONFLICT (id) DO UPDATE
       SET results = EXCLUDED.results, created_at = NOW()`,
    [
      data.id,
      sessionId,
      data.need,
      JSON.stringify(data.requirements),
      JSON.stringify(data.weights),
      JSON.stringify(data.excludedVendors),
      JSON.stringify(data.results),
    ],
  );
}

// ─── getShortlists ────────────────────────────────────────────────────────────

export async function getShortlists(
  sessionId = "default",
): Promise<ShortlistRow[]> {
  const db = await tryGetPool();

  // ── SQLite path  ──────────────────────────────────────────────
  if (!db) {
    const sqlite = getSqlite();
    const rows = sqlite
      .prepare(
        `
      SELECT * FROM shortlists WHERE session_id = ? ORDER BY created_at DESC LIMIT ?
    `,
      )
      .all(sessionId, HISTORY_LIMIT) as any[];

    return rows.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      need: r.need,
      requirements: JSON.parse(r.requirements),
      weights: JSON.parse(r.weights),
      excludedVendors: JSON.parse(r.excluded_vendors),
      results: JSON.parse(r.results),
      createdAt: r.created_at,
    }));
  }

  // ── PostgreSQL path ───────────────────────────────────────────────────────
  const { rows } = await db.query(
    `SELECT id, session_id, need, requirements, weights, excluded_vendors, results, created_at
     FROM shortlists WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [sessionId, HISTORY_LIMIT],
  );
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    need: r.need,
    requirements: r.requirements,
    weights: r.weights,
    excludedVendors: r.excluded_vendors,
    results: r.results,
    createdAt: r.created_at,
  }));
}

// ─── getShortlistById ─────────────────────────────────────────────────────────

export async function getShortlistById(
  id: string,
): Promise<ShortlistRow | null> {
  const db = await tryGetPool();

  // ── SQLite path (No API Key) ──────────────────────────────────────────────
  if (!db) {
    const sqlite = getSqlite();
    const r = sqlite
      .prepare("SELECT * FROM shortlists WHERE id = ?")
      .get(id) as any;
    if (!r) return null;

    return {
      id: r.id,
      sessionId: r.session_id,
      need: r.need,
      requirements: JSON.parse(r.requirements),
      weights: JSON.parse(r.weights),
      excludedVendors: JSON.parse(r.excluded_vendors),
      results: JSON.parse(r.results),
      createdAt: r.created_at,
    };
  }

  // ── PostgreSQL path ───────────────────────────────────────────────────────
  const { rows } = await db.query(
    `SELECT id, session_id, need, requirements, weights, excluded_vendors, results, created_at
     FROM shortlists WHERE id = $1`,
    [id],
  );
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    id: r.id,
    sessionId: r.session_id,
    need: r.need,
    requirements: r.requirements,
    weights: r.weights,
    excludedVendors: r.excluded_vendors,
    results: r.results,
    createdAt: r.created_at,
  };
}

export async function getDbMetadata(): Promise<{
  count: number;
  sizeMb: number;
}> {
  const db = await tryGetPool();

  if (!db) {
    const sqlite = getSqlite();
    const count = sqlite
      .prepare("SELECT COUNT(*) as total FROM shortlists")
      .get() as { total: number };

    let sizeMb = 0;
    try {
      const stats = fs.statSync(SQLITE_PATH);
      sizeMb = stats.size / (1024 * 1024);
    } catch (e) {
      console.error("Failed to get SQLite file size:", e);
    }

    return { count: count.total, sizeMb: parseFloat(sizeMb.toFixed(2)) };
  }

  const { rows } = await db.query("SELECT COUNT(*) as total FROM shortlists");
  return { count: parseInt(rows[0].total), sizeMb: 0 }; // Size is harder for PG without more perms
}

// ─── checkDbHealth ────────────────────────────────────────────────────────────

export async function checkDbHealth(): Promise<{
  healthy: boolean;
  message: string;
}> {
  const db = await tryGetPool();

  if (!db) {
    try {
      const sqlite = getSqlite();
      sqlite.prepare("SELECT 1").get();
      return {
        healthy: true,
        message: "SQLite (Local) connected & persistent",
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { healthy: false, message: `SQLite error: ${msg}` };
    }
  }

  try {
    await db.query("SELECT 1");
    return { healthy: true, message: "PostgreSQL connected" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { healthy: false, message: msg };
  }
}
