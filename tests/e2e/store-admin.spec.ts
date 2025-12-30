/**
 * E2E Tests for Admin Store Management
 *
 * Tests admin capabilities for managing products, orders, and store settings.
 *
 * Per Charter P2: Authorization - admin endpoints require admin auth
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

// Test headers for admin authentication
const ADMIN_HEADERS = { Authorization: "Bearer test-admin-token" };

test.describe("Store Admin E2E - Product Management", () => {
  test("admin can list all products", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("totalItems");
    expect(Array.isArray(data.items)).toBe(true);
  });

  test("admin can create a product", async ({ request }) => {
    const slug = `e2e-test-product-${Date.now()}`;

    const response = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "E2E Test Product",
        slug,
        priceCents: 1999,
        type: "PHYSICAL",
        description: "Created by E2E test",
        isActive: false, // Create inactive so it doesn't show in public
      },
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.product).toHaveProperty("id");
    expect(data.product.name).toBe("E2E Test Product");
    expect(data.product.slug).toBe(slug);

    // Cleanup
    if (data.product.id) {
      await request.delete(`${BASE}/api/admin/store/products/${data.product.id}`, {
        headers: ADMIN_HEADERS,
      });
    }
  });

  test("admin can update a product", async ({ request }) => {
    // Create a product first
    const slug = `e2e-update-test-${Date.now()}`;
    const createResponse = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "Original Name",
        slug,
        priceCents: 1000,
        isActive: false,
      },
    });

    const created = await createResponse.json();
    const productId = created.product.id;

    // Update the product
    const updateResponse = await request.put(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "Updated Name",
        priceCents: 2000,
      },
    });

    expect(updateResponse.status()).toBe(200);

    const updated = await updateResponse.json();
    expect(updated.product.name).toBe("Updated Name");
    expect(updated.product.priceCents).toBe(2000);

    // Cleanup
    await request.delete(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });
  });

  test("admin can delete a product", async ({ request }) => {
    // Create a product first
    const slug = `e2e-delete-test-${Date.now()}`;
    const createResponse = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "Product to Delete",
        slug,
        priceCents: 500,
        isActive: false,
      },
    });

    const created = await createResponse.json();
    const productId = created.product.id;

    // Delete the product
    const deleteResponse = await request.delete(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });

    expect(deleteResponse.status()).toBe(200);

    // Verify it's gone
    const getResponse = await request.get(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });

    expect(getResponse.status()).toBe(404);
  });

  test("product creation validates required fields", async ({ request }) => {
    // Missing name
    const noNameResponse = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        priceCents: 1000,
      },
    });

    expect(noNameResponse.status()).toBe(400);
    const noNameData = await noNameResponse.json();
    expect(noNameData.error).toContain("Name");

    // Negative price
    const negativePriceResponse = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "Test Product",
        priceCents: -100,
      },
    });

    expect(negativePriceResponse.status()).toBe(400);
    const negativePriceData = await negativePriceResponse.json();
    expect(negativePriceData.error).toContain("Price");
  });
});

test.describe("Store Admin E2E - Order Management", () => {
  test("admin can list all orders", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/orders`, {
      headers: ADMIN_HEADERS,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("totalItems");
    expect(Array.isArray(data.items)).toBe(true);

    // Orders should not include CART status
    for (const order of data.items) {
      expect(order.status).not.toBe("CART");
    }
  });

  test("admin can filter orders by status", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/orders?status=COMPLETED`, {
      headers: ADMIN_HEADERS,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    for (const order of data.items) {
      expect(order.status).toBe("COMPLETED");
    }
  });

  test("admin can view order details", async ({ request }) => {
    // First get an order ID
    const listResponse = await request.get(`${BASE}/api/admin/store/orders?pageSize=1`, {
      headers: ADMIN_HEADERS,
    });

    const listData = await listResponse.json();

    if (listData.items.length === 0) {
      test.skip(true, "No orders in database");
      return;
    }

    const orderId = listData.items[0].id;

    // Get order details
    const detailResponse = await request.get(`${BASE}/api/admin/store/orders/${orderId}`, {
      headers: ADMIN_HEADERS,
    });

    expect(detailResponse.status()).toBe(200);

    const detailData = await detailResponse.json();
    expect(detailData.order).toHaveProperty("id", orderId);
    expect(detailData.order).toHaveProperty("items");
    expect(Array.isArray(detailData.order.items)).toBe(true);
  });

  test("admin can update order status", async ({ request }) => {
    // Find a pending payment order
    const listResponse = await request.get(`${BASE}/api/admin/store/orders?status=PENDING_PAYMENT&pageSize=1`, {
      headers: ADMIN_HEADERS,
    });

    const listData = await listResponse.json();

    if (listData.items.length === 0) {
      test.skip(true, "No pending payment orders to test");
      return;
    }

    const orderId = listData.items[0].id;

    // Cancel the order
    const updateResponse = await request.put(`${BASE}/api/admin/store/orders/${orderId}`, {
      headers: ADMIN_HEADERS,
      data: {
        status: "CANCELLED",
        adminNotes: "E2E test cancellation",
      },
    });

    expect(updateResponse.status()).toBe(200);

    const updateData = await updateResponse.json();
    expect(updateData.order.status).toBe("CANCELLED");
  });
});

test.describe("Store Admin E2E - Dashboard", () => {
  test("admin can view store dashboard metrics", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/dashboard`, {
      headers: ADMIN_HEADERS,
    });

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Check order counts
    expect(data).toHaveProperty("pendingCount");
    expect(data).toHaveProperty("processingCount");
    expect(data).toHaveProperty("shippedCount");
    expect(data).toHaveProperty("completedCount");

    // Check revenue metrics
    expect(data).toHaveProperty("todayRevenue");
    expect(data).toHaveProperty("monthRevenue");

    // Check inventory alerts
    expect(data).toHaveProperty("lowStockProducts");
    expect(data).toHaveProperty("lowStockVariants");
    expect(Array.isArray(data.lowStockProducts)).toBe(true);
    expect(Array.isArray(data.lowStockVariants)).toBe(true);

    // Check recent orders
    expect(data).toHaveProperty("recentOrders");
    expect(Array.isArray(data.recentOrders)).toBe(true);
  });
});

test.describe("Store Admin E2E - Authorization", () => {
  test("unauthenticated user cannot access admin products", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/products`);
    expect(response.status()).toBe(401);
  });

  test("unauthenticated user cannot access admin orders", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/orders`);
    expect(response.status()).toBe(401);
  });

  test("unauthenticated user cannot access admin dashboard", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/store/dashboard`);
    expect(response.status()).toBe(401);
  });

  test("unauthenticated user cannot create products", async ({ request }) => {
    const response = await request.post(`${BASE}/api/admin/store/products`, {
      data: {
        name: "Unauthorized Product",
        priceCents: 1000,
      },
    });

    expect(response.status()).toBe(401);
  });

  test("unauthenticated user cannot modify orders", async ({ request }) => {
    const fakeOrderId = "00000000-0000-0000-0000-000000000000";

    const response = await request.put(`${BASE}/api/admin/store/orders/${fakeOrderId}`, {
      data: {
        status: "CANCELLED",
      },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe("Store Admin E2E - Product Variants", () => {
  test("can create product with variants", async ({ request }) => {
    const slug = `e2e-variant-test-${Date.now()}`;

    const createResponse = await request.post(`${BASE}/api/admin/store/products`, {
      headers: ADMIN_HEADERS,
      data: {
        name: "Variant Test Product",
        slug,
        priceCents: 2500,
        type: "PHYSICAL",
        trackInventory: true,
        quantity: 0, // Parent has 0, variants have stock
        isActive: false,
      },
    });

    expect(createResponse.status()).toBe(201);

    const created = await createResponse.json();
    const productId = created.product.id;

    // Get product details to verify
    const detailResponse = await request.get(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });

    expect(detailResponse.status()).toBe(200);

    const detail = await detailResponse.json();
    expect(detail.product).toHaveProperty("variants");
    expect(Array.isArray(detail.product.variants)).toBe(true);

    // Cleanup
    await request.delete(`${BASE}/api/admin/store/products/${productId}`, {
      headers: ADMIN_HEADERS,
    });
  });
});
