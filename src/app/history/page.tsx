"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, Inbox, Loader2 } from "lucide-react";
import type { ShortlistRow } from "@/types/shortlist";
import { HistoryCard } from "@/components/history/HistoryCard";

export default function HistoryPage() {
  const [shortlists, setShortlists] = useState<ShortlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setShortlists(data.shortlists);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = useCallback((iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ padding: "var(--space-8) 0 var(--space-12)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          {/* Page Header */}
          <div className="page-section-header">
            <div>
              <h1>Shortlist History</h1>
              <p className="subtitle">Your last 5 saved shortlists</p>
            </div>
            <Link href="/" className="btn btn-primary">
              <Plus size={15} strokeWidth={2.5} />
              New Shortlist
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-12) 0",
                color: "var(--text-muted)",
              }}
            >
              <Loader2
                size={32}
                strokeWidth={1.5}
                color="var(--brand)"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span style={{ fontSize: "0.875rem" }}>Loading history…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              className="card"
              style={{
                borderColor: "var(--error-border)",
                background: "var(--error-bg)",
                textAlign: "center",
                padding: "var(--space-6)",
              }}
            >
              <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>
                {error}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && shortlists.length === 0 && (
            <div
              className="card"
              style={{ textAlign: "center", padding: "var(--space-12) var(--space-6)" }}
            >
              <Inbox
                size={40}
                strokeWidth={1}
                color="var(--text-muted)"
                style={{ margin: "0 auto var(--space-4)", display: "block" }}
              />
              <h3 style={{ marginBottom: "var(--space-2)", fontSize: "1.05rem" }}>
                No shortlists yet
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.875rem",
                  marginBottom: "var(--space-5)",
                }}
              >
                Build your first shortlist to see it here
              </p>
              <Link href="/" className="btn btn-primary">
                <Plus size={15} strokeWidth={2.5} />
                Build Your First Shortlist
              </Link>
            </div>
          )}

          {/* List */}
          {!loading && shortlists.length > 0 && (
            <div className="flex flex-col gap-md">
              {shortlists.map((s) => (
                <HistoryCard
                  key={s.id}
                  shortlist={s}
                  isSelected={selectedId === s.id}
                  onSelect={handleSelect}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
