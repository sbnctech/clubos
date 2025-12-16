/**
 * Audit Enforcement Tests
 *
 * Charter Principles:
 * - P7: Observability is a product feature
 * - P9: Security must fail closed
 * - N5: Never let automation mutate data without audit logs
 *
 * These tests verify:
 * 1. auditMutationRequired creates audit entry on success
 * 2. auditMutationRequired throws AuditEnforcementError on database failure
 * 3. createAuditEntryRequired fail-closed behavior
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  auditMutationRequired,
  createAuditEntryRequired,
  AuditEnforcementError,
} from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { AuthContext, GlobalRole } from "@/lib/auth";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// Mock console methods to suppress output during tests
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("Audit Enforcement (Charter P9)", () => {
  const mockAuthContext: AuthContext = {
    memberId: "test-member-id",
    email: "test@example.com",
    globalRole: "admin" as GlobalRole,
  };

  const mockRequest = new NextRequest("http://localhost:3000/api/test", {
    method: "POST",
    headers: {
      "x-forwarded-for": "192.168.1.1",
      "user-agent": "TestAgent/1.0",
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAuditEntryRequired", () => {
    it("creates audit entry successfully", async () => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-id",
        action: "CREATE",
        resourceType: "TestResource",
        resourceId: "resource-123",
        memberId: "test-member-id",
        before: null,
        after: null,
        metadata: { requestId: "req_123" },
        ipAddress: "192.168.1.1",
        userAgent: "TestAgent/1.0",
        createdAt: new Date(),
      });

      await expect(
        createAuditEntryRequired({
          action: "CREATE",
          resourceType: "TestResource",
          resourceId: "resource-123",
          actor: mockAuthContext,
          req: mockRequest,
        })
      ).resolves.toBeUndefined();

      expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "CREATE",
          resourceType: "TestResource",
          resourceId: "resource-123",
          memberId: "test-member-id",
        }),
      });
    });

    it("throws AuditEnforcementError on database failure (Charter P9)", async () => {
      const dbError = new Error("Database connection failed");
      vi.mocked(prisma.auditLog.create).mockRejectedValue(dbError);

      await expect(
        createAuditEntryRequired({
          action: "CREATE",
          resourceType: "TestResource",
          resourceId: "resource-123",
          actor: mockAuthContext,
          req: mockRequest,
        })
      ).rejects.toThrow(AuditEnforcementError);

      await expect(
        createAuditEntryRequired({
          action: "CREATE",
          resourceType: "TestResource",
          resourceId: "resource-123",
          actor: mockAuthContext,
          req: mockRequest,
        })
      ).rejects.toThrow("Failed to create audit entry for CREATE TestResource/resource-123");
    });

    it("includes cause in AuditEnforcementError", async () => {
      const dbError = new Error("Database connection failed");
      vi.mocked(prisma.auditLog.create).mockRejectedValue(dbError);

      try {
        await createAuditEntryRequired({
          action: "DELETE",
          resourceType: "User",
          resourceId: "user-456",
          actor: mockAuthContext,
          req: mockRequest,
        });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(AuditEnforcementError);
        expect((error as AuditEnforcementError).cause).toBe(dbError);
      }
    });
  });

  describe("auditMutationRequired", () => {
    it("creates audit entry with capability metadata", async () => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-id",
        action: "UPDATE",
        resourceType: "TransitionPlan",
        resourceId: "plan-123",
        memberId: "test-member-id",
        before: null,
        after: null,
        metadata: {
          requestId: "req_123",
          capability: "users:manage",
          actorRole: "ADMIN",
        },
        ipAddress: "192.168.1.1",
        userAgent: "TestAgent/1.0",
        createdAt: new Date(),
      });

      await auditMutationRequired(mockRequest, mockAuthContext, {
        action: "UPDATE",
        capability: "users:manage",
        objectType: "TransitionPlan",
        objectId: "plan-123",
        metadata: { operation: "detect-outgoing" },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "UPDATE",
          resourceType: "TransitionPlan",
          resourceId: "plan-123",
          metadata: expect.objectContaining({
            capability: "users:manage",
            actorRole: "admin",
            operation: "detect-outgoing",
          }),
        }),
      });
    });

    it("throws AuditEnforcementError when audit logging fails (Charter P9)", async () => {
      vi.mocked(prisma.auditLog.create).mockRejectedValue(
        new Error("Write failed")
      );

      await expect(
        auditMutationRequired(mockRequest, mockAuthContext, {
          action: "CREATE",
          capability: "users:manage",
          objectType: "ServiceRecord",
          objectId: "svc-789",
        })
      ).rejects.toThrow(AuditEnforcementError);
    });

    it("handles e2e-admin memberId correctly", async () => {
      const e2eAuthContext: AuthContext = {
        memberId: "e2e-admin",
        email: "e2e@test.local",
        globalRole: "admin" as GlobalRole,
      };

      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-id",
        action: "CREATE",
        resourceType: "Test",
        resourceId: "test-1",
        memberId: null, // e2e-admin should result in null
        before: null,
        after: null,
        metadata: {},
        ipAddress: null,
        userAgent: null,
        createdAt: new Date(),
      });

      await auditMutationRequired(mockRequest, e2eAuthContext, {
        action: "CREATE",
        capability: "users:manage",
        objectType: "Test",
        objectId: "test-1",
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: null,
        }),
      });
    });
  });

  describe("AuditEnforcementError", () => {
    it("has correct name property", () => {
      const error = new AuditEnforcementError("Test error");
      expect(error.name).toBe("AuditEnforcementError");
    });

    it("instanceof checks work correctly", () => {
      const error = new AuditEnforcementError("Test error");
      expect(error instanceof AuditEnforcementError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it("preserves cause for debugging", () => {
      const cause = new Error("Original error");
      const error = new AuditEnforcementError("Wrapper error", cause);
      expect(error.cause).toBe(cause);
    });
  });
});

describe("Fail-Closed Pattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mutation cannot succeed without audit (principle verification)", async () => {
    // This test verifies the principle: if audit fails, operation should fail
    // In practice, the endpoint should catch AuditEnforcementError and return 500

    vi.mocked(prisma.auditLog.create).mockRejectedValue(
      new Error("Audit unavailable")
    );

    const mockAuth: AuthContext = {
      memberId: "member-1",
      email: "member@example.com",
      globalRole: "admin" as GlobalRole,
    };

    const mockReq = new NextRequest("http://localhost/api/test");

    // Simulate what an endpoint would do
    let operationSucceeded = false;

    try {
      // This represents the audit call that happens AFTER mutation
      // If audit fails, the operation should be considered failed
      await auditMutationRequired(mockReq, mockAuth, {
        action: "CREATE",
        capability: "users:manage",
        objectType: "CriticalResource",
        objectId: "res-1",
      });
      operationSucceeded = true;
    } catch (error) {
      if (error instanceof AuditEnforcementError) {
        operationSucceeded = false;
      }
    }

    // The operation should NOT have succeeded
    expect(operationSucceeded).toBe(false);
  });
});
