import React from "react";
import { Search, Plus, Ban, X, Rocket } from "lucide-react";
import type { FormState } from "@/types/shortlist";

interface ShortlistFormProps {
  form: FormState;
  errors: Record<string, string>;
  loading: boolean;
  onUpdateForm: (updates: Partial<FormState>) => void;
  onAddRequirement: () => void;
  onRemoveRequirement: (req: string) => void;
  onUpdateWeight: (req: string, weight: number) => void;
  onAddExclude: () => void;
  onSubmit: () => void;
}

const EXAMPLE_NEEDS = [
  "Email delivery service for India",
  "Vector database for small team",
  "CI/CD platform for open source project",
  "Customer support chat widget",
  "Serverless hosting for Node.js API",
];

export const ShortlistForm = React.memo(
  ({
    form,
    errors,
    loading,
    onUpdateForm,
    onAddRequirement,
    onRemoveRequirement,
    onUpdateWeight,
    onAddExclude,
    onSubmit,
  }: ShortlistFormProps) => {
    return (
      <div
        className="card animate-fade-in"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            marginBottom: "var(--space-6)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Search size={18} strokeWidth={2} color="var(--brand)" />
          Build Your Shortlist
        </h2>

        {/* Need */}
        <div className="form-group mb-lg">
          <label className="form-label" htmlFor="need-input">
            What do you need?
          </label>
          <textarea
            id="need-input"
            className="form-textarea"
            placeholder="e.g. email delivery service for India, vector database for small team…"
            value={form.need}
            onChange={(e) => onUpdateForm({ need: e.target.value })}
            rows={3}
          />
          {errors.need && <div className="form-error">{errors.need}</div>}

          <div className="example-needs-container mt-sm">
            <span className="example-needs-label">Try an example:</span>
            <div className="flex flex-wrap gap-xs">
              {EXAMPLE_NEEDS.map((ex) => (
                <button
                  key={ex}
                  className="example-chip-btn"
                  onClick={() => onUpdateForm({ need: ex })}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="form-group mb-lg">
          <label className="form-label">
            Requirements ({form.requirements.length}/10)
          </label>
          <div className="input-group-stack">
            <input
              id="req-input"
              className="form-input flex-1"
              placeholder="e.g. budget under $50/month, GDPR compliant…"
              value={form.currentReq}
              onChange={(e) => onUpdateForm({ currentReq: e.target.value })}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), onAddRequirement())
              }
            />
            <button
              className="btn btn-secondary add-btn"
              onClick={onAddRequirement}
              disabled={!form.currentReq.trim()}
            >
              <Plus size={14} strokeWidth={2.5} /> Add
            </button>
          </div>
          {errors.requirements && (
            <div className="form-error">{errors.requirements}</div>
          )}
          <p className="form-hint">
            Press Enter or click Add. Adjust sliders to weight importance (1 = low, 10 = critical).
          </p>

          {form.requirements.length > 0 && (
            <div
              style={{
                marginTop: "var(--space-3)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {form.requirements.map((req) => (
                <div key={req} className="requirement-item">
                  <div className="requirement-info">
                    <span className="requirement-name">{req}</span>
                    <button
                      className="tag-remove"
                      onClick={() => onRemoveRequirement(req)}
                      aria-label={`Remove ${req}`}
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="requirement-weight">
                    <div className="weight-label">
                      <span>Weight:</span>
                      <strong className="weight-value">
                        {form.weights[req] ?? 5}
                      </strong>
                      <span className="weight-max">/10</span>
                    </div>
                    <input
                      type="range"
                      className="weight-slider flex-1"
                      min={1}
                      max={10}
                      step={1}
                      value={form.weights[req] ?? 5}
                      onChange={(e) =>
                        onUpdateWeight(req, parseInt(e.target.value))
                      }
                      aria-label={`Weight for ${req}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exclude Vendors */}
        <div className="form-group mb-xl">
          <label className="form-label">Exclude Vendors (optional)</label>
          <div className="input-group-stack">
            <input
              id="exclude-input"
              className="form-input flex-1"
              placeholder="e.g. AWS, Salesforce…"
              value={form.currentExclude}
              onChange={(e) =>
                onUpdateForm({ currentExclude: e.target.value })
              }
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), onAddExclude())
              }
            />
            <button
              className="btn btn-secondary add-btn"
              onClick={onAddExclude}
              disabled={!form.currentExclude.trim()}
            >
              <Ban size={14} strokeWidth={2} /> Exclude
            </button>
          </div>
          {form.excludedVendors.length > 0 && (
            <div className="flex flex-wrap gap-xs mt-sm">
              {form.excludedVendors.map((v) => (
                <span
                  key={v}
                  className="tag flex items-center gap-xs"
                  style={{
                    background: "var(--error-bg)",
                    borderColor: "var(--error-border)",
                    color: "var(--error)",
                  }}
                >
                  <Ban size={10} strokeWidth={2} />
                  {v}
                  <button
                    className="tag-remove"
                    onClick={() =>
                      onUpdateForm({
                        excludedVendors: form.excludedVendors.filter(
                          (ev) => ev !== v
                        ),
                      })
                    }
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          id="build-shortlist-btn"
          className="btn btn-primary btn-lg w-full"
          onClick={onSubmit}
          disabled={loading}
        >
          <Rocket size={16} strokeWidth={2} />
          Build Shortlist
        </button>
      </div>
    );
  }
);

ShortlistForm.displayName = "ShortlistForm";
