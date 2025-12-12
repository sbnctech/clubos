import { test, expect } from "@playwright/test";

test("email test endpoint sends a mock email", async ({ request }) => {
  const response = await request.post("/api/email/test", {
    data: { to: "recipient@example.com" },
  });

  const status = response.status();
  const text = await response.text();

  console.log("EMAIL TEST STATUS:", status);
  console.log("EMAIL TEST BODY:", text);

  // Assert on status explicitly so we see it if it fails
  expect(status).toBe(200);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    throw err;
  }

  expect(data.ok).toBe(true);
  expect(data.to).toBe("recipient@example.com");
  expect(typeof data.messageId).toBe("string");
});
