import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusItemProps {
  label: string;
  Icon: LucideIcon;
  healthy: boolean;
  message: string;
}

export const StatusItem = React.memo(
  ({ label, Icon, healthy, message }: StatusItemProps) => {
    return (
      <div
        className="card animate-fade-in"
        style={{
          padding: "var(--space-4) var(--space-5)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          borderColor: healthy ? "var(--success-border)" : "var(--error-border)",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Icon box */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            background: healthy ? "var(--success-bg)" : "var(--error-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: healthy ? "var(--success)" : "var(--error)",
            flexShrink: 0,
          }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </div>

        {/* Label + message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--text-primary)",
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {message}
          </div>
        </div>

        {/* Status pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            background: healthy ? "var(--success-bg)" : "var(--error-bg)",
            border: `1px solid ${healthy ? "var(--success-border)" : "var(--error-border)"}`,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: healthy ? "var(--success)" : "var(--error)",
              animation: healthy
                ? "pulse-green 2s infinite"
                : "pulse-red 2s infinite",
            }}
          />
          <span
            style={{
              color: healthy ? "var(--success)" : "var(--error)",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {healthy ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    );
  }
);

StatusItem.displayName = "StatusItem";
