"use client";

// Copyright © 2025 Murmurant, Inc.

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatClubDate } from "@/lib/timezone";

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenueCents: number;
  todayOrders: number;
  todayRevenueCents: number;
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrder[];
};

type LowStockProduct = {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  lowStockThreshold: number;
  variantName?: string;
};

type RecentOrder = {
  id: string;
  orderNumber: number;
  status: string;
  customerName: string;
  totalCents: number;
  createdAt: string;
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
  PAID: { label: "Paid", color: "#166534", bg: "#dcfce7" },
  PROCESSING: { label: "Processing", color: "#1d4ed8", bg: "#dbeafe" },
  SHIPPED: { label: "Shipped", color: "#7c3aed", bg: "#ede9fe" },
  READY_FOR_PICKUP: { label: "Ready", color: "#0369a1", bg: "#e0f2fe" },
  DELIVERED: { label: "Delivered", color: "#166534", bg: "#dcfce7" },
  PICKED_UP: { label: "Picked Up", color: "#166534", bg: "#dcfce7" },
  COMPLETED: { label: "Completed", color: "#166534", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fef2f2" },
  REFUND_PENDING: { label: "Refund Pending", color: "#92400e", bg: "#fef3c7" },
  REFUNDED: { label: "Refunded", color: "#6b7280", bg: "#f3f4f6" },
};

export default function AdminStoreDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/store/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  if (error || !stats) {
    return <div style={styles.error}>{error || "Failed to load dashboard"}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Store Dashboard</h1>
        <div style={styles.actions}>
          <Link href="/admin/store/products" style={styles.actionButton}>
            Manage Products
          </Link>
          <Link href="/admin/store/orders" style={styles.actionButtonPrimary}>
            View Orders
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Revenue</div>
          <div style={styles.statValue}>{formatPrice(stats.totalRevenueCents)}</div>
          <div style={styles.statSubtext}>{stats.completedOrders} completed orders</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Today</div>
          <div style={styles.statValue}>{formatPrice(stats.todayRevenueCents)}</div>
          <div style={styles.statSubtext}>{stats.todayOrders} orders</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Pending Orders</div>
          <div style={{ ...styles.statValue, color: stats.pendingOrders > 0 ? "#dc2626" : "#1f2937" }}>
            {stats.pendingOrders}
          </div>
          <div style={styles.statSubtext}>require attention</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Orders</div>
          <div style={styles.statValue}>{stats.totalOrders}</div>
          <div style={styles.statSubtext}>all time</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {stats.lowStockProducts.length > 0 && (
        <div style={styles.alertCard}>
          <h2 style={styles.alertTitle}>Low Stock Alert</h2>
          <div style={styles.alertList}>
            {stats.lowStockProducts.map((product, idx) => (
              <Link
                key={`${product.id}-${idx}`}
                href={`/admin/store/products/${product.id}`}
                style={styles.alertItem}
              >
                <div style={styles.alertItemName}>
                  {product.name}
                  {product.variantName && (
                    <span style={styles.alertItemVariant}> - {product.variantName}</span>
                  )}
                </div>
                <div style={styles.alertItemStock}>
                  <span style={styles.stockBadge}>
                    {product.quantity} left
                  </span>
                  <span style={styles.thresholdText}>
                    (threshold: {product.lowStockThreshold})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/store/orders" style={styles.viewAllLink}>
            View All
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div style={styles.emptyState}>No orders yet</div>
        ) : (
          <div style={styles.ordersList}>
            {stats.recentOrders.map((order) => {
              const statusInfo = STATUS_BADGES[order.status] || {
                label: order.status,
                color: "#6b7280",
                bg: "#f3f4f6",
              };
              return (
                <Link
                  key={order.id}
                  href={`/admin/store/orders/${order.id}`}
                  style={styles.orderRow}
                >
                  <div style={styles.orderInfo}>
                    <span style={styles.orderNumber}>#{order.orderNumber}</span>
                    <span style={styles.orderCustomer}>{order.customerName}</span>
                  </div>
                  <div style={styles.orderMeta}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <span style={styles.orderAmount}>{formatPrice(order.totalCents)}</span>
                    <span style={styles.orderDate}>{formatClubDate(new Date(order.createdAt))}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActions}>
          <Link href="/admin/store/products/new" style={styles.quickAction}>
            <span style={styles.quickActionIcon}>+</span>
            Add New Product
          </Link>
          <Link href="/admin/store/orders?status=PAID" style={styles.quickAction}>
            <span style={styles.quickActionIcon}>!</span>
            Orders to Fulfill
          </Link>
          <Link href="/store" style={styles.quickAction} target="_blank">
            <span style={styles.quickActionIcon}>↗</span>
            View Public Store
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "24px", maxWidth: "1200px" },
  loading: { textAlign: "center", padding: "60px", color: "#6b7280" },
  error: { textAlign: "center", padding: "60px", color: "#dc2626" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  actions: { display: "flex", gap: "12px" },
  actionButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    textDecoration: "none",
  },
  actionButtonPrimary: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#fff",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "8px",
    textDecoration: "none",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  statLabel: { fontSize: "13px", color: "#6b7280", marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  statSubtext: { fontSize: "12px", color: "#9ca3af", marginTop: "4px" },
  alertCard: {
    padding: "20px",
    backgroundColor: "#fef3c7",
    borderRadius: "12px",
    border: "1px solid #fcd34d",
    marginBottom: "32px",
  },
  alertTitle: { fontSize: "16px", fontWeight: "600", color: "#92400e", marginBottom: "16px" },
  alertList: { display: "flex", flexDirection: "column", gap: "8px" },
  alertItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    color: "inherit",
  },
  alertItemName: { fontWeight: "500", color: "#1f2937" },
  alertItemVariant: { fontWeight: "400", color: "#6b7280" },
  alertItemStock: { display: "flex", alignItems: "center", gap: "8px" },
  stockBadge: {
    padding: "4px 10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    borderRadius: "12px",
  },
  thresholdText: { fontSize: "12px", color: "#6b7280" },
  section: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    padding: "24px",
    marginBottom: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: { fontSize: "18px", fontWeight: "600", color: "#1f2937" },
  viewAllLink: { fontSize: "14px", color: "#2563eb", textDecoration: "none" },
  emptyState: { textAlign: "center", padding: "40px", color: "#6b7280" },
  ordersList: { display: "flex", flexDirection: "column", gap: "8px" },
  orderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    textDecoration: "none",
    color: "inherit",
  },
  orderInfo: { display: "flex", gap: "12px", alignItems: "center" },
  orderNumber: { fontWeight: "600", color: "#1f2937" },
  orderCustomer: { color: "#6b7280" },
  orderMeta: { display: "flex", alignItems: "center", gap: "16px" },
  statusBadge: {
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "20px",
  },
  orderAmount: { fontWeight: "600", color: "#1f2937" },
  orderDate: { fontSize: "13px", color: "#6b7280" },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#374151",
    fontWeight: "500",
  },
  quickActionIcon: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700",
  },
};
