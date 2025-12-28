/**
 * Payment Confirmation API
 *
 * POST /api/payments/confirm - Confirm a payment (server-side)
 */

import { NextRequest, NextResponse } from "next/server";
import { getPaymentService } from "@/services";
import { getCurrentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json(
        { error: "Invalid payment intent ID" },
        { status: 400 }
      );
    }

    const paymentService = await getPaymentService();
    const result = await paymentService.confirmPayment(paymentIntentId);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.errorMessage || "Payment confirmation failed",
          code: result.errorCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      status: result.status,
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
