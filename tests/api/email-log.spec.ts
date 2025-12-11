import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PW_BASE_URL ?? "http://localhost:3000";

test("email log endpoint stores and lists an email", async ({ request }) => {
  const response = await request.post(`${BASE_URL}/api/email/log`, {
    data: {
      subject: "Email log test",
      body: "This is a log test message.",
    },
  });

  const status = response.status();
  const text = await response.text();

  console.log("EMAIL LOG STATUS:", status);
  console.log("EMAIL LOG BODY:", text);

  expect(status).toBe(200);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON for POST:", err);
    throw err;
  }

  expect(data.ok).toBe(true);
  expect(typeof data.id).toBe("string");

  const listResponse = await request.get(`${BASE_URL}/api/email/log`);
  const listStatus = listResponse.status();
  const listText = await listResponse.text();

  console.log("EMAIL LOG LIST STATUS:", listStatus);
  console.log("EMAIL LOG LIST BODY:", listText);

  expect(listStatus).toBe(200);

  let listData: any;
  try {
    listData = JSON.parse(listText);
  } catch (err) {
    console.error("Failed to parse JSON for list:", err);
    throw err;
  }

  expect(Array.isArray(listData.emails)).toBe(true);
  const found = listData.emails.some((e: any) => e.id === data.id);
  expect(found).toBe(true);
});
