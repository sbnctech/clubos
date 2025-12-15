/**
 * KPI Engine Types
 */

export type KPIStatus = "OK" | "WARNING" | "CRITICAL" | "UNKNOWN";

export interface KPIResult {
  kpiId: string;
  name: string;
  status: KPIStatus;
  message: string;
  value?: number;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  evaluatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface KPIConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  options?: Record<string, unknown>;
}

export interface KPIContext {
  evaluationTime: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface KPIEvaluator {
  readonly id: string;
  evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult>;
}

export interface KPIConfigLoader {
  loadConfigs(): Promise<KPIConfig[]>;
  loadConfig(id: string): Promise<KPIConfig | undefined>;
}

export interface KPIRunSummary {
  runStartedAt: Date;
  runCompletedAt: Date;
  total: number;
  byStatus: Record<KPIStatus, number>;
  overallStatus: KPIStatus;
  results: KPIResult[];
}

export interface KPIEngineOptions {
  configLoader?: KPIConfigLoader;
  parallel?: boolean;
  timeoutMs?: number;
}

export const DEFAULT_KPI_CONFIGS: KPIConfig[] = [
  {
    id: "website-uptime",
    name: "Website Uptime",
    description: "Monitors website availability and response time",
    enabled: true,
    category: "operations",
    warningThreshold: 99.5,
    criticalThreshold: 99.0,
  },
  {
    id: "email-bounce-rate",
    name: "Email Bounce Rate",
    description: "Tracks email delivery bounce rate",
    enabled: true,
    category: "operations",
    warningThreshold: 5,
    criticalThreshold: 10,
  },
];
