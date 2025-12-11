import { SmsMessage } from "./types";

export async function sendSmsMock(message: SmsMessage): Promise<{ providerMessageId: string }> {
  const providerMessageId = `mock_${Date.now()}`;

  // For now we just log; later this will become a Trellis/Twilio call.
  console.log("[sms:mock] sending SMS", {
    to: message.to,
    body: message.body,
    direction: message.direction,
    providerMessageId,
  });

  // Tiny delay to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 10));

  return { providerMessageId };
}
