/**
 * KPI Module Public API
 */

export type {
  KPIStatus,
  KPIResult,
  KPIConfig,
  KPIContext,
  KPIEvaluator,
  KPIConfigLoader,
  KPIRunSummary,
  KPIEngineOptions,
} from "./types";

export { DEFAULT_KPI_CONFIGS } from "./types";
export { kpiRegistry } from "./registry";
export { KPIEngine, DefaultConfigLoader, createKPIEngine } from "./engine";
export {
  WebsiteUptimeEvaluator,
  websiteUptimeEvaluator,
  EmailBounceRateEvaluator,
  emailBounceRateEvaluator,
  registerBuiltinEvaluators,
} from "./evaluators";
