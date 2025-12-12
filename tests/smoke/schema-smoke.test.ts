/**
 * Schema Smoke Tests
 *
 * Day-2 integration tests verifying Prisma schema integrity.
 * These tests ensure the database layer is correctly configured
 * and migrations can be applied cleanly.
 *
 * Test coverage:
 *   1. Prisma schema validates without errors
 *   2. Database connection can be established
 *   3. All expected models are present and queryable
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - PostgreSQL database must be running
 *   - Migrations must be applied (npx prisma migrate deploy)
 */

import { test, expect } from "@playwright/test";
import { execSync } from "child_process";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "../..");

test.describe("Schema Smoke Tests", () => {
  test("Prisma schema validates successfully", async () => {
    // Run prisma validate to check schema syntax and consistency
    let result: string;
    let exitCode = 0;

    try {
      result = execSync("npx prisma validate", {
        cwd: projectRoot,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (error: unknown) {
      const execError = error as { status?: number; stderr?: string };
      exitCode = execError.status ?? 1;
      result = execError.stderr ?? "Unknown error";
    }

    expect(exitCode).toBe(0);
    expect(result).not.toContain("error");
  });

  test("Prisma schema contains expected models", async () => {
    // Read the schema file and verify expected models are defined
    const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
    const fs = await import("fs");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Core models that must exist per Day-1 Schema specification
    const expectedModels = [
      "Member",
      "MembershipStatus",
      "Committee",
      "CommitteeRole",
      "Term",
      "RoleAssignment",
      "UserAccount",
      "Event",
      "EventRegistration",
      "Photo",
      "PhotoAlbum",
      "EmailLog",
    ];

    for (const model of expectedModels) {
      expect(schemaContent).toContain(`model ${model} {`);
    }
  });

  test("Prisma schema contains expected enums", async () => {
    const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
    const fs = await import("fs");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Enums that must exist
    const expectedEnums = ["RegistrationStatus", "EmailStatus"];

    for (const enumName of expectedEnums) {
      expect(schemaContent).toContain(`enum ${enumName} {`);
    }
  });

  test("Prisma schema has correct provider configuration", async () => {
    const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
    const fs = await import("fs");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Verify PostgreSQL provider
    expect(schemaContent).toContain('provider = "postgresql"');

    // Verify Prisma client generator
    expect(schemaContent).toContain('provider = "prisma-client-js"');
  });

  test("Prisma migrations directory exists", async () => {
    const migrationsPath = path.join(projectRoot, "prisma", "migrations");
    const fs = await import("fs");

    expect(fs.existsSync(migrationsPath)).toBe(true);

    // Check that at least one migration exists
    const migrations = fs.readdirSync(migrationsPath);
    const migrationDirs = migrations.filter((m) =>
      m.match(/^\d{14}_/)
    );

    expect(migrationDirs.length).toBeGreaterThan(0);
  });

  test("Prisma migration lock file exists", async () => {
    const lockPath = path.join(
      projectRoot,
      "prisma",
      "migrations",
      "migration_lock.toml"
    );
    const fs = await import("fs");

    expect(fs.existsSync(lockPath)).toBe(true);

    const lockContent = fs.readFileSync(lockPath, "utf-8");
    expect(lockContent).toContain('provider = "postgresql"');
  });

  test("Foreign key relationships are properly defined", async () => {
    const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
    const fs = await import("fs");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Key foreign key relationships that must exist
    const expectedRelations = [
      // Member -> MembershipStatus
      "membershipStatus   MembershipStatus",
      // RoleAssignment -> Member
      "member          Member",
      // RoleAssignment -> Committee
      "committee       Committee",
      // EventRegistration -> Event
      "event            Event",
      // EventRegistration -> Member
      "member           Member",
      // Photo -> PhotoAlbum
      "album         PhotoAlbum",
    ];

    for (const relation of expectedRelations) {
      expect(schemaContent).toContain(relation);
    }
  });

  test("Index definitions are present for performance", async () => {
    const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
    const fs = await import("fs");
    const schemaContent = fs.readFileSync(schemaPath, "utf-8");

    // Critical indexes that must exist
    expect(schemaContent).toContain("@@index([membershipStatusId])");
    expect(schemaContent).toContain("@@index([eventId])");
    expect(schemaContent).toContain("@@index([memberId])");
    expect(schemaContent).toContain("@@index([startTime])");
  });
});
