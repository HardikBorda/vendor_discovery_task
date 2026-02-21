import React from "react";
import { Loader2, Check, CircleDashed } from "lucide-react";
import type { LoadingStep } from "@/types/shortlist";

interface LoadingProgressProps {
  steps: LoadingStep[];
}

export const LoadingProgress = React.memo(({ steps }: LoadingProgressProps) => {
  return (
    <div
      className="card animate-fade-in"
      style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}
    >
      <div style={{ marginBottom: "var(--space-5)" }}>
        <Loader2
          size={36}
          strokeWidth={1.5}
          color="var(--brand)"
          style={{
            margin: "0 auto var(--space-3)",
            display: "block",
            animation: "spin 1s linear infinite",
          }}
        />
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: 6 }}>
          Researching vendors…
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
          This may take 15–30 seconds
        </p>
      </div>

      <div className="loading-steps">
        {steps.map((step) => (
          <div key={step.id} className={`loading-step ${step.status}`}>
            <span className="flex items-center" style={{ flexShrink: 0 }}>
              {step.status === "done" ? (
                <Check size={15} color="var(--success)" strokeWidth={2.5} />
              ) : step.status === "active" ? (
                <Loader2
                  size={15}
                  color="var(--brand)"
                  strokeWidth={2}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : (
                <CircleDashed
                  size={15}
                  color="var(--text-muted)"
                  strokeWidth={1.5}
                />
              )}
            </span>
            <span style={{ fontSize: "0.875rem", textAlign: "left" }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

LoadingProgress.displayName = "LoadingProgress";
