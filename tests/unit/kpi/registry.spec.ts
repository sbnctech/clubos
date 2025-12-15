/**
 * KPI Registry Unit Tests
 */

import { test, expect } from "@playwright/test";
import { kpiRegistry } from "../../../src/server/kpi/registry";
import {
  KPIConfig,
  KPIContext,
  KPIEvaluator,
  KPIResult,
} from "../../../src/server/kpi/types";

class MockEvaluator implements KPIEvaluator {
  constructor(public readonly id: string) {}

  async evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult> {
    return {
      kpiId: this.id,
      name: config.name,
      status: "OK",
      message: "Mock evaluation",
      evaluatedAt: context.evaluationTime,
    };
  }
}

test.describe("KPIRegistry", () => {
  test.beforeEach(() => {
    kpiRegistry.clear();
  });

  test("register adds evaluator to registry", () => {
    const evaluator = new MockEvaluator("test-kpi");
    kpiRegistry.register(evaluator);
    expect(kpiRegistry.has("test-kpi")).toBe(true);
    expect(kpiRegistry.size).toBe(1);
  });

  test("register throws on duplicate ID", () => {
    kpiRegistry.register(new MockEvaluator("test-kpi"));
    expect(() => kpiRegistry.register(new MockEvaluator("test-kpi"))).toThrow(
      "KPI evaluator with id 'test-kpi' is already registered"
    );
  });

  test("get returns registered evaluator", () => {
    const evaluator = new MockEvaluator("test-kpi");
    kpiRegistry.register(evaluator);
    expect(kpiRegistry.get("test-kpi")).toBe(evaluator);
  });

  test("get returns undefined for unregistered ID", () => {
    expect(kpiRegistry.get("nonexistent")).toBeUndefined();
  });

  test("has returns true for registered evaluator", () => {
    kpiRegistry.register(new MockEvaluator("test-kpi"));
    expect(kpiRegistry.has("test-kpi")).toBe(true);
  });

  test("has returns false for unregistered evaluator", () => {
    expect(kpiRegistry.has("nonexistent")).toBe(false);
  });

  test("getIds returns all registered IDs", () => {
    kpiRegistry.register(new MockEvaluator("kpi-1"));
    kpiRegistry.register(new MockEvaluator("kpi-2"));
    const ids = kpiRegistry.getIds();
    expect(ids).toHaveLength(2);
    expect(ids).toContain("kpi-1");
    expect(ids).toContain("kpi-2");
  });

  test("getAll returns all registered evaluators", () => {
    const e1 = new MockEvaluator("kpi-1");
    const e2 = new MockEvaluator("kpi-2");
    kpiRegistry.register(e1);
    kpiRegistry.register(e2);
    const all = kpiRegistry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(e1);
    expect(all).toContain(e2);
  });

  test("unregister removes evaluator", () => {
    kpiRegistry.register(new MockEvaluator("test-kpi"));
    expect(kpiRegistry.unregister("test-kpi")).toBe(true);
    expect(kpiRegistry.has("test-kpi")).toBe(false);
  });

  test("unregister returns false for nonexistent ID", () => {
    expect(kpiRegistry.unregister("nonexistent")).toBe(false);
  });

  test("clear removes all evaluators", () => {
    kpiRegistry.register(new MockEvaluator("kpi-1"));
    kpiRegistry.register(new MockEvaluator("kpi-2"));
    kpiRegistry.clear();
    expect(kpiRegistry.size).toBe(0);
  });

  test("size reflects number of registered evaluators", () => {
    expect(kpiRegistry.size).toBe(0);
    kpiRegistry.register(new MockEvaluator("kpi-1"));
    expect(kpiRegistry.size).toBe(1);
    kpiRegistry.register(new MockEvaluator("kpi-2"));
    expect(kpiRegistry.size).toBe(2);
    kpiRegistry.unregister("kpi-1");
    expect(kpiRegistry.size).toBe(1);
  });
});
