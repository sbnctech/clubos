# Store Migration Flow

This document describes the process for migrating Wild Apricot online store data to Murmurant.

---

## Overview

Wild Apricot provides a Store Admin API (since release 7.24, Nov 2021) that allows retrieval of:

- **Products** - catalog items with name, price, description, images, inventory
- **Orders** - purchase records with line items, status, payment info, customer data

**API Reference:** [WA Store Admin API](https://gethelp.wildapricot.com/en/articles/1873-store-admin-api-call)

---

## Prerequisites

1. **WA API Credentials**
   - Account ID (from WA Settings > Integration)
   - API Key (from Settings > Integrations > Authorized applications)

2. **Murmurant Store Module** (in progress)
   - Product model with SKU, price, inventory tracking
   - StoreOrder model with line items, status tracking
   - Admin UI for product management
   - Public store pages

---

## Migration Steps

### Step 1: Export Products from WA

```typescript
import { WaStoreApiClient } from "@/lib/migration/wa-store-api";

const client = new WaStoreApiClient({
  accountId: "123456",
  apiKey: "your-api-key",
});

const products = await client.getProducts();
```

**Product fields available:**

| WA Field | Murmurant Field | Notes |
|----------|-----------------|-------|
| Id | waId | Store for ID mapping |
| Name | name | Required |
| Description | description | HTML content |
| Price | price | Decimal |
| Sku | sku | Optional product code |
| Status | status | Active/Inactive/Deleted |
| ImageUrl | imageUrl | May need re-upload |
| TrackInventory | trackInventory | Boolean |
| AvailableQuantity | availableQuantity | If tracking enabled |
| Category | category | String |

### Step 2: Export Orders from WA

```typescript
// Get all orders
const orders = await client.getOrders();

// Get orders with filters
const recentOrders = await client.getOrders({
  from: "2024-01-01",
  to: "2024-12-31",
  status: "Fulfilled",
  paymentStatus: "Paid",
});
```

**Order fields available:**

| WA Field | Murmurant Field | Notes |
|----------|-----------------|-------|
| Id | waId | Store for ID mapping |
| OrderNumber | orderNumber | Display number |
| OrderDate | orderDate | DateTime |
| Status | status | Fulfilled/Unfulfilled/Cancelled |
| PaymentStatus | paymentStatus | Paid/Unpaid/Partial/Free |
| TotalAmount | totalAmount | Decimal |
| Items | items | Array of line items |
| ContactId | waMemberId | Link to member |
| CustomerName | customerName | From contact |
| CustomerEmail | customerEmail | From contact |
| ShippingAddress | shippingAddress | Address object |
| BillingAddress | billingAddress | Address object |

### Step 3: Convert to Murmurant Format

```typescript
import { convertWaStoreData } from "@/lib/migration/wa-store-api";

const importResult = await client.importAll();
const { products, orders } = convertWaStoreData(importResult);

// products: MurmurantProduct[]
// orders: MurmurantStoreOrder[]
```

### Step 4: Import into Murmurant Database

```typescript
// When store module is ready:
import { prisma } from "@/lib/db";

// Import products
for (const product of products) {
  await prisma.product.create({
    data: {
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      status: product.status,
      // ... other fields
    },
  });

  // Store ID mapping for order linking
  await prisma.waIdMapping.create({
    data: {
      entityType: "Product",
      waId: String(product.waId),
      localId: createdProduct.id,
    },
  });
}

// Import orders (after products for linking)
for (const order of orders) {
  // Look up product IDs from mapping
  const items = await Promise.all(
    order.items.map(async (item) => {
      const mapping = await prisma.waIdMapping.findFirst({
        where: { entityType: "Product", waId: String(item.productWaId) },
      });
      return {
        productId: mapping?.localId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      };
    })
  );

  await prisma.storeOrder.create({
    data: {
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: items,
      // ... other fields
    },
  });
}
```

### Step 5: Migrate Product Images

Product images hosted on WA should be downloaded and re-uploaded:

```typescript
// For each product with imageUrl
if (product.imageUrl) {
  // Download from WA
  const response = await fetch(product.imageUrl);
  const buffer = await response.arrayBuffer();

  // Upload to Murmurant storage
  const filename = `products/${product.sku || product.waId}.jpg`;
  const newUrl = await uploadToStorage(buffer, filename);

  // Update product with new URL
  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl: newUrl },
  });
}
```

---

## Widget Migration

Store widgets on pages are handled by the widget config extractor:

### Store Catalog Widget

```typescript
// Extracted from WA page:
{
  type: "store-catalog",
  properties: {
    products: [
      { name: "Item 1", price: "$25.00", imageUrl: "...", productUrl: "..." },
      // ...
    ],
    productCount: 10,
  },
}

// Converts to Murmurant block:
{
  type: "store-catalog",
  variant: "grid",
  columns: 3,
  showPrice: true,
  showImage: true,
  category: null, // Show all
}
```

### Store Product Widget

```typescript
// Extracted from WA page:
{
  type: "store-product",
  properties: {
    name: "Annual Membership",
    price: "$50.00",
    description: "Full year access...",
    imageUrl: "...",
  },
}

// Converts to Murmurant block:
{
  type: "store-product",
  productId: "uuid-from-mapping",
  showDescription: true,
  showPrice: true,
  showAddToCart: true,
}
```

---

## Status Mapping

### Order Status

| WA Status | Murmurant Status | Notes |
|-----------|------------------|-------|
| Unfulfilled | PENDING | Awaiting fulfillment |
| Fulfilled | FULFILLED | Shipped/completed |
| Cancelled | CANCELLED | Cancelled by customer/admin |

### Payment Status

| WA Status | Murmurant Status | Notes |
|-----------|------------------|-------|
| NoInvoice | PENDING | No invoice generated |
| Unpaid | PENDING | Invoice sent, not paid |
| PartiallyPaid | PARTIAL | Partial payment received |
| Paid | PAID | Fully paid |
| Free | FREE | Zero-cost order |

### Product Status

| WA Status | Murmurant Status | Notes |
|-----------|------------------|-------|
| Active | ACTIVE | Available for purchase |
| Inactive | INACTIVE | Hidden from store |
| Deleted | DELETED | Soft-deleted |

---

## Edge Cases

### Products Without SKUs

WA allows products without SKUs. Generate synthetic SKUs for Murmurant:

```typescript
const sku = product.sku || `WA-${product.waId}`;
```

### Orders Without Members

Guest checkout orders have no ContactId. Store customer info directly:

```typescript
if (!order.waMemberId) {
  // Store as guest order
  order.guestName = order.customerName;
  order.guestEmail = order.customerEmail;
}
```

### Historical Orders

For orders with products that no longer exist:

```typescript
// Store product snapshot in order item
items: [
  {
    productId: null, // Product deleted
    productSnapshot: {
      name: item.productName,
      sku: item.sku,
      price: item.unitPrice,
    },
    quantity: item.quantity,
    totalPrice: item.totalPrice,
  },
];
```

---

## Audit Trail

All import operations must be logged (per P1):

```typescript
await prisma.auditLog.create({
  data: {
    action: "STORE_PRODUCT_IMPORT",
    entityType: "Product",
    entityId: createdProduct.id,
    details: {
      waId: product.waId,
      source: "wa-store-api",
    },
    performedBy: operatorMemberId,
  },
});
```

---

## Migration Checklist

- [ ] Obtain WA API credentials
- [ ] Export products via API
- [ ] Export orders via API (with date filters if needed)
- [ ] Convert to Murmurant format
- [ ] Create products in database
- [ ] Store WA ID mappings
- [ ] Import orders with product links
- [ ] Download and re-upload product images
- [ ] Update page blocks with new product IDs
- [ ] Verify order totals match
- [ ] Test checkout flow with migrated products
