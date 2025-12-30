/**
 * Wild Apricot Store API Client
 *
 * Retrieves products and orders from WA accounts for migration.
 * Based on WA Store Admin API (available since release 7.24, Nov 2021).
 *
 * API Reference: https://gethelp.wildapricot.com/en/articles/1873-store-admin-api-call
 *
 * Integration:
 * - Store module schema: prisma/schema.prisma (Product, ProductVariant, Order, OrderItem)
 * - Store module commits: 0a65cc1 (Phases 1-3), d78750f (Phases 4-5)
 * - Import script: scripts/importing/wa_import_store.ts
 *
 * Charter: P1 (audit), P8 (stable contracts), N5 (no mutation without audit)
 */

// ============================================================================
// Types
// ============================================================================

export interface WaApiCredentials {
  /** WA Account ID */
  accountId: string;
  /** WA API key (from Settings > Integrations > Authorized applications) */
  apiKey: string;
}

export interface WaProduct {
  Id: number;
  Name: string;
  Description: string | null;
  Price: number;
  /** SKU/product code */
  Sku: string | null;
  /** Product status */
  Status: "Active" | "Inactive" | "Deleted";
  /** Product image URL */
  ImageUrl: string | null;
  /** Inventory tracking enabled */
  TrackInventory: boolean;
  /** Available quantity (if tracking) */
  AvailableQuantity: number | null;
  /** Product category */
  Category: string | null;
  /** Weight for shipping */
  Weight: number | null;
  /** Tax code */
  TaxCode: string | null;
  /** Product URL on WA site */
  Url: string | null;
  /** Creation date */
  CreatedDate: string;
  /** Last update date */
  UpdatedDate: string | null;
}

export type WaOrderStatus = "Fulfilled" | "Unfulfilled" | "Cancelled";

export type WaPaymentStatus =
  | "NoInvoice"
  | "Paid"
  | "PartiallyPaid"
  | "Unpaid"
  | "Free";

export interface WaOrderItem {
  ProductId: number;
  ProductName: string;
  Sku: string | null;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
}

export interface WaOrder {
  Id: number;
  /** Order number displayed to customer */
  OrderNumber: string;
  /** Order date/time */
  OrderDate: string;
  /** Fulfillment status */
  Status: WaOrderStatus;
  /** Payment status */
  PaymentStatus: WaPaymentStatus;
  /** Total order amount */
  TotalAmount: number;
  /** Tax amount */
  TaxAmount: number | null;
  /** Shipping amount */
  ShippingAmount: number | null;
  /** Discount amount */
  DiscountAmount: number | null;
  /** Line items */
  Items: WaOrderItem[];
  /** Customer contact ID */
  ContactId: number | null;
  /** Customer name */
  CustomerName: string | null;
  /** Customer email */
  CustomerEmail: string | null;
  /** Shipping address */
  ShippingAddress: WaAddress | null;
  /** Billing address */
  BillingAddress: WaAddress | null;
  /** Order notes */
  Notes: string | null;
  /** Invoice ID if generated */
  InvoiceId: number | null;
  /** Payment method used */
  PaymentMethod: string | null;
  /** Tracking number if shipped */
  TrackingNumber: string | null;
  /** Shipping carrier */
  ShippingCarrier: string | null;
}

export interface WaAddress {
  Street1: string | null;
  Street2: string | null;
  City: string | null;
  State: string | null;
  PostalCode: string | null;
  Country: string | null;
}

export interface WaOrderFilters {
  /** Filter by fulfillment status */
  status?: WaOrderStatus;
  /** Filter by payment status */
  paymentStatus?: WaPaymentStatus;
  /** From date (yyyy-mm-dd) */
  from?: string;
  /** To date (yyyy-mm-dd) */
  to?: string;
}

export interface WaStoreImportResult {
  products: WaProduct[];
  orders: WaOrder[];
  errors: Array<{
    type: "product" | "order";
    id?: number;
    error: string;
  }>;
  summary: {
    productsImported: number;
    ordersImported: number;
    totalProductValue: number;
    totalOrderValue: number;
  };
}

// ============================================================================
// API Client
// ============================================================================

const WA_API_BASE = "https://api.wildapricot.org/v2.2";
const WA_AUTH_URL = "https://oauth.wildapricot.org/auth/token";

/**
 * Wild Apricot Store API Client
 */
export class WaStoreApiClient {
  private credentials: WaApiCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(credentials: WaApiCredentials) {
    this.credentials = credentials;
  }

  /**
   * Authenticate with WA API using API key.
   */
  private async authenticate(): Promise<string> {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const authString = Buffer.from(
      `APIKEY:${this.credentials.apiKey}`
    ).toString("base64");

    const response = await fetch(WA_AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&scope=auto",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`WA auth failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    this.accessToken = data.access_token;
    // Set expiry with 5 min buffer
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);

    return this.accessToken;
  }

  /**
   * Make authenticated API request.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const token = await this.authenticate();

    const url = `${WA_API_BASE}/accounts/${this.credentials.accountId}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`WA API error: ${response.status} ${text}`);
    }

    return response.json() as Promise<T>;
  }

  // ============================================================================
  // Products
  // ============================================================================

  /**
   * Retrieve all products.
   */
  async getProducts(): Promise<WaProduct[]> {
    const response = await this.request<{ Products: WaProduct[] }>(
      "GET",
      "/store/products"
    );
    return response.Products || [];
  }

  /**
   * Retrieve a specific product.
   */
  async getProduct(productId: number): Promise<WaProduct> {
    return this.request<WaProduct>("GET", `/store/products/${productId}`);
  }

  // ============================================================================
  // Orders
  // ============================================================================

  /**
   * Retrieve orders with optional filters.
   */
  async getOrders(filters?: WaOrderFilters): Promise<WaOrder[]> {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.set("Status", filters.status);
    }
    if (filters?.paymentStatus) {
      params.set("PaymentStatus", filters.paymentStatus);
    }
    if (filters?.from) {
      params.set("From", filters.from);
    }
    if (filters?.to) {
      params.set("To", filters.to);
    }

    const queryString = params.toString();
    const path = `/store/orders${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<{ Orders: WaOrder[] }>("GET", path);
    return response.Orders || [];
  }

  /**
   * Retrieve a specific order.
   */
  async getOrder(orderId: number): Promise<WaOrder> {
    return this.request<WaOrder>("GET", `/store/orders/${orderId}`);
  }

  /**
   * Update order status.
   * NOTE: This is a mutation - use with caution and audit.
   */
  async setOrderStatus(orderId: number, status: WaOrderStatus): Promise<void> {
    await this.request("PUT", `/store/orders/${orderId}`, { Status: status });
  }

  // ============================================================================
  // Bulk Import
  // ============================================================================

  /**
   * Import all store data (products and orders) for migration.
   */
  async importAll(orderFilters?: WaOrderFilters): Promise<WaStoreImportResult> {
    const result: WaStoreImportResult = {
      products: [],
      orders: [],
      errors: [],
      summary: {
        productsImported: 0,
        ordersImported: 0,
        totalProductValue: 0,
        totalOrderValue: 0,
      },
    };

    // Import products
    try {
      result.products = await this.getProducts();
      result.summary.productsImported = result.products.length;
      result.summary.totalProductValue = result.products.reduce(
        (sum, p) => sum + (p.Price || 0),
        0
      );
    } catch (error) {
      result.errors.push({
        type: "product",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Import orders
    try {
      result.orders = await this.getOrders(orderFilters);
      result.summary.ordersImported = result.orders.length;
      result.summary.totalOrderValue = result.orders.reduce(
        (sum, o) => sum + (o.TotalAmount || 0),
        0
      );
    } catch (error) {
      result.errors.push({
        type: "order",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return result;
  }
}

// ============================================================================
// Conversion to Murmurant Format
// ============================================================================

/**
 * Convert WA product to Murmurant product format.
 * This will be used when the store module is complete.
 */
export interface MurmurantProduct {
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  imageUrl: string | null;
  trackInventory: boolean;
  availableQuantity: number | null;
  category: string | null;
  waId: number; // Original WA ID for mapping
}

export function convertWaProduct(waProduct: WaProduct): MurmurantProduct {
  return {
    name: waProduct.Name,
    description: waProduct.Description,
    price: waProduct.Price,
    sku: waProduct.Sku,
    status:
      waProduct.Status === "Active"
        ? "ACTIVE"
        : waProduct.Status === "Inactive"
          ? "INACTIVE"
          : "DELETED",
    imageUrl: waProduct.ImageUrl,
    trackInventory: waProduct.TrackInventory,
    availableQuantity: waProduct.AvailableQuantity,
    category: waProduct.Category,
    waId: waProduct.Id,
  };
}

/**
 * Convert WA order to Murmurant order format.
 */
export interface MurmurantStoreOrder {
  orderNumber: string;
  orderDate: Date;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "PARTIAL" | "FREE";
  totalAmount: number;
  taxAmount: number | null;
  shippingAmount: number | null;
  discountAmount: number | null;
  items: Array<{
    productWaId: number;
    productName: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  customerName: string | null;
  customerEmail: string | null;
  shippingAddress: WaAddress | null;
  billingAddress: WaAddress | null;
  notes: string | null;
  waId: number; // Original WA ID for mapping
  waMemberId: number | null;
}

export function convertWaOrder(waOrder: WaOrder): MurmurantStoreOrder {
  // Map WA status to Murmurant status
  const statusMap: Record<WaOrderStatus, MurmurantStoreOrder["status"]> = {
    Fulfilled: "FULFILLED",
    Unfulfilled: "PENDING",
    Cancelled: "CANCELLED",
  };

  // Map WA payment status to Murmurant payment status
  const paymentStatusMap: Record<
    WaPaymentStatus,
    MurmurantStoreOrder["paymentStatus"]
  > = {
    Paid: "PAID",
    PartiallyPaid: "PARTIAL",
    Free: "FREE",
    Unpaid: "PENDING",
    NoInvoice: "PENDING",
  };

  return {
    orderNumber: waOrder.OrderNumber,
    orderDate: new Date(waOrder.OrderDate),
    status: statusMap[waOrder.Status] || "PENDING",
    paymentStatus: paymentStatusMap[waOrder.PaymentStatus] || "PENDING",
    totalAmount: waOrder.TotalAmount,
    taxAmount: waOrder.TaxAmount,
    shippingAmount: waOrder.ShippingAmount,
    discountAmount: waOrder.DiscountAmount,
    items: waOrder.Items.map((item) => ({
      productWaId: item.ProductId,
      productName: item.ProductName,
      sku: item.Sku,
      quantity: item.Quantity,
      unitPrice: item.UnitPrice,
      totalPrice: item.TotalPrice,
    })),
    customerName: waOrder.CustomerName,
    customerEmail: waOrder.CustomerEmail,
    shippingAddress: waOrder.ShippingAddress,
    billingAddress: waOrder.BillingAddress,
    notes: waOrder.Notes,
    waId: waOrder.Id,
    waMemberId: waOrder.ContactId,
  };
}

/**
 * Convert all WA store data to Murmurant format.
 */
export function convertWaStoreData(importResult: WaStoreImportResult): {
  products: MurmurantProduct[];
  orders: MurmurantStoreOrder[];
} {
  return {
    products: importResult.products.map(convertWaProduct),
    orders: importResult.orders.map(convertWaOrder),
  };
}
