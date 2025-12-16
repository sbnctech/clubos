import { describe, it, expect, vi, beforeEach } from "vitest";
import { canAccessVisibility, authorizeFileAccess, authorizeFileDelete, authorizeFileUpload } from "@/lib/fileAuthorization";
import { AuthContext } from "@/lib/auth";
import { FileVisibility, FileObjectType } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: { file: { findUnique: vi.fn() }, eventRegistration: { findFirst: vi.fn() }, fileAccessLog: { create: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";

describe("File Authorization - Deny Path Tests", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("canAccessVisibility", () => {
    it("allows members to access PUBLIC files", () => { expect(canAccessVisibility("member", "PUBLIC")).toBe(true); });
    it("allows members to access MEMBER files", () => { expect(canAccessVisibility("member", "MEMBER")).toBe(true); });
    it("denies members access to OFFICER files", () => { expect(canAccessVisibility("member", "OFFICER")).toBe(false); });
    it("denies members access to BOARD files", () => { expect(canAccessVisibility("member", "BOARD")).toBe(false); });
    it("allows officers to access OFFICER files", () => { expect(canAccessVisibility("event-chair", "OFFICER")).toBe(true); });
    it("denies officers access to BOARD files", () => { expect(canAccessVisibility("event-chair", "BOARD")).toBe(false); });
    it("allows president to access BOARD files", () => { expect(canAccessVisibility("president", "BOARD")).toBe(true); });
  });

  describe("authorizeFileAccess", () => {
    const mockFile = { id: "f123", visibility: "MEMBER" as FileVisibility, objectType: "EVENT" as FileObjectType, objectId: "e123", deletedAt: null };

    it("returns 401 for unauthenticated requests to non-public files", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(mockFile);
      const result = await authorizeFileAccess(null, "f123");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(401); }
    });

    it("returns 403 for deleted files", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue({ ...mockFile, deletedAt: new Date() });
      const ctx: AuthContext = { memberId: "m123", email: "t@e.com", globalRole: "admin" };
      const result = await authorizeFileAccess(ctx, "f123");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("returns 403 for non-existent files", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(null);
      const ctx: AuthContext = { memberId: "m123", email: "t@e.com", globalRole: "admin" };
      const result = await authorizeFileAccess(ctx, "none");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("returns 403 when member tries to access OFFICER file", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue({ ...mockFile, visibility: "OFFICER" });
      const ctx: AuthContext = { memberId: "m123", email: "m@e.com", globalRole: "member" };
      const result = await authorizeFileAccess(ctx, "f123");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("allows anonymous access to PUBLIC files", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue({ ...mockFile, visibility: "PUBLIC" });
      const result = await authorizeFileAccess(null, "f123");
      expect(result.authorized).toBe(true);
    });
  });

  describe("authorizeFileDelete", () => {
    const mockFile = { id: "f123", uploadedById: "u123", visibility: "MEMBER" as FileVisibility, deletedAt: null };

    it("returns 403 for non-existent files", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(null);
      const ctx: AuthContext = { memberId: "m123", email: "t@e.com", globalRole: "admin" };
      const result = await authorizeFileDelete(ctx, "none");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("returns 403 when non-uploader non-admin tries to delete", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(mockFile);
      const ctx: AuthContext = { memberId: "other", email: "o@e.com", globalRole: "member" };
      const result = await authorizeFileDelete(ctx, "f123");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("allows uploader to delete their own file", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(mockFile);
      const ctx: AuthContext = { memberId: "u123", email: "u@e.com", globalRole: "member" };
      const result = await authorizeFileDelete(ctx, "f123");
      expect(result.authorized).toBe(true);
    });

    it("allows admin to delete any file", async () => {
      vi.mocked(prisma.file.findUnique).mockResolvedValue(mockFile);
      const ctx: AuthContext = { memberId: "a123", email: "a@e.com", globalRole: "admin" };
      const result = await authorizeFileDelete(ctx, "f123");
      expect(result.authorized).toBe(true);
    });
  });

  describe("authorizeFileUpload", () => {
    it("returns 403 when member tries to set BOARD visibility", async () => {
      const ctx: AuthContext = { memberId: "m123", email: "m@e.com", globalRole: "member" };
      const result = await authorizeFileUpload(ctx, "EVENT", "e123", "BOARD");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("returns 403 when member tries to upload to BOARD_RECORD", async () => {
      const ctx: AuthContext = { memberId: "m123", email: "m@e.com", globalRole: "member" };
      const result = await authorizeFileUpload(ctx, "BOARD_RECORD", "r123", "MEMBER");
      expect(result.authorized).toBe(false);
      if (!result.authorized) { expect(result.status).toBe(403); }
    });

    it("allows president to upload to BOARD_RECORD", async () => {
      const ctx: AuthContext = { memberId: "p123", email: "p@e.com", globalRole: "president" };
      const result = await authorizeFileUpload(ctx, "BOARD_RECORD", "r123", "BOARD");
      expect(result.authorized).toBe(true);
    });
  });
});
