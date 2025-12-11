export type MockEmailRequest = {
  to: string;
  subject?: string;
  body?: string;
};

export type MockEmailResult = {
  messageId: string;
};

/**
 * Simple mock email sender used in dev/test.
 * It just logs to the console and returns a fake provider message id.
 */
let counter = 0;

export async function mockEmailSend(
  input: MockEmailRequest
): Promise<MockEmailResult> {
  const messageId = `mock-email-${Date.now()}-${counter++}`;
  console.log("[mock-email] sent", { ...input, messageId });
  return { messageId };
}
