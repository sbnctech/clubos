/**
 * Email Bounce Rate KPI Evaluator (Stub)
 */

import { KPIConfig, KPIContext, KPIEvaluator, KPIResult } from "../types";

export class EmailBounceRateEvaluator implements KPIEvaluator {
  readonly id = "email-bounce-rate";

  async evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult> {
    return {
      kpiId: this.id,
      name: config.name,
      status: "UNKNOWN",
      message: "Not yet wired to email service",
      evaluatedAt: context.evaluationTime,
      metadata: { stub: true },
    };
  }
}

export const emailBounceRateEvaluator = new EmailBounceRateEvaluator();
