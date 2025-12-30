"use client";

// Copyright © 2025 Murmurant, Inc.

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type CartData = {
  itemCount: number;
  totalCents: number;
};

/**
 * CartWidget - Shopping cart icon with item count badge
 *
 * Displays in the site header and shows the number of items in cart.
 * Fetches cart data on mount and can be refreshed via the refresh() export.
 */
export default function CartWidget() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/store/cart", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCart({
          itemCount: data.itemCount || 0,
          totalCents: data.totalCents || 0,
        });
      } else {
        setCart({ itemCount: 0, totalCents: 0 });
      }
    } catch {
      setCart({ itemCount: 0, totalCents: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, [fetchCart]);

  const itemCount = cart?.itemCount || 0;

  return (
    <Link href="/store/cart" style={styles.cartLink} aria-label={`Shopping cart with ${itemCount} items`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={styles.cartIcon}
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {!loading && itemCount > 0 && (
        <span style={styles.badge}>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}

/**
 * Dispatch event to refresh cart widget from other components
 */
export function refreshCartWidget() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }
}

const styles: Record<string, React.CSSProperties> = {
  cartLink: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    color: "inherit",
    textDecoration: "none",
  },
  cartIcon: {
    width: "24px",
    height: "24px",
  },
  badge: {
    position: "absolute",
    top: "0",
    right: "0",
    minWidth: "18px",
    height: "18px",
    padding: "0 5px",
    fontSize: "11px",
    fontWeight: "700",
    lineHeight: "18px",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#dc2626",
    borderRadius: "9px",
  },
};
