/**
 * Unit tests for Two-Factor Authentication (2FA) system.
 *
 * Tests cover:
 * - TOTP generation and verification
 * - Backup code generation and verification
 * - Enforcement rules (which roles/capabilities require 2FA)
 * - Session expiration logic
 *
 * Charter Principles:
 * - P1: Identity provable - 2FA adds second factor
 * - P2: Default deny - privileged access requires 2FA
 * - P9: Security fail closed - invalid codes rejected
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  generateBackupCodes,
  verifyBackupCode,
} from "@/lib/auth/2fa/totp";
import {
  roleRequires2FA,
  capabilityRequires2FA,
  check2FAEnforcement,
  getRequiring2FACapabilities,
  TWO_FACTOR_SESSION_DURATION_MS,
} from "@/lib/auth/2fa/enforcement";

describe("2FA TOTP Module", () => {
  describe("generateTotpSecret", () => {
    it("should generate a base32-encoded secret", () => {
      const secret = generateTotpSecret();
      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
      // Base32 characters only
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it("should generate unique secrets each time", () => {
      const secret1 = generateTotpSecret();
      const secret2 = generateTotpSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe("generateTotpUri", () => {
    it("should generate a valid otpauth URI", () => {
      const secret = generateTotpSecret();
      const uri = generateTotpUri(secret, "test@example.com");

      expect(uri).toContain("otpauth://totp/");
      expect(uri).toContain("test%40example.com");
      expect(uri).toContain(`secret=${secret}`);
      expect(uri).toContain("ClubOS");
    });
  });

  describe("verifyTotpCode", () => {
    it("should reject obviously invalid codes", () => {
      const secret = generateTotpSecret();
      // Codes must be 6 digits
      expect(verifyTotpCode(secret, "12345")).toBe(false); // too short
      expect(verifyTotpCode(secret, "1234567")).toBe(false); // too long
      expect(verifyTotpCode(secret, "abcdef")).toBe(false); // not digits
    });

    // Note: Testing actual TOTP verification requires time-synced codes
    // which is hard to test in unit tests without mocking the library
  });

  describe("generateBackupCodes", () => {
    it("should generate 10 backup codes", () => {
      const { plainCodes, hashedCodes } = generateBackupCodes();

      expect(plainCodes).toHaveLength(10);
      expect(hashedCodes).toHaveLength(10);
    });

    it("should generate 8-character uppercase hex codes", () => {
      const { plainCodes } = generateBackupCodes();

      for (const code of plainCodes) {
        expect(code).toHaveLength(8);
        // Uppercase hex characters
        expect(code).toMatch(/^[A-F0-9]+$/);
      }
    });

    it("should hash codes with SHA-256", () => {
      const { plainCodes, hashedCodes } = generateBackupCodes();

      // Hashed codes should be 64-character hex strings (SHA-256)
      for (const hash of hashedCodes) {
        expect(hash).toHaveLength(64);
        expect(hash).toMatch(/^[a-f0-9]+$/);
      }

      // Plain codes should not appear in hashed codes
      for (const code of plainCodes) {
        for (const hash of hashedCodes) {
          expect(hash).not.toBe(code);
        }
      }
    });
  });

  describe("verifyBackupCode", () => {
    it("should verify a valid backup code", () => {
      const { plainCodes, hashedCodes } = generateBackupCodes();

      const index = verifyBackupCode(plainCodes[0], hashedCodes);
      expect(index).toBe(0);
    });

    it("should return -1 for invalid backup code", () => {
      const { hashedCodes } = generateBackupCodes();

      const index = verifyBackupCode("invalid1", hashedCodes);
      expect(index).toBe(-1);
    });

    it("should find correct index for any valid code", () => {
      const { plainCodes, hashedCodes } = generateBackupCodes();

      // Test multiple codes
      for (let i = 0; i < 3; i++) {
        const index = verifyBackupCode(plainCodes[i], hashedCodes);
        expect(index).toBe(i);
      }
    });
  });
});

describe("2FA Enforcement Rules", () => {
  describe("roleRequires2FA", () => {
    it("should require 2FA for admin role", () => {
      expect(roleRequires2FA("admin")).toBe(true);
    });

    it("should require 2FA for president role", () => {
      expect(roleRequires2FA("president")).toBe(true);
    });

    it("should require 2FA for vp-activities role", () => {
      expect(roleRequires2FA("vp-activities")).toBe(true);
    });

    it("should NOT require 2FA for webmaster role", () => {
      // webmaster only has publishing:manage and comms:manage, not sensitive caps
      expect(roleRequires2FA("webmaster")).toBe(false);
    });

    it("should NOT require 2FA for regular member role", () => {
      expect(roleRequires2FA("member")).toBe(false);
    });

    it("should require 2FA for event-chair role", () => {
      // event-chair has members:view which requires 2FA
      expect(roleRequires2FA("event-chair")).toBe(true);
    });
  });

  describe("capabilityRequires2FA", () => {
    it("should require 2FA for admin:full", () => {
      expect(capabilityRequires2FA("admin:full")).toBe(true);
    });

    it("should require 2FA for members:view (PII access)", () => {
      expect(capabilityRequires2FA("members:view")).toBe(true);
    });

    it("should require 2FA for finance:view", () => {
      expect(capabilityRequires2FA("finance:view")).toBe(true);
    });

    it("should require 2FA for exports:access", () => {
      expect(capabilityRequires2FA("exports:access")).toBe(true);
    });

    it("should require 2FA for users:manage", () => {
      expect(capabilityRequires2FA("users:manage")).toBe(true);
    });

    it("should require 2FA for comms:send", () => {
      expect(capabilityRequires2FA("comms:send")).toBe(true);
    });

    it("should NOT require 2FA for events:view", () => {
      expect(capabilityRequires2FA("events:view")).toBe(false);
    });

    it("should NOT require 2FA for publishing:manage", () => {
      expect(capabilityRequires2FA("publishing:manage")).toBe(false);
    });
  });

  describe("getRequiring2FACapabilities", () => {
    it("should return all 2FA capabilities for admin", () => {
      const caps = getRequiring2FACapabilities("admin");
      expect(caps).toContain("admin:full");
      expect(caps).toContain("members:view");
      expect(caps).toContain("finance:view");
    });

    it("should return empty array for member role", () => {
      const caps = getRequiring2FACapabilities("member");
      expect(caps).toHaveLength(0);
    });
  });

  describe("check2FAEnforcement", () => {
    const now = new Date();
    const recentVerification = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    const expiredVerification = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10 hours ago

    describe("for roles that require 2FA", () => {
      it("should require enrollment when 2FA not enabled", () => {
        const result = check2FAEnforcement("admin", false, null);

        expect(result.required).toBe(true);
        expect(result.enrolled).toBe(false);
        expect(result.action).toBe("enroll");
      });

      it("should require verification when 2FA enabled but never verified", () => {
        const result = check2FAEnforcement("admin", true, null);

        expect(result.required).toBe(true);
        expect(result.enrolled).toBe(true);
        expect(result.verified).toBe(false);
        expect(result.action).toBe("verify");
      });

      it("should require verification when 2FA session expired", () => {
        const result = check2FAEnforcement("admin", true, expiredVerification);

        expect(result.required).toBe(true);
        expect(result.enrolled).toBe(true);
        expect(result.verified).toBe(false);
        expect(result.action).toBe("verify");
        expect(result.reason).toContain("expired");
      });

      it("should allow access when 2FA recently verified", () => {
        const result = check2FAEnforcement("admin", true, recentVerification);

        expect(result.required).toBe(true);
        expect(result.enrolled).toBe(true);
        expect(result.verified).toBe(true);
        expect(result.action).toBe("none");
      });
    });

    describe("for roles that don't require 2FA", () => {
      it("should not require 2FA for member role", () => {
        const result = check2FAEnforcement("member", false, null);

        expect(result.required).toBe(false);
      });

      it("should allow member with 2FA to access (2FA optional)", () => {
        const result = check2FAEnforcement("member", true, recentVerification);

        expect(result.required).toBe(false);
      });
    });
  });

  describe("TWO_FACTOR_SESSION_DURATION_MS", () => {
    it("should be 8 hours in milliseconds", () => {
      const expectedMs = 8 * 60 * 60 * 1000;
      expect(TWO_FACTOR_SESSION_DURATION_MS).toBe(expectedMs);
    });
  });
});
