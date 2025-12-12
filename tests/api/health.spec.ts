import { test, expect } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe("ok");
  expect(typeof data.timestamp).toBe("string");
});

test("health endpoint includes database status", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.database).toBeDefined();
  expect(data.database.status).toBe("ok");
});
