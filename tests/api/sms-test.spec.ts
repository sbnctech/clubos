import { test, expect } from "@playwright/test";

test("sms test endpoint sends a mock sms", async ({ request }) => {
  const base = process.env.PW_BASE_URL ?? "http://localhost:3000";

  const response = await request.post(`${base}/api/sms/test`, {
    data: {
      to: "recipient@example.com",
      body: "Hello from test",
    },
  });

  console.log("SMS TEST STATUS:", response.status());
  const text = await response.text();
  console.log("SMS TEST BODY:", text);

  expect(response.ok()).toBeTruthy();

  const data = JSON.parse(text);
  expect(data.ok).toBe(true);
  expect(typeof data.messageId).toBe("string");
});
