/**
 * Wild Apricot Store Data Import
 *
 * Imports products and orders from a WA account into Murmurant.
 *
 * Prerequisites:
 * - Store module merged (commits 0a65cc1, d78750f)
 * - WA API credentials configured
 * - Database connection configured
 *
 * Usage:
 *   npx tsx scripts/importing/wa_import_store.ts --account-id=123456 --api-key=KEY
 *
 * Options:
 *   --account-id   WA account ID (required)
 *   --api-key      WA API key (required)
 *   --dry-run      Preview without writing to database
 *   --products     Import products only
 *   --orders       Import orders only
 *   --from         Order date filter start (yyyy-mm-dd)
 *   --to           Order date filter end (yyyy-mm-dd)
 *
 * Charter: P1 (audit logged), P5 (reversible via WA ID mappings)
 */

import {
  WaStoreApiClient,
  convertWaStoreData,
  type WaOrderFilters,
} from "../../src/lib/migration/wa-store-api";
// import { prisma } from "../../src/lib/db";

// Parse CLI arguments
function parseArgs(): {
  accountId: string;
  apiKey: string;
  dryRun: boolean;
  productsOnly: boolean;
  ordersOnly: boolean;
  from?: string;
  to?: string;
} {
  const args = process.argv.slice(2);
  const result = {
    accountId: "",
    apiKey: "",
    dryRun: false,
    productsOnly: false,
    ordersOnly: false,
    from: undefined as string | undefined,
    to: undefined as string | undefined,
  };

  for (const arg of args) {
    if (arg.startsWith("--account-id=")) {
      result.accountId = arg.split("=")[1];
    } else if (arg.startsWith("--api-key=")) {
      result.apiKey = arg.split("=")[1];
    } else if (arg === "--dry-run") {
      result.dryRun = true;
    } else if (arg === "--products") {
      result.productsOnly = true;
    } else if (arg === "--orders") {
      result.ordersOnly = true;
    } else if (arg.startsWith("--from=")) {
      result.from = arg.split("=")[1];
    } else if (arg.startsWith("--to=")) {
      result.to = arg.split("=")[1];
    }
  }

  if (!result.accountId || !result.apiKey) {
    console.error("Usage: npx tsx wa_import_store.ts --account-id=ID --api-key=KEY");
    console.error("       [--dry-run] [--products] [--orders] [--from=DATE] [--to=DATE]");
    process.exit(1);
  }

  return result;
}

async function main() {
  const args = parseArgs();

  console.log("WA Store Import");
  console.log("===============");
  console.log(`Account ID: ${args.accountId}`);
  console.log(`Dry run: ${args.dryRun}`);
  console.log("");

  // Initialize API client
  const client = new WaStoreApiClient({
    accountId: args.accountId,
    apiKey: args.apiKey,
  });

  // Build order filters
  const orderFilters: WaOrderFilters = {};
  if (args.from) orderFilters.from = args.from;
  if (args.to) orderFilters.to = args.to;

  // Fetch data from WA
  console.log("Fetching data from Wild Apricot...");

  const importProducts = !args.ordersOnly;
  const importOrders = !args.productsOnly;

  const result = await client.importAll(
    importOrders ? orderFilters : undefined
  );

  console.log(`\nFetched:`);
  console.log(`  Products: ${result.summary.productsImported}`);
  console.log(`  Orders: ${result.summary.ordersImported}`);
  console.log(`  Total product value: $${result.summary.totalProductValue.toFixed(2)}`);
  console.log(`  Total order value: $${result.summary.totalOrderValue.toFixed(2)}`);

  if (result.errors.length > 0) {
    console.log(`\nErrors:`);
    for (const error of result.errors) {
      console.log(`  [${error.type}] ${error.error}`);
    }
  }

  // Convert to Murmurant format
  const { products, orders } = convertWaStoreData(result);

  console.log(`\nConverted to Murmurant format:`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Orders: ${orders.length}`);

  if (args.dryRun) {
    console.log("\n[DRY RUN] Would import the following:");

    if (importProducts) {
      console.log("\nProducts:");
      for (const product of products.slice(0, 5)) {
        console.log(`  - ${product.name} ($${product.price}) [WA ID: ${product.waId}]`);
      }
      if (products.length > 5) {
        console.log(`  ... and ${products.length - 5} more`);
      }
    }

    if (importOrders) {
      console.log("\nOrders:");
      for (const order of orders.slice(0, 5)) {
        console.log(
          `  - #${order.orderNumber} ($${order.totalAmount}) [${order.status}] [WA ID: ${order.waId}]`
        );
      }
      if (orders.length > 5) {
        console.log(`  ... and ${orders.length - 5} more`);
      }
    }

    console.log("\n[DRY RUN] No changes made to database.");
    return;
  }

  // Import into database
  // NOTE: Uncomment when store module is merged
  console.log("\n[PENDING] Store module not yet merged.");
  console.log("Once merged, this script will:");
  console.log("  1. Create Product records");
  console.log("  2. Create ProductVariant records (if applicable)");
  console.log("  3. Store WA ID mappings for products");
  console.log("  4. Create Order records");
  console.log("  5. Create OrderItem records");
  console.log("  6. Link orders to members (if ContactId matches)");
  console.log("  7. Store WA ID mappings for orders");
  console.log("  8. Log audit entries for all imports");

  /*
  // === PRODUCT IMPORT ===
  if (importProducts) {
    console.log("\nImporting products...");
    let productCount = 0;

    for (const product of products) {
      // Check if already imported
      const existingMapping = await prisma.waIdMapping.findFirst({
        where: {
          entityType: "Product",
          waId: String(product.waId),
        },
      });

      if (existingMapping) {
        console.log(`  [SKIP] Product ${product.name} already imported`);
        continue;
      }

      // Create product
      const created = await prisma.product.create({
        data: {
          name: product.name,
          slug: generateSlug(product.name),
          description: product.description,
          price: product.price,
          sku: product.sku || `WA-${product.waId}`,
          status: product.status,
          imageUrl: product.imageUrl,
          trackInventory: product.trackInventory,
          stockQuantity: product.availableQuantity,
          category: product.category,
        },
      });

      // Store mapping
      await prisma.waIdMapping.create({
        data: {
          entityType: "Product",
          waId: String(product.waId),
          localId: created.id,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "STORE_PRODUCT_IMPORT",
          entityType: "Product",
          entityId: created.id,
          details: {
            waId: product.waId,
            name: product.name,
            source: "wa-store-api",
          },
          performedBy: null, // System import
        },
      });

      productCount++;
    }

    console.log(`  Imported ${productCount} products`);
  }

  // === ORDER IMPORT ===
  if (importOrders) {
    console.log("\nImporting orders...");
    let orderCount = 0;

    for (const order of orders) {
      // Check if already imported
      const existingMapping = await prisma.waIdMapping.findFirst({
        where: {
          entityType: "Order",
          waId: String(order.waId),
        },
      });

      if (existingMapping) {
        console.log(`  [SKIP] Order #${order.orderNumber} already imported`);
        continue;
      }

      // Find member if ContactId provided
      let memberId: string | null = null;
      if (order.waMemberId) {
        const memberMapping = await prisma.waIdMapping.findFirst({
          where: {
            entityType: "Member",
            waId: String(order.waMemberId),
          },
        });
        memberId = memberMapping?.localId || null;
      }

      // Map line items to product IDs
      const items = await Promise.all(
        order.items.map(async (item) => {
          const productMapping = await prisma.waIdMapping.findFirst({
            where: {
              entityType: "Product",
              waId: String(item.productWaId),
            },
          });

          return {
            productId: productMapping?.localId || null,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.totalPrice,
          };
        })
      );

      // Create order
      const created = await prisma.order.create({
        data: {
          orderNumber: order.orderNumber,
          orderedAt: order.orderDate,
          status: order.status,
          paymentStatus: order.paymentStatus,
          subtotal: order.totalAmount - (order.taxAmount || 0) - (order.shippingAmount || 0),
          taxAmount: order.taxAmount || 0,
          shippingAmount: order.shippingAmount || 0,
          discountAmount: order.discountAmount || 0,
          totalAmount: order.totalAmount,
          memberId: memberId,
          guestName: !memberId ? order.customerName : null,
          guestEmail: !memberId ? order.customerEmail : null,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          notes: order.notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productSnapshot: {
                name: item.productName,
                sku: item.sku,
                price: item.unitPrice,
              },
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      // Store mapping
      await prisma.waIdMapping.create({
        data: {
          entityType: "Order",
          waId: String(order.waId),
          localId: created.id,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: "STORE_ORDER_IMPORT",
          entityType: "Order",
          entityId: created.id,
          details: {
            waId: order.waId,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            itemCount: items.length,
            source: "wa-store-api",
          },
          performedBy: null, // System import
        },
      });

      orderCount++;
    }

    console.log(`  Imported ${orderCount} orders`);
  }

  console.log("\nImport complete!");
  */
}

// Utility: Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

main().catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
