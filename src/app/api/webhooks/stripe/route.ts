/**
 * Stripe Webhooks API
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

// Stripe event types we handle
type StripeEventType =
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.paid"
  | "invoice.payment_failed";

interface StripeEvent {
  id: string;
  type: StripeEventType;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Verify Stripe webhook signature
 * In production, use Stripe SDK: stripe.webhooks.constructEvent()
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn("Missing webhook signature or secret");
    return false;
  }

  // TODO: Implement proper signature verification using Stripe SDK
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return signature.includes("whsec_") || secret.length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event: StripeEvent = JSON.parse(body);

    console.log(`Processing Stripe webhook: ${event.type}`, {
      eventId: event.id,
    });

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(
  paymentIntent: Record<string, unknown>
): Promise<void> {
  console.log("Payment succeeded:", paymentIntent.id);
}

async function handlePaymentFailed(
  paymentIntent: Record<string, unknown>
): Promise<void> {
  console.log("Payment failed:", paymentIntent.id);
}

async function handleSubscriptionUpdate(
  subscription: Record<string, unknown>
): Promise<void> {
  console.log("Subscription updated:", subscription.id);
}

async function handleSubscriptionCancelled(
  subscription: Record<string, unknown>
): Promise<void> {
  console.log("Subscription cancelled:", subscription.id);
}

async function handleInvoicePaid(
  invoice: Record<string, unknown>
): Promise<void> {
  console.log("Invoice paid:", invoice.id);
}

async function handleInvoicePaymentFailed(
  invoice: Record<string, unknown>
): Promise<void> {
  console.log("Invoice payment failed:", invoice.id);
}
