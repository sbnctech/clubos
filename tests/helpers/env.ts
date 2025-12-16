/**
 * Test Environment Helpers
 *
 * Provides utilities for safely stubbing environment variables in tests.
 * Uses Vitest's vi.stubEnv() to avoid TypeScript errors from direct assignment.
 *
 * Usage:
 *   import { stubProductionEnv, unstubAllEnvs } from "@/tests/helpers/env";
 *
 *   describe("Production Safety", () => {
 *     afterEach(() => {
 *       unstubAllEnvs();
 *     });
 *
 *     it("should behave differently in production", () => {
 *       stubProductionEnv();
 *       // test code...
 *     });
 *   });
 */

import { vi } from "vitest";

/**
 * Stub NODE_ENV to "production" for testing production-only behavior.
 * Must call unstubAllEnvs() in afterEach to prevent test leakage.
 */
export function stubProductionEnv(): void {
  vi.stubEnv("NODE_ENV", "production");
}

/**
 * Stub NODE_ENV to "development" for testing dev-only behavior.
 * Must call unstubAllEnvs() in afterEach to prevent test leakage.
 */
export function stubDevelopmentEnv(): void {
  vi.stubEnv("NODE_ENV", "development");
}

/**
 * Stub NODE_ENV to "test" for testing test-specific behavior.
 * Must call unstubAllEnvs() in afterEach to prevent test leakage.
 */
export function stubTestEnv(): void {
  vi.stubEnv("NODE_ENV", "test");
}

/**
 * Stub any environment variable.
 * Must call unstubAllEnvs() in afterEach to prevent test leakage.
 */
export function stubEnv(key: string, value: string): void {
  vi.stubEnv(key, value);
}

/**
 * Remove all environment stubs. Call this in afterEach to ensure
 * clean state between tests.
 */
export function unstubAllEnvs(): void {
  vi.unstubAllEnvs();
}
