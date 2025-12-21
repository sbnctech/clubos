/**
 * Unit tests for intake validation report formatting.
 * Copyright (c) Santa Barbara Newcomers Club. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  formatReport,
  EXIT_PASS,
  EXIT_FAIL,
  EXIT_WARN,
} from "../../../scripts/solutions/validate_intake_schema.mjs";

describe("formatReport", () => {
  const fixedTimestamp = "2025-01-15T12:00:00.000Z";
  const testFilePath = "/path/to/intake.json";

  describe("when all validations pass", () => {
    it("returns PASS with exit code 0", () => {
      const result = formatReport(testFilePath, [], [], fixedTimestamp);

      expect(result.exitCode).toBe(EXIT_PASS);
      expect(result.report).toContain("RESULT: PASS");
      expect(result.report).toContain("REQUIRED FIELDS: PASS");
      expect(result.report).toContain("RED-FLAG SCAN: CLEAR");
    });

    it("includes file path and timestamp in report header", () => {
      const result = formatReport(testFilePath, [], [], fixedTimestamp);

      expect(result.report).toContain(`File: ${testFilePath}`);
      expect(result.report).toContain(`Date: ${fixedTimestamp}`);
    });
  });

  describe("when required fields are missing", () => {
    it("returns FAIL with exit code 1", () => {
      const missingFields = ["org.name", "contacts.systemOwner.email"];
      const result = formatReport(
        testFilePath,
        missingFields,
        [],
        fixedTimestamp
      );

      expect(result.exitCode).toBe(EXIT_FAIL);
      expect(result.report).toContain("RESULT: FAIL");
      expect(result.report).toContain("REQUIRED FIELDS: FAIL");
    });

    it("lists each missing field", () => {
      const missingFields = ["org.name", "contacts.systemOwner.email"];
      const result = formatReport(
        testFilePath,
        missingFields,
        [],
        fixedTimestamp
      );

      expect(result.report).toContain("  - org.name: missing");
      expect(result.report).toContain("  - contacts.systemOwner.email: missing");
    });

    it("returns FAIL even if red flags are also present", () => {
      const missingFields = ["org.name"];
      const redFlags = [
        { id: "RF-001", severity: "CRITICAL", message: "Test critical flag" },
      ];
      const result = formatReport(
        testFilePath,
        missingFields,
        redFlags,
        fixedTimestamp
      );

      // FAIL takes precedence over WARN
      expect(result.exitCode).toBe(EXIT_FAIL);
      expect(result.report).toContain("RESULT: FAIL");
    });
  });

  describe("when red flags are detected", () => {
    it("returns WARN with exit code 2 for critical flags", () => {
      const redFlags = [
        { id: "RF-001", severity: "CRITICAL", message: "Critical issue found" },
      ];
      const result = formatReport(testFilePath, [], redFlags, fixedTimestamp);

      expect(result.exitCode).toBe(EXIT_WARN);
      expect(result.report).toContain("RESULT: WARN");
      expect(result.report).toContain("RED-FLAG SCAN: FLAGS DETECTED");
    });

    it("returns PASS for non-critical flags", () => {
      const redFlags = [
        { id: "RF-005", severity: "MEDIUM", message: "Medium issue found" },
      ];
      const result = formatReport(testFilePath, [], redFlags, fixedTimestamp);

      expect(result.exitCode).toBe(EXIT_PASS);
      expect(result.report).toContain("RESULT: PASS");
      expect(result.report).toContain("RED-FLAG SCAN: FLAGS DETECTED");
    });

    it("lists each red flag with id, severity, and message", () => {
      const redFlags = [
        { id: "RF-001", severity: "CRITICAL", message: "Critical issue" },
        { id: "RF-002", severity: "HIGH", message: "High priority issue" },
      ];
      const result = formatReport(testFilePath, [], redFlags, fixedTimestamp);

      expect(result.report).toContain(
        "  - RF-001 [CRITICAL]: Critical issue"
      );
      expect(result.report).toContain(
        "  - RF-002 [HIGH]: High priority issue"
      );
    });
  });

  describe("report format structure", () => {
    it("has consistent header format", () => {
      const result = formatReport(testFilePath, [], [], fixedTimestamp);
      const lines = result.report.split("\n");

      expect(lines[0]).toBe("INTAKE VALIDATION REPORT");
      expect(lines[1]).toBe("========================");
      expect(lines[2]).toMatch(/^File: /);
      expect(lines[3]).toMatch(/^Date: /);
    });

    it("ends with RESULT line", () => {
      const result = formatReport(testFilePath, [], [], fixedTimestamp);
      const lines = result.report.split("\n");
      const lastLine = lines[lines.length - 1];

      expect(lastLine).toMatch(/^RESULT: (PASS|WARN|FAIL)$/);
    });
  });
});

describe("exit codes", () => {
  it("exports correct exit code values", () => {
    expect(EXIT_PASS).toBe(0);
    expect(EXIT_FAIL).toBe(1);
    expect(EXIT_WARN).toBe(2);
  });
});
