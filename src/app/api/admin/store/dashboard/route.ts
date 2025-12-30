/**
 * Admin Store Dashboard API
 *
 * GET /api/admin/store/dashboard - Get store dashboard stats
 *
 * Authorization: Admin only
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/eventAuth";
import { startOfClubDayUtc } from "@/lib/timezone";

export async function GET(req: NextRequest) {
  const authResult = await requireAdminOnly(req);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const today = startOfClubDayUtc(new Date());

    // Get order counts
    const [totalOrders, pendingOrders, completedOrders, todayOrders] = await Promise.all([
      prisma.storeOrder.count({
        where: { status: { not: "CART" } },
      }),
      prisma.storeOrder.count({
        where: { status: { in: ["PAID", "PROCESSING"] } },
      }),
      prisma.storeOrder.count({
        where: { status: "COMPLETED" },
      }),
      prisma.storeOrder.count({
        where: {
          status: { not: "CART" },
          createdAt: { gte: today },
        },
      }),
    ]);

    // Get revenue aggregates
    const [totalRevenue, todayRevenue] = await Promise.all([
      prisma.storeOrder.aggregate({
        where: { status: { notIn: ["CART", "CANCELLED", "REFUNDED"] } },
        _sum: { totalCents: true },
      }),
      prisma.storeOrder.aggregate({
        where: {
          status: { notIn: ["CART", "CANCELLED", "REFUNDED"] },
          createdAt: { gte: today },
        },
        _sum: { totalCents: true },
      }),
    ]);

    // Get low stock products - fetch all with threshold and filter in code
    const productsWithThreshold = await prisma.product.findMany({
      where: {
        isActive: true,
        trackInventory: true,
        lowStockThreshold: { not: null },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        quantity: true,
        lowStockThreshold: true,
      },
    });

    const lowStockProducts = productsWithThreshold.filter(
      (p) => p.lowStockThreshold !== null && p.quantity <= p.lowStockThreshold
    );

    // Also check variants for low stock
    const variantsWithThreshold = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        lowStockThreshold: { not: null },
        product: { isActive: true, trackInventory: true },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        lowStockThreshold: true,
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const lowStockVariants = variantsWithThreshold.filter(
      (v) => v.lowStockThreshold !== null && v.quantity <= v.lowStockThreshold
    );

    // Combine low stock items
    const allLowStock = [
      ...lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        quantity: p.quantity,
        lowStockThreshold: p.lowStockThreshold!,
      })),
      ...lowStockVariants.map((v) => ({
        id: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        quantity: v.quantity,
        lowStockThreshold: v.lowStockThreshold!,
        variantName: v.name,
      })),
    ].slice(0, 10);

    // Get recent orders
    const recentOrders = await prisma.storeOrder.findMany({
      where: { status: { not: "CART" } },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalCents: true,
        createdAt: true,
        guestFirstName: true,
        guestLastName: true,
        guestEmail: true,
        customer: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenueCents: totalRevenue._sum.totalCents || 0,
      todayOrders,
      todayRevenueCents: todayRevenue._sum.totalCents || 0,
      lowStockProducts: allLowStock,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.customer
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : order.guestFirstName && order.guestLastName
            ? `${order.guestFirstName} ${order.guestLastName}`
            : order.guestEmail || "Guest",
        totalCents: order.totalCents,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[ADMIN STORE DASHBOARD] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
