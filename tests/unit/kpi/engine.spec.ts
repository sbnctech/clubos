/**
 * KPI Engine Unit Tests
 */

import { test, expect } from "@playwright/test";
import { kpiRegistry } from "../../../src/server/kpi/registry";
import {
  KPIEngine,
  DefaultConfigLoader,
  createKPIEngine,
} from "../../../src/server/kpi/engine";
import {
  KPIConfig,
  KPIContext,
  KPIEvaluator,
  KPIResult,
  KPIConfigLoader,
} from "../../../src/server/kpi/types";

class MockEvaluator implements KPIEvaluator {
  constructor(
    public readonly id: string,
    private status: "OK" | "WARNING" | "CRITICAL" | "UNKNOWN" = "OK"
  ) {}

  async evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult> {
    return {
      kpiId: this.id,
      name: config.name,
      status: this.status,
      message: `Mock ${this.status}`,
      evaluatedAt: context.evaluationTime,
    };
  }
}

class ThrowingEvaluator implements KPIEvaluator {
  constructor(public readonly id: string) {}

  async evaluate(): Promise<KPIResult> {
    throw new Error("Deliberate test error");
  }
}

class SlowEvaluator implements KPIEvaluator {
  constructor(public readonly id: string, private delayMs: number) {}

  async evaluate(config: KPIConfig, context: KPIContext): Promise<KPIResult> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    return {
      kpiId: this.id,
      name: config.name,
      status: "OK",
      message: "Slow but OK",
      evaluatedAt: context.evaluationTime,
    };
  }
}

const testConfigs: KPIConfig[] = [
  { id: "test-ok", name: "Test OK", description: "Test", enabled: true, category: "test" },
  { id: "test-warning", name: "Test Warning", description: "Test", enabled: true, category: "test" },
  { id: "test-critical", name: "Test Critical", description: "Test", enabled: true, category: "test" },
];

test.describe("DefaultConfigLoader", () => {
  test("loadConfigs returns enabled configs", async () => {
    const loader = new DefaultConfigLoader(testConfigs);
    const configs = await loader.loadConfigs();
    expect(configs).toHaveLength(3);
  });

  test("loadConfigs filters out disabled configs", async () => {
    const configs: KPIConfig[] = [
      { ...testConfigs[0], enabled: true },
      { ...testConfigs[1], enabled: false },
    ];
    const loader = new DefaultConfigLoader(configs);
    const result = await loader.loadConfigs();
    expect(result).toHaveLength(1);
  });

  test("loadConfig returns specific config", async () => {
    const loader = new DefaultConfigLoader(testConfigs);
    const config = await loader.loadConfig("test-warning");
    expect(config?.id).toBe("test-warning");
  });

  test("loadConfig returns undefined for nonexistent ID", async () => {
    const loader = new DefaultConfigLoader(testConfigs);
    const config = await loader.loadConfig("nonexistent");
    expect(config).toBeUndefined();
  });
});

test.describe("KPIEngine", () => {
  test.beforeEach(() => {
    kpiRegistry.clear();
  });

  test("runAll returns summary with all results", async () => {
    kpiRegistry.register(new MockEvaluator("test-ok", "OK"));
    kpiRegistry.register(new MockEvaluator("test-warning", "WARNING"));
    kpiRegistry.register(new MockEvaluator("test-critical", "CRITICAL"));

    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(testConfigs),
    });

    const summary = await engine.runAll();
    expect(summary.total).toBe(3);
    expect(summary.byStatus.OK).toBe(1);
    expect(summary.byStatus.WARNING).toBe(1);
    expect(summary.byStatus.CRITICAL).toBe(1);
  });

  test("runAll returns CRITICAL as overall status when any KPI is critical", async () => {
    kpiRegistry.register(new MockEvaluator("test-ok", "OK"));
    kpiRegistry.register(new MockEvaluator("test-warning", "WARNING"));
    kpiRegistry.register(new MockEvaluator("test-critical", "CRITICAL"));

    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(testConfigs),
    });

    const summary = await engine.runAll();
    expect(summary.overallStatus).toBe("CRITICAL");
  });

  test("runAll returns WARNING as overall status when worst is WARNING", async () => {
    kpiRegistry.register(new MockEvaluator("test-ok", "OK"));
    kpiRegistry.register(new MockEvaluator("test-warning", "WARNING"));

    const configs = testConfigs.filter((c) => c.id !== "test-critical");
    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(configs),
    });

    const summary = await engine.runAll();
    expect(summary.overallStatus).toBe("WARNING");
  });

  test("runAll returns UNKNOWN for missing evaluator", async () => {
    const configs = testConfigs.filter((c) => c.id === "test-ok");
    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(configs),
    });

    const summary = await engine.runAll();
    expect(summary.results[0].status).toBe("UNKNOWN");
    expect(summary.results[0].message).toContain("No evaluator registered");
  });

  test("runAll handles throwing evaluator gracefully", async () => {
    kpiRegistry.register(new ThrowingEvaluator("test-ok"));

    const configs = testConfigs.filter((c) => c.id === "test-ok");
    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(configs),
    });

    const summary = await engine.runAll();
    expect(summary.results[0].status).toBe("UNKNOWN");
    expect(summary.results[0].message).toContain("Deliberate test error");
  });

  test("runAll handles timeout", async () => {
    kpiRegistry.register(new SlowEvaluator("test-ok", 200));

    const configs = testConfigs.filter((c) => c.id === "test-ok");
    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(configs),
      timeoutMs: 50,
    });

    const summary = await engine.runAll();
    expect(summary.results[0].status).toBe("UNKNOWN");
    expect(summary.results[0].message).toContain("timeout");
  });

  test("runOne returns result for specific KPI", async () => {
    kpiRegistry.register(new MockEvaluator("test-ok", "OK"));

    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader(testConfigs),
    });

    const result = await engine.runOne("test-ok");
    expect(result.kpiId).toBe("test-ok");
    expect(result.status).toBe("OK");
  });

  test("runOne returns UNKNOWN for missing config", async () => {
    const engine = new KPIEngine({
      configLoader: new DefaultConfigLoader([]),
    });

    const result = await engine.runOne("nonexistent");
    expect(result.status).toBe("UNKNOWN");
    expect(result.message).toContain("not found");
  });
});

test.describe("createKPIEngine", () => {
  test("creates engine with default options", () => {
    const engine = createKPIEngine();
    expect(engine).toBeInstanceOf(KPIEngine);
  });

  test("creates engine with custom options", () => {
    const customLoader: KPIConfigLoader = {
      loadConfigs: async () => [],
      loadConfig: async () => undefined,
    };

    const engine = createKPIEngine({
      configLoader: customLoader,
      parallel: false,
      timeoutMs: 60000,
    });
    expect(engine).toBeInstanceOf(KPIEngine);
  });
});
