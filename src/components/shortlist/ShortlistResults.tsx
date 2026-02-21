import React from "react";
import {
  LayoutGrid,
  Table2,
  Download,
  RotateCcw,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { ShortlistResult, FormState } from "@/types/shortlist";
import { ComparisonTable } from "./ComparisonTable";
import { VendorCard } from "./VendorCard";

interface ShortlistResultsProps {
  result: ShortlistResult;
  form: FormState;
  view: "cards" | "table";
  setView: (view: "cards" | "table") => void;
  onExportMarkdown: () => void;
  onReset: () => void;
}

export const ShortlistResults = React.memo(
  ({
    result,
    form,
    view,
    setView,
    onExportMarkdown,
    onReset,
  }: ShortlistResultsProps) => {
    return (
      <div className="animate-fade-in">
        {/* Quota exhausted notice */}
        {result.quotaExhausted && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              background: "var(--warning-bg)",
              border: "1px solid var(--warning-border)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "var(--warning)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Demo results</strong> — Groq API quota is exhausted.
              These are illustrative vendors, not live AI research.{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--warning)", textDecoration: "underline" }}
              >
                Check your Groq usage
              </a>
              .
            </span>
          </div>
        )}

        {/* Results Header */}
        <div className="results-header flex items-center justify-between flex-wrap gap-md mb-lg">
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 4 }}>
              {result.vendors.length} Vendors Found
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              For: <em style={{ color: "var(--text-secondary)" }}>{form.need}</em>
              {" · "}Generated {new Date(result.generatedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="results-actions flex gap-sm flex-wrap">
            <div className="tabs">
              <button
                className={`tab-btn flex items-center gap-xs ${view === "cards" ? "active" : ""}`}
                onClick={() => setView("cards")}
              >
                <LayoutGrid size={13} strokeWidth={2} /> Cards
              </button>
              <button
                className={`tab-btn flex items-center gap-xs ${view === "table" ? "active" : ""}`}
                onClick={() => setView("table")}
              >
                <Table2 size={13} strokeWidth={2} /> Table
              </button>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onExportMarkdown}
            >
              <Download size={13} strokeWidth={2} /> Export MD
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onReset}>
              <RotateCcw size={13} strokeWidth={2} /> New Search
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-sm mb-lg">
          <span className="badge badge-primary">
            {form.requirements.length} requirements
          </span>
          {form.excludedVendors.length > 0 && (
            <span className="badge badge-error">
              <Ban size={10} /> {form.excludedVendors.length} excluded
            </span>
          )}
          <span className="badge badge-success">
            <CheckCircle2 size={10} />{" "}
            {result.vendors.filter((v) => v.score >= 75).length} top picks
          </span>
        </div>

        {/* Table View */}
        {view === "table" && (
          <div className="mb-xl animate-fade-in">
            <ComparisonTable result={result} requirements={form.requirements} />
          </div>
        )}

        {/* Cards View */}
        {view === "cards" && (
          <div className="flex flex-col gap-md">
            {result.vendors.map((vendor, i) => (
              <VendorCard
                key={i}
                vendor={vendor}
                requirements={form.requirements}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

ShortlistResults.displayName = "ShortlistResults";
