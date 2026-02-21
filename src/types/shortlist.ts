export interface FeatureMatch {
  requirement: string;
  matched: boolean;
  detail: string;
}

export interface EvidenceLink {
  title: string;
  url: string;
  snippet: string;
}

export interface VendorResult {
  name: string;
  website: string;
  summary: string;
  score: number;
  priceRange: string;
  matchedFeatures: FeatureMatch[];
  risks: string[];
  evidenceLinks: EvidenceLink[];
}

export interface ShortlistResult {
  summary: string;
  vendors: VendorResult[];
  recommendation: string;
  generatedAt: string;
  /** True when Gemini quota was exhausted and results are static demo data */
  quotaExhausted?: boolean;
}

export interface FormState {
  need: string;
  requirements: string[];
  weights: Record<string, number>;
  excludedVendors: string[];
  currentReq: string;
  currentExclude: string;
}

export interface LoadingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
}

export interface ShortlistRow {
  id: string;
  sessionId: string;
  need: string;
  requirements: string[];
  weights: Record<string, number>;
  excludedVendors: string[];
  results: ShortlistResult;
  createdAt: string;
}

export interface HealthCheck {
  healthy: boolean;
  message: string;
}

export interface HealthData {
  status: "healthy" | "degraded";
  responseTimeMs: number;
  checks: {
    backend: HealthCheck;
    db: HealthCheck;
    llm: HealthCheck;
  };
  timestamp: string;
  system: {
    node: string;
    platform: string;
    uptime: number;
    memory: {
      rss: number;
      heapUsed: number;
    };
  };
  metadata?: {
    shortlistCount?: number;
    dbSizeMb?: number;
  };
}
