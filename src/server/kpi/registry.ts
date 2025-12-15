/**
 * KPI Registry - Central registry for KPI evaluators.
 */

import { KPIEvaluator } from "./types";

class KPIRegistry {
  private evaluators: Map<string, KPIEvaluator> = new Map();

  register(evaluator: KPIEvaluator): void {
    if (this.evaluators.has(evaluator.id)) {
      throw new Error(
        `KPI evaluator with id '${evaluator.id}' is already registered`
      );
    }
    this.evaluators.set(evaluator.id, evaluator);
  }

  get(id: string): KPIEvaluator | undefined {
    return this.evaluators.get(id);
  }

  has(id: string): boolean {
    return this.evaluators.has(id);
  }

  getIds(): string[] {
    return Array.from(this.evaluators.keys());
  }

  getAll(): KPIEvaluator[] {
    return Array.from(this.evaluators.values());
  }

  unregister(id: string): boolean {
    return this.evaluators.delete(id);
  }

  clear(): void {
    this.evaluators.clear();
  }

  get size(): number {
    return this.evaluators.size;
  }
}

export const kpiRegistry = new KPIRegistry();
