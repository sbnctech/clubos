/**
 * Website Uptime KPI Evaluator (Stub)
 */

import { KPIConfig, KPIContext, KPIEvaluator, KPIResult } from "../types";

export class WebsiteUptimeEvaluator implements KPIEvaluator {
  readonly id = "website-uptime";

  async evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult> {
    return {
      kpiId: this.id,
      name: config.name,
      status: "UNKNOWN",
      message: "Not yet wired to monitoring service",
      evaluatedAt: context.evaluationTime,
      metadata: { stub: true },
    };
  }
}

export const websiteUptimeEvaluator = new WebsiteUptimeEvaluator();
