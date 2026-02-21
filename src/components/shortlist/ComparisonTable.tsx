import React from "react";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import type { ShortlistResult } from "@/types/shortlist";

interface ComparisonTableProps {
  result: ShortlistResult;
  requirements: string[];
}

export const ComparisonTable = React.memo(
  ({ result, requirements }: ComparisonTableProps) => {
    return (
      <div className="comparison-table-wrapper">
        <table
          className="comparison-table"
          role="table"
          aria-label="Vendor comparison table"
        >
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Score</th>
              <th>Price Range</th>
              {requirements.map((r) => (
                <th key={r} title={r}>
                  {r.length > 24 ? r.slice(0, 24) + "…" : r}
                </th>
              ))}
              <th>Top Risk</th>
            </tr>
          </thead>
          <tbody>
            {result.vendors.map((v, i) => (
              <tr key={i}>
                <td>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    {v.name}
                  </div>
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-xs"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {v.website.replace(/^https?:\/\//, "").split("/")[0]}
                    <ExternalLink size={10} strokeWidth={2} />
                  </a>
                </td>
                <td>
                  <span
                    className={`badge ${v.score >= 75 ? "badge-success" : v.score >= 50 ? "badge-warning" : "badge-error"}`}
                  >
                    {v.score}/100
                  </span>
                </td>
                <td
                  style={{
                    whiteSpace: "nowrap",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {v.priceRange}
                </td>
                {requirements.map((r) => {
                  const match = v.matchedFeatures.find(
                    (f) => f.requirement === r,
                  );
                  return (
                    <td key={r}>
                      {match ? (
                        match.matched ? (
                          <CheckCircle2
                            size={16}
                            color="var(--success)"
                            strokeWidth={2}
                            aria-label={match.detail}
                          />
                        ) : (
                          <XCircle
                            size={16}
                            color="var(--error)"
                            strokeWidth={2}
                            aria-label={match.detail}
                          />
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                  );
                })}
                <td
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    maxWidth: 200,
                  }}
                >
                  {v.risks[0] || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

ComparisonTable.displayName = "ComparisonTable";
