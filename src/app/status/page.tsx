"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import {
  RefreshCw,
  Zap,
  Database,
  Bot,
  Loader2,
  AlertTriangle,
  Activity,
  Cpu,
  ShieldCheck,
  Disc,
} from "lucide-react";

import { StatusItem } from "@/components/status/StatusItem";
import type { HealthData } from "@/types/shortlist";

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data: HealthData = await res.json();
      setHealth(data);
      setLastChecked(new Date());
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const checks = health
    ? [
      {
        key: "backend",
        label: "Backend API",
        Icon: Zap,
        ...health.checks.backend,
      },
      {
        key: "db",
        label: "Database (SQLite)",
        Icon: Database,
        ...health.checks.db,
      },
      {
        key: "llm",
        label: "LLM (Groq Llama 3.3)",
        Icon: Bot,
        ...health.checks.llm,
      },
    ]
    : [];

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const isHealthy = health?.status === "healthy";

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ padding: "var(--space-8) 0 var(--space-12)" }}>
        <div className="container" style={{ maxWidth: 720 }}>

          {/* Page Header */}
          <div className="page-section-header">
            <div>
              <h1>System Status</h1>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                <Activity size={13} strokeWidth={2} />
                {lastChecked
                  ? `Last checked ${lastChecked.toLocaleTimeString()}`
                  : "Connecting…"}
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--success)",
                    display: "inline-block",
                    marginLeft: 4,
                  }}
                />
                <span>Live</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={fetchHealth}
              disabled={loading}
            >
              {loading ? (
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>
          </div>

          {/* Overall Status Card */}
          {health && (
            <div
              className="card animate-scale-in"
              style={{
                borderColor: isHealthy
                  ? "var(--success-border)"
                  : "var(--error-border)",
                background: isHealthy
                  ? "rgba(52, 211, 153, 0.04)"
                  : "rgba(248, 113, 113, 0.04)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
                marginBottom: "var(--space-6)",
                padding: "var(--space-5) var(--space-6)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  background: isHealthy
                    ? "var(--success-bg)"
                    : "var(--error-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: isHealthy ? "var(--success)" : "var(--error)",
                }}
              >
                {isHealthy ? (
                  <ShieldCheck size={22} strokeWidth={2} />
                ) : (
                  <AlertTriangle size={22} strokeWidth={2} />
                )}
              </div>
              <div>
                <h2 style={{ fontSize: "1.05rem", marginBottom: 3 }}>
                  {isHealthy ? "All Systems Operational" : "System Degraded"}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  {isHealthy
                    ? "All subsystems are responding normally. Shortlist generation is active."
                    : "Latency or connectivity issues detected. Results may be delayed."}
                </p>
              </div>
            </div>
          )}

          {/* Subsystems */}
          <div style={{ marginBottom: "var(--space-6)" }}>
            <h2
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-muted)",
                marginBottom: "var(--space-3)",
              }}
            >
              Subsystem Connectivity
            </h2>
            <div className="flex flex-col gap-sm">
              {loading && !health
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="card skeleton"
                    style={{ height: 72, opacity: 0.4 }}
                  />
                ))
                : checks.map((check) => (
                  <StatusItem
                    key={check.key}
                    label={check.label}
                    Icon={check.Icon}
                    healthy={check.healthy}
                    message={check.message}
                  />
                ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-4)",
            }}
            className="system-info-stack"
          >
            {/* Performance */}
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h4
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Cpu size={13} />
                Performance
              </h4>
              <div>
                <div className="info-row">
                  <span className="label">Response Time</span>
                  <span
                    className="value"
                    style={{
                      color:
                        (health?.responseTimeMs || 0) < 200
                          ? "var(--success)"
                          : "var(--warning)",
                    }}
                  >
                    {health?.responseTimeMs ?? "—"} ms
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Storage</span>
                  <span className="value">
                    {health?.metadata?.dbSizeMb ?? "—"} MB
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Memory</span>
                  <span className="value">
                    {health?.system.memory.heapUsed ?? "—"} MB
                  </span>
                </div>
                <div className="info-row" style={{ borderBottom: "none" }}>
                  <span className="label">Uptime</span>
                  <span className="value">
                    {health ? formatUptime(health.system.uptime) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="card" style={{ padding: "var(--space-5)" }}>
              <h4
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Disc size={13} />
                Environment
              </h4>
              <div>
                <div className="info-row">
                  <span className="label">Build Mode</span>
                  <span
                    className="value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {process.env.NODE_ENV}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Shortlists</span>
                  <span className="value">
                    {health?.metadata?.shortlistCount ?? "—"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Runtime</span>
                  <span className="value">
                    Node {health?.system.node.split("v")[1] ?? "—"}
                  </span>
                </div>
                <div className="info-row" style={{ borderBottom: "none" }}>
                  <span
                    className="label"
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.72rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    /data/shortlists.db
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
