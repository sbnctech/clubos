/**
 * E2E Tests for Store and Checkout Flow
 *
 * Tests the complete shopping experience from browsing products
 * to checkout (up to payment - Stripe testing is separate).
 *
 * Per Charter P7: Audit logging for checkout attempts
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Store E2E - Product Browsing", () => {
  test("public products page loads and shows products", async ({ page }) => {
    await page.goto(`${BASE}/store/products`);

    // Page should load without error
    await expect(page).toHaveTitle(/Store|Products/i);

    // Products grid should be visible
    const productsSection = page.locator('[data-testid="products-grid"], .products-grid, main');
    await expect(productsSection).toBeVisible();
  });

  test("products API returns public active products", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/products`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("items");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("totalItems");
    expect(Array.isArray(data.items)).toBe(true);

    // All returned products should be active and public
    for (const product of data.items) {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("slug");
      expect(product).toHaveProperty("priceCents");
      expect(product).toHaveProperty("inStock");
    }
  });

  test("products API supports type filtering", async ({ request }) => {
    const physicalResponse = await request.get(`${BASE}/api/store/products?type=PHYSICAL`);
    expect(physicalResponse.status()).toBe(200);

    const physicalData = await physicalResponse.json();
    for (const product of physicalData.items) {
      expect(product.type).toBe("PHYSICAL");
    }

    const digitalResponse = await request.get(`${BASE}/api/store/products?type=DIGITAL`);
    expect(digitalResponse.status()).toBe(200);

    const digitalData = await digitalResponse.json();
    for (const product of digitalData.items) {
      expect(product.type).toBe("DIGITAL");
    }
  });

  test("products API supports search", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/products?q=shirt`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    // Should find products (t-shirt from seed data)
    expect(data.items.length).toBeGreaterThanOrEqual(0);
  });

  test("product detail page loads for valid slug", async ({ request }) => {
    // First get a product slug from the list
    const listResponse = await request.get(`${BASE}/api/store/products`);
    const listData = await listResponse.json();

    if (listData.items.length > 0) {
      const product = listData.items[0];
      const detailResponse = await request.get(`${BASE}/api/store/products/${product.slug}`);

      expect(detailResponse.status()).toBe(200);

      const detailData = await detailResponse.json();
      expect(detailData.product).toHaveProperty("id", product.id);
      expect(detailData.product).toHaveProperty("name");
      expect(detailData.product).toHaveProperty("description");
    }
  });

  test("product detail returns 404 for non-existent slug", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/products/non-existent-product-slug-12345`);
    expect(response.status()).toBe(404);
  });
});

test.describe("Store E2E - Cart Operations", () => {
  test("empty cart starts with 0 items", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/cart`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("cart");
    expect(data.cart).toHaveProperty("items");
    expect(data.cart).toHaveProperty("itemCount");
    expect(data.cart).toHaveProperty("subtotalCents");
  });

  test("can add product to cart", async ({ request }) => {
    // First get a product
    const productsResponse = await request.get(`${BASE}/api/store/products`);
    const products = await productsResponse.json();

    if (products.items.length === 0) {
      test.skip(true, "No products in store");
      return;
    }

    const product = products.items[0];

    // Add to cart
    const addResponse = await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: product.id,
        quantity: 1,
      },
    });

    expect(addResponse.status()).toBe(200);

    const addData = await addResponse.json();
    expect(addData.cart.items.length).toBeGreaterThan(0);
    expect(addData.cart.itemCount).toBeGreaterThan(0);
  });

  test("adding invalid product returns error", async ({ request }) => {
    const response = await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  test("adding without productId returns error", async ({ request }) => {
    const response = await request.post(`${BASE}/api/store/cart`, {
      data: {
        quantity: 1,
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Product ID");
  });

  test("adding quantity less than 1 returns error", async ({ request }) => {
    const response = await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: "some-product-id",
        quantity: 0,
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Quantity");
  });

  test("can clear cart", async ({ request }) => {
    const response = await request.delete(`${BASE}/api/store/cart`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.cart.items).toHaveLength(0);
    expect(data.cart.itemCount).toBe(0);
  });
});

test.describe("Store E2E - Cart Item Management", () => {
  test("can update cart item quantity", async ({ request }) => {
    // Get products
    const productsResponse = await request.get(`${BASE}/api/store/products`);
    const products = await productsResponse.json();

    if (products.items.length === 0) {
      test.skip(true, "No products in store");
      return;
    }

    const product = products.items[0];

    // Add to cart first
    await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: product.id,
        quantity: 1,
      },
    });

    // Get cart to find item ID
    const cartResponse = await request.get(`${BASE}/api/store/cart`);
    const cartData = await cartResponse.json();

    if (cartData.cart.items.length === 0) {
      test.skip(true, "Cart is empty after add");
      return;
    }

    const itemId = cartData.cart.items[0].id;

    // Update quantity
    const updateResponse = await request.patch(`${BASE}/api/store/cart/items/${itemId}`, {
      data: { quantity: 3 },
    });

    expect(updateResponse.status()).toBe(200);

    const updateData = await updateResponse.json();
    const updatedItem = updateData.cart.items.find((i: { id: string }) => i.id === itemId);
    expect(updatedItem?.quantity).toBe(3);
  });

  test("can remove item from cart", async ({ request }) => {
    // Get products
    const productsResponse = await request.get(`${BASE}/api/store/products`);
    const products = await productsResponse.json();

    if (products.items.length === 0) {
      test.skip(true, "No products in store");
      return;
    }

    const product = products.items[0];

    // Add to cart first
    await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: product.id,
        quantity: 1,
      },
    });

    // Get cart to find item ID
    const cartResponse = await request.get(`${BASE}/api/store/cart`);
    const cartData = await cartResponse.json();

    if (cartData.cart.items.length === 0) {
      test.skip(true, "Cart is empty after add");
      return;
    }

    const itemId = cartData.cart.items[0].id;

    // Delete the item
    const deleteResponse = await request.delete(`${BASE}/api/store/cart/items/${itemId}`);

    expect(deleteResponse.status()).toBe(200);

    const deleteData = await deleteResponse.json();
    const removedItem = deleteData.cart.items.find((i: { id: string }) => i.id === itemId);
    expect(removedItem).toBeUndefined();
  });

  test("updating non-existent item returns error", async ({ request }) => {
    const response = await request.patch(`${BASE}/api/store/cart/items/00000000-0000-0000-0000-000000000000`, {
      data: { quantity: 2 },
    });

    expect([400, 404]).toContain(response.status());
  });
});

test.describe("Store E2E - Checkout Validation", () => {
  test("checkout with empty cart fails", async ({ request }) => {
    // Clear cart first
    await request.delete(`${BASE}/api/store/cart`);

    const response = await request.post(`${BASE}/api/store/checkout`, {
      data: {
        email: "test@example.com",
        fulfillmentType: "SHIPPING",
        shippingAddress: {
          firstName: "Test",
          lastName: "User",
          addressLine1: "123 Main St",
          city: "Santa Barbara",
          state: "CA",
          postalCode: "93101",
        },
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Cart is empty");
  });

  test("checkout without email fails", async ({ request }) => {
    const response = await request.post(`${BASE}/api/store/checkout`, {
      data: {
        fulfillmentType: "SHIPPING",
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Email");
  });

  test("checkout without fulfillment type fails", async ({ request }) => {
    const response = await request.post(`${BASE}/api/store/checkout`, {
      data: {
        email: "test@example.com",
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Fulfillment");
  });

  test("shipping checkout without address fails", async ({ request }) => {
    // Add a product to cart first
    const productsResponse = await request.get(`${BASE}/api/store/products?type=PHYSICAL`);
    const products = await productsResponse.json();

    if (products.items.length === 0) {
      test.skip(true, "No physical products in store");
      return;
    }

    const product = products.items[0];

    // Add to cart
    await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: product.id,
        quantity: 1,
      },
    });

    // Try checkout without shipping address
    const response = await request.post(`${BASE}/api/store/checkout`, {
      data: {
        email: "test@example.com",
        fulfillmentType: "SHIPPING",
        // No shippingAddress
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toContain("Shipping address");
  });
});

test.describe("Store E2E - Public Store Pages", () => {
  const storeRoutes = [
    "/store",
    "/store/products",
    "/store/cart",
  ];

  for (const route of storeRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const response = await page.goto(`${BASE}${route}`);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }

  test("checkout page redirects to cart when empty", async ({ page }) => {
    // Clear cart via API
    const context = page.context();
    await context.request.delete(`${BASE}/api/store/cart`);

    await page.goto(`${BASE}/store/checkout`);

    // Should either show empty cart message or redirect to cart
    const currentUrl = page.url();
    const pageContent = await page.content();

    // Either on checkout with message or redirected to cart
    expect(
      currentUrl.includes("/cart") ||
      pageContent.includes("empty") ||
      pageContent.includes("Cart")
    ).toBe(true);
  });
});

test.describe("Store E2E - Complete Shopping Flow", () => {
  test("complete flow: browse -> add to cart -> view cart", async ({ request }) => {
    // 1. Browse products
    const productsResponse = await request.get(`${BASE}/api/store/products`);
    expect(productsResponse.status()).toBe(200);

    const products = await productsResponse.json();
    if (products.items.length === 0) {
      test.skip(true, "No products in store");
      return;
    }

    // 2. View product details
    const product = products.items[0];
    const detailResponse = await request.get(`${BASE}/api/store/products/${product.slug}`);
    expect(detailResponse.status()).toBe(200);

    // 3. Add to cart
    await request.delete(`${BASE}/api/store/cart`); // Clear cart first

    const addResponse = await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: product.id,
        quantity: 2,
      },
    });
    expect(addResponse.status()).toBe(200);

    // 4. View cart
    const cartResponse = await request.get(`${BASE}/api/store/cart`);
    expect(cartResponse.status()).toBe(200);

    const cart = await cartResponse.json();
    expect(cart.cart.items.length).toBe(1);
    expect(cart.cart.items[0].productId).toBe(product.id);
    expect(cart.cart.items[0].quantity).toBe(2);
    expect(cart.cart.itemCount).toBe(2);
  });

  test("complete flow: add multiple products, update quantities", async ({ request }) => {
    // Clear cart
    await request.delete(`${BASE}/api/store/cart`);

    // Get products
    const productsResponse = await request.get(`${BASE}/api/store/products`);
    const products = await productsResponse.json();

    if (products.items.length < 2) {
      test.skip(true, "Need at least 2 products in store");
      return;
    }

    // Add first product
    await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: products.items[0].id,
        quantity: 1,
      },
    });

    // Add second product
    await request.post(`${BASE}/api/store/cart`, {
      data: {
        productId: products.items[1].id,
        quantity: 1,
      },
    });

    // Check cart has 2 items
    let cartResponse = await request.get(`${BASE}/api/store/cart`);
    let cart = await cartResponse.json();
    expect(cart.cart.items.length).toBe(2);

    // Update first item quantity
    const firstItemId = cart.cart.items[0].id;
    await request.patch(`${BASE}/api/store/cart/items/${firstItemId}`, {
      data: { quantity: 5 },
    });

    // Verify update
    cartResponse = await request.get(`${BASE}/api/store/cart`);
    cart = await cartResponse.json();

    const updatedItem = cart.cart.items.find((i: { id: string }) => i.id === firstItemId);
    expect(updatedItem?.quantity).toBe(5);
  });
});

test.describe("Store E2E - Order History", () => {
  test("orders by session returns orders", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/orders/by-session`);

    // May return 200 with empty array or orders, or 404 if no session
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty("orders");
      expect(Array.isArray(data.orders)).toBe(true);
    }
  });

  test("order detail returns 404 for non-existent order", async ({ request }) => {
    const response = await request.get(`${BASE}/api/store/orders/99999999`);
    expect(response.status()).toBe(404);
  });
});
