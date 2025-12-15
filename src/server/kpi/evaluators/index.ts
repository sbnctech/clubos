/**
 * KPI Evaluators Index
 */

import { kpiRegistry } from "../registry";
import { websiteUptimeEvaluator } from "./website-uptime";
import { emailBounceRateEvaluator } from "./email-bounce-rate";

export { WebsiteUptimeEvaluator, websiteUptimeEvaluator } from "./website-uptime";
export {
  EmailBounceRateEvaluator,
  emailBounceRateEvaluator,
} from "./email-bounce-rate";

export function registerBuiltinEvaluators(): void {
  kpiRegistry.register(websiteUptimeEvaluator);
  kpiRegistry.register(emailBounceRateEvaluator);
}
