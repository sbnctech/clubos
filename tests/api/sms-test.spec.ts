import { test, expect } from "@playwright/test";

test("sms test endpoint returns ok and a providerMessageId", async ({ request }) => {
  const response = await request.get("http://localhost:3002/api/sms/test");

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.status).toBe("ok");
  expect(typeof data.providerMessageId).toBe("string");
});
