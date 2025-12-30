/**
 * Digital Download API
 *
 * GET /api/store/download/:token - Download digital product
 *
 * Token-based access for digital product downloads.
 * Tracks download count and enforces limits.
 *
 * Charter: P7 (audit trail for downloads)
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { token } = await context.params;

  try {
    // Find the delivery record
    const delivery = await prisma.digitalDelivery.findUnique({
      where: { downloadToken: token },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Invalid download token" },
        { status: 404 }
      );
    }

    // Check if order is paid
    if (!["PAID", "PROCESSING", "SHIPPED", "READY_FOR_PICKUP", "DELIVERED", "PICKED_UP", "COMPLETED"].includes(delivery.order.status)) {
      return NextResponse.json(
        { error: "Order not paid" },
        { status: 403 }
      );
    }

    // Check expiration
    if (delivery.expiresAt && new Date() > delivery.expiresAt) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      );
    }

    // Check download limit
    if (delivery.maxDownloads && delivery.downloadCount >= delivery.maxDownloads) {
      return NextResponse.json(
        { error: "Download limit reached" },
        { status: 403 }
      );
    }

    // Find the product for this delivery
    const orderItem = delivery.order.items.find(
      (item) => item.productId === delivery.productId
    );
    const product = orderItem?.product;

    if (!product || !product.digitalAssetUrl) {
      return NextResponse.json(
        { error: "Digital asset not found" },
        { status: 404 }
      );
    }

    // Update download tracking
    const now = new Date();
    await prisma.digitalDelivery.update({
      where: { id: delivery.id },
      data: {
        downloadCount: { increment: 1 },
        firstDownloadAt: delivery.firstDownloadAt || now,
        lastDownloadAt: now,
      },
    });

    console.log(`[STORE] Digital download: order=${delivery.order.orderNumber}, product=${product.name}, count=${delivery.downloadCount + 1}`);

    // Redirect to the actual file
    // In production, this would generate a signed URL for S3/storage
    return NextResponse.redirect(product.digitalAssetUrl);
  } catch (error) {
    console.error("[STORE] Download error:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}
