/**
 * Payment Refund API
 *
 * POST /api/payments/refund - Request a refund
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
    const { paymentId, amount } = body;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { error: "Invalid payment ID" },
        { status: 400 }
      );
    }

    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      return NextResponse.json(
        { error: "Invalid refund amount. Must be a positive number." },
        { status: 400 }
      );
    }

    const paymentService = await getPaymentService();
    const result = await paymentService.refundPayment(paymentId, amount);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.errorMessage || "Refund request failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      refundId: result.refundId,
      amount: result.amount,
      status: result.status,
    });
  } catch (error) {
    console.error("Failed to process refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
