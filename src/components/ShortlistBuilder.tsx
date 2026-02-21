"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RotateCcw, RefreshCw } from "lucide-react";

import type {
  ShortlistResult,
  FormState,
  LoadingStep,
} from "@/types/shortlist";
import { ShortlistForm } from "./shortlist/ShortlistForm";
import { LoadingProgress } from "./shortlist/LoadingProgress";
import { ShortlistResults } from "./shortlist/ShortlistResults";

const LOADING_STEPS: LoadingStep[] = [
  { id: "parse", label: "Parsing your requirements...", status: "pending" },
  {
    id: "identify",
    label: "Identifying candidate vendors...",
    status: "pending",
  },
  {
    id: "research",
    label: "Researching pricing & features...",
    status: "pending",
  },
  {
    id: "score",
    label: "Scoring against weighted requirements...",
    status: "pending",
  },
  { id: "compile", label: "Compiling comparison report...", status: "pending" },
];

export default function ShortlistBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormState>({
    need: "",
    requirements: [],
    weights: {},
    excludedVendors: [],
    currentReq: "",
    currentExclude: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).has("id");
    }
    return false;
  });
  const [loadingSteps, setLoadingSteps] =
    useState<LoadingStep[]>(LOADING_STEPS);
  const [result, setResult] = useState<ShortlistResult | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  // Load from URL if present
  useEffect(() => {
    const id = searchParams.get("id");
    if (id && id !== resultId) {
      setResult(null);
      setLoading(true);

      fetch(`/api/shortlist/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Result not found");
          return res.json();
        })
        .then((data) => {
          setResult(data.results);
          setResultId(id);
          setForm((f) => ({
            ...f,
            need: data.need,
            requirements: data.requirements,
            weights: data.weights,
            excludedVendors: data.excludedVendors || [],
          }));
        })
        .catch(() => {
          router.replace(pathname);
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, resultId, pathname, router]); // Removed 'loading' from dependencies to avoid loop if we manage it internally during fetch

  const simulateSteps = useCallback(async () => {
    const steps = ["parse", "identify", "research", "score", "compile"];
    setLoadingSteps(LOADING_STEPS.map((s) => ({ ...s, status: "pending" })));

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
      setLoadingSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: idx < i ? "done" : idx === i ? "active" : "pending",
        })),
      );
    }
  }, []);

  const handleUpdateForm = useCallback((updates: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...updates }));
    if (updates.need !== undefined) setErrors((e) => ({ ...e, need: "" }));
    if (updates.requirements !== undefined)
      setErrors((e) => ({ ...e, requirements: "" }));
  }, []);

  const addRequirement = useCallback(() => {
    const req = form.currentReq.trim();
    if (!req) return;
    if (form.requirements.length >= 10) {
      setErrors((e) => ({ ...e, requirements: "Maximum 10 requirements." }));
      return;
    }
    if (form.requirements.includes(req)) {
      setErrors((e) => ({ ...e, requirements: "Duplicate requirement." }));
      return;
    }
    setForm((f) => ({
      ...f,
      requirements: [...f.requirements, req],
      weights: { ...f.weights, [req]: 5 },
      currentReq: "",
    }));
    setErrors((e) => ({ ...e, requirements: "" }));
  }, [form.currentReq, form.requirements]);

  const removeRequirement = useCallback((req: string) => {
    setForm((f) => {
      const { [req]: _, ...newWeights } = f.weights;
      return {
        ...f,
        requirements: f.requirements.filter((r) => r !== req),
        weights: newWeights,
      };
    });
  }, []);

  const updateWeight = useCallback((req: string, weight: number) => {
    setForm((f) => ({ ...f, weights: { ...f.weights, [req]: weight } }));
  }, []);

  const addExclude = useCallback(() => {
    const v = form.currentExclude.trim();
    if (!v || form.excludedVendors.includes(v)) return;
    setForm((f) => ({
      ...f,
      excludedVendors: [...f.excludedVendors, v],
      currentExclude: "",
    }));
  }, [form.currentExclude, form.excludedVendors]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.need.trim() || form.need.trim().length < 5) {
      newErrors.need = "Please describe your need (at least 5 characters).";
    }
    if (form.requirements.length < 1) {
      newErrors.requirements = "Add at least 1 requirement.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    setApiError(null);
    setResultId(null);

    simulateSteps();

    try {
      const res = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          need: form.need,
          requirements: form.requirements,
          weights: form.weights,
          excludedVendors: form.excludedVendors,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to build shortlist");

      setLoadingSteps(LOADING_STEPS.map((s) => ({ ...s, status: "done" })));
      await new Promise((r) => setTimeout(r, 400));

      setResult(data.result);
      setResultId(data.id);

      const params = new URLSearchParams(searchParams.toString());
      params.set("id", data.id);
      router.push(`${pathname}?${params.toString()}`);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleExportMarkdown = useCallback(() => {
    if (!resultId) return;
    window.open(`/api/shortlist/${resultId}?format=markdown`, "_blank");
  }, [resultId]);

  const handleReset = useCallback(() => {
    setResult(null);
    setApiError(null);
    setLoadingSteps(LOADING_STEPS);
    setForm({
      need: "",
      requirements: [],
      weights: {},
      excludedVendors: [],
      currentReq: "",
      currentExclude: "",
    });
    router.replace(pathname);
  }, [pathname, router]);

  const isUrlStale = searchParams.get("id") !== resultId;

  return (
    <div className="shortlist-builder">
      {/* ── ERROR ── shown above form when present */}
      {apiError && !loading && !result && (
        <div
          className="card animate-scale-in"
          style={{
            maxWidth: 720,
            margin: "0 auto var(--space-md)",
            borderColor: "var(--error-border)",
            background: "var(--error-bg)",
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            padding: "var(--space-4) var(--space-5)",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontWeight: 600,
                color: "var(--error)",
                marginBottom: 4,
                fontSize: "0.9rem",
              }}
            >
              Research Interrupted
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {apiError}
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
            <button className="btn btn-ghost btn-sm" onClick={handleReset}>
              <RotateCcw size={14} /> Reset
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* ── FORM ── */}
      {!result &&
        !loading &&
        (!searchParams.get("id") || searchParams.get("id") === resultId) && (
          <ShortlistForm
            form={form}
            errors={errors}
            loading={loading}
            onUpdateForm={handleUpdateForm}
            onAddRequirement={addRequirement}
            onRemoveRequirement={removeRequirement}
            onUpdateWeight={updateWeight}
            onAddExclude={addExclude}
            onSubmit={handleSubmit}
          />
        )}

      {/* ── LOADING ── */}
      {(loading || (searchParams.get("id") && isUrlStale)) && (
        <LoadingProgress steps={loadingSteps} />
      )}

      {/* ── RESULTS ── */}
      {result && !loading && !isUrlStale && (
        <ShortlistResults
          result={result}
          form={form}
          view={view}
          setView={setView}
          onExportMarkdown={handleExportMarkdown}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
