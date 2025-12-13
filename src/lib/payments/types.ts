/* Copyright (c) Santa Barbara Newcomers Club. All rights reserved. */

export type PaymentProviderId = string;

export type CurrencyCode = string;

export type PaymentIntentStatus =
  | "requires_action"
  | "requires_payment_method"
  | "processing"
  | "succeeded"
  | "canceled"
  | "failed";

export type RefundStatus = "pending" | "succeeded" | "failed" | "canceled";

export type PaymentMethodType =
  | "card"
  | "bank_transfer"
  | "ach"
  | "cash"
  | "check"
  | "other";

export type PaymentErrorCode =
  | "unauthorized"
  | "forbidden"
  | "invalid_request"
  | "not_found"
  | "conflict"
  | "provider_error"
  | "declined"
  | "requires_action"
  | "rate_limited";

export type PaymentError = {
  code: PaymentErrorCode;
  message: string;
  provider_id?: PaymentProviderId;
  provider_code?: string;
  retriable?: boolean;
};

export type ResultOk<T> = { ok: true; value: T };
export type ResultErr = { ok: false; error: PaymentError };
export type Result<T> = ResultOk<T> | ResultErr;

export type Money = {
  amount_minor: number;
  currency: CurrencyCode;
};

export type CreatePaymentIntentRequest = {
  provider_id: PaymentProviderId;

  amount: Money;

  idempotency_key: string;

  description?: string;

  metadata?: Record<string, string>;

  customer_ref?: {
    clubos_member_id?: string;
    email?: string;
    name?: string;
  };

  return_url?: string;

  allowed_payment_method_types?: PaymentMethodType[];
};

export type CreatePaymentIntentResponse = {
  provider_id: PaymentProviderId;

  intent_id: string;

  status: PaymentIntentStatus;

  amount: Money;

  created_at_iso: string;

  client_secret?: string;

  next_action?: {
    type: "redirect" | "sdk" | "none";
    redirect_url?: string;
  };

  metadata?: Record<string, string>;
};

export type GetPaymentIntentResponse = CreatePaymentIntentResponse & {
  updated_at_iso?: string;
  failure_reason?: string;
};

export type CapturePaymentIntentRequest = {
  provider_id: PaymentProviderId;
  intent_id: string;
  idempotency_key: string;
};

export type CancelPaymentIntentRequest = {
  provider_id: PaymentProviderId;
  intent_id: string;
  idempotency_key: string;
  reason?: string;
};

export type RefundPaymentRequest = {
  provider_id: PaymentProviderId;
  intent_id: string;
  idempotency_key: string;

  amount?: Money;

  reason?: string;
  metadata?: Record<string, string>;
};

export type RefundPaymentResponse = {
  provider_id: PaymentProviderId;
  refund_id: string;
  intent_id: string;
  status: RefundStatus;
  amount: Money;
  created_at_iso: string;
};

export type VerifyWebhookRequest = {
  provider_id: PaymentProviderId;

  headers: Record<string, string | string[] | undefined>;
  raw_body: string;

  webhook_secret_ref?: string;
};

export type WebhookEvent = {
  provider_id: PaymentProviderId;

  event_id: string;
  type: string;
  created_at_iso: string;

  data: {
    intent_id?: string;
    refund_id?: string;
    status?: PaymentIntentStatus | RefundStatus;
    amount?: Money;
    metadata?: Record<string, string>;
  };

  raw?: unknown;
};

export interface PaymentProvider {
  id: PaymentProviderId;

  createPaymentIntent(
    req: CreatePaymentIntentRequest
  ): Promise<Result<CreatePaymentIntentResponse>>;

  getPaymentIntent(
    provider_id: PaymentProviderId,
    intent_id: string
  ): Promise<Result<GetPaymentIntentResponse>>;

  capturePaymentIntent(
    req: CapturePaymentIntentRequest
  ): Promise<Result<GetPaymentIntentResponse>>;

  cancelPaymentIntent(
    req: CancelPaymentIntentRequest
  ): Promise<Result<GetPaymentIntentResponse>>;

  refundPayment(req: RefundPaymentRequest): Promise<Result<RefundPaymentResponse>>;

  verifyWebhook(req: VerifyWebhookRequest): Promise<Result<WebhookEvent>>;
}
