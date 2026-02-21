import React from "react";
import Link from "next/link";
import {
  Calendar,
  Store,
  Scale,
  Ban,
  ChevronDown,
  Download,
  ExternalLink,
} from "lucide-react";
import type { ShortlistRow } from "@/types/shortlist";

interface HistoryCardProps {
  shortlist: ShortlistRow;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  formatDate: (iso: string) => string;
}

export const HistoryCard = React.memo(
  ({ shortlist: s, isSelected, onSelect, formatDate }: HistoryCardProps) => {
    return (
      <div
        className="card animate-fade-in"
        style={{
          cursor: "pointer",
          padding: 0,
          overflow: "hidden",
          borderColor: isSelected
            ? "rgba(91, 141, 238, 0.35)"
            : "var(--border)",
          transition: "all 0.2s ease",
        }}
        onClick={() => onSelect(isSelected ? null : s.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" && onSelect(isSelected ? null : s.id)
        }
        aria-expanded={isSelected}
      >
        {/* Header Row */}
        <div
          className="history-card-header"
          style={{
            padding: "var(--space-5) var(--space-6)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.95rem",
                marginBottom: 5,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {s.need}
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-4)",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                className="flex items-center gap-xs"
                style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
              >
                <Calendar size={12} strokeWidth={2} />
                {formatDate(s.createdAt)}
              </span>
              <span
                className="badge badge-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Store size={11} strokeWidth={2} />
                {s.results.vendors.length} vendors
              </span>
            </div>
          </div>

          <div
            className="history-card-actions"
            style={{
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Link
              href={`/?id=${s.id}`}
              className="btn btn-secondary btn-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={13} /> View
            </Link>
            <div
              style={{
                color: "var(--text-muted)",
                transition: "transform 0.2s ease",
                transform: isSelected ? "rotate(180deg)" : "rotate(0)",
                padding: 4,
                display: "flex",
              }}
            >
              <ChevronDown size={18} />
            </div>
          </div>
        </div>

        {/* Expanded Detail */}
        {isSelected && (
          <div
            style={{
              padding: "var(--space-5) var(--space-6)",
              background: "var(--bg-raised)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              className="history-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "var(--space-6)",
              }}
            >
              {/* Scoring Weights */}
              <div>
                <h4
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <Scale size={13} /> Scoring Weights
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {s.requirements.map((r) => (
                    <div
                      key={r}
                      className="flex items-center justify-between"
                      style={{ fontSize: "0.82rem" }}
                    >
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          marginRight: 8,
                        }}
                      >
                        {r}
                      </span>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 3,
                            background: "var(--border)",
                            borderRadius: 2,
                          }}
                        >
                          <div
                            style={{
                              width: `${(s.weights[r] || 5) * 10}%`,
                              height: "100%",
                              background: "var(--brand)",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            color: "var(--brand)",
                            fontWeight: 600,
                            minWidth: 16,
                            fontSize: "0.78rem",
                          }}
                        >
                          {s.weights[r] ?? 5}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Results */}
              <div>
                <h4
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--text-muted)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 600,
                  }}
                >
                  <Store size={13} /> Top Vendors
                </h4>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {s.results.vendors.slice(0, 3).map((v) => (
                    <div
                      key={v.name}
                      className="flex items-center justify-between"
                      style={{ fontSize: "0.82rem" }}
                    >
                      <span
                        style={{ color: "var(--text-secondary)", fontWeight: 500 }}
                      >
                        {v.name}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: v.score >= 75 ? "var(--success)" : "var(--warning)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {v.score}%
                      </span>
                    </div>
                  ))}
                </div>

                {s.excludedVendors.length > 0 && (
                  <div style={{ marginTop: "var(--space-4)" }}>
                    <h4
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "var(--text-muted)",
                        marginBottom: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 600,
                      }}
                    >
                      <Ban size={13} /> Excluded
                    </h4>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--error)",
                        background: "var(--error-bg)",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--error-border)",
                      }}
                    >
                      {s.excludedVendors.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div
              style={{
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-4)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <a
                href={`/api/shortlist/${s.id}?format=markdown`}
                className="btn btn-ghost btn-sm"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={12} /> Download Report
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
);

HistoryCard.displayName = "HistoryCard";
