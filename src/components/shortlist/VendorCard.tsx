import React, { useState } from "react";
import {
  Star,
  ThumbsUp,
  BadgeAlert,
  DollarSign,
  CheckCircle2,
  Globe,
  ChevronUp,
  ChevronDown,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import type { VendorResult } from "@/types/shortlist";
import { ScoreRing } from "./ScoreRing";

interface VendorCardProps {
  vendor: VendorResult;
  requirements: string[];
}

export const VendorCard = React.memo(
  ({ vendor, requirements }: VendorCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const matchedCount = vendor.matchedFeatures.filter((f) => f.matched).length;

    const scoreBadge =
      vendor.score >= 75 ? (
        <span
          className="badge badge-success"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <Star size={9} fill="currentColor" /> Top Pick
        </span>
      ) : vendor.score >= 50 ? (
        <span
          className="badge badge-warning"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <ThumbsUp size={9} fill="currentColor" /> Balanced
        </span>
      ) : (
        <span
          className="badge badge-error"
          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <BadgeAlert size={9} fill="currentColor" /> Niche
        </span>
      );

    return (
      <div className="vendor-card">
        {/* Card Header */}
        <div className="vendor-card-header">
          <ScoreRing score={vendor.score} />

          <div className="flex-1">
            <div
              className="flex items-center gap-sm flex-wrap"
              style={{ marginBottom: 4 }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                {vendor.name}
              </h3>
              {scoreBadge}
            </div>
            <div
              className="flex items-center gap-md flex-wrap"
              style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 4 }}
            >
              <span className="flex items-center gap-xs">
                <DollarSign size={12} strokeWidth={2} />
                {vendor.priceRange}
              </span>
              <span className="flex items-center gap-xs">
                <CheckCircle2
                  size={12}
                  strokeWidth={2}
                  color="var(--success)"
                />
                {matchedCount}/{requirements.length} matched
              </span>
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-xs"
                style={{ color: "var(--brand)", fontSize: "0.78rem" }}
              >
                <Globe size={11} strokeWidth={2} />
                {vendor.website.replace(/^https?:\/\//, "").split("/")[0]}
              </a>
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                lineHeight: 1.55,
              }}
            >
              {vendor.summary}
            </p>
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            style={{ flexShrink: 0 }}
          >
            {expanded ? (
              <>
                <ChevronUp size={13} /> Less
              </>
            ) : (
              <>
                <ChevronDown size={13} /> More
              </>
            )}
          </button>
        </div>

        {/* Expanded Body */}
        {expanded && (
          <div className="vendor-card-body">
            {/* Requirements Match */}
            <div className="vendor-card-section">
              <h4>Requirements Match</h4>
              {vendor.matchedFeatures.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className="feature-icon">
                    {f.matched ? (
                      <CheckCircle2
                        size={14}
                        color="var(--success)"
                        strokeWidth={2}
                      />
                    ) : (
                      <XCircle size={14} color="var(--error)" strokeWidth={2} />
                    )}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginBottom: 2,
                      }}
                    >
                      {f.requirement}
                    </div>
                    <div
                      style={{ fontSize: "0.77rem", color: "var(--text-muted)" }}
                    >
                      {f.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Risks & Evidence */}
            <div className="vendor-card-section">
              <h4>Risks & Limitations</h4>
              {vendor.risks.map((r, i) => (
                <div key={i} className="risk-item">
                  <AlertTriangle
                    size={13}
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <span>{r}</span>
                </div>
              ))}

              <h4 style={{ marginTop: "var(--space-4)" }}>Evidence Links</h4>
              {vendor.evidenceLinks.map((e, i) => (
                <a
                  key={i}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="evidence-link"
                >
                  <div className="link-title">
                    <ExternalLink size={11} strokeWidth={2} />
                    {e.title}
                  </div>
                  <div className="link-snippet">"{e.snippet}"</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VendorCard.displayName = "VendorCard";
