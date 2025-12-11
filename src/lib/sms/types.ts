export type SmsDirection = "OUTBOUND" | "INBOUND";

export type SmsStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export type SmsMessage = {
  to: string;
  body: string;
  direction: SmsDirection;
};
