"use client";

// Copyright © 2025 Murmurant, Inc.

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "PHYSICAL" | "DIGITAL";
  priceCents: number;
  memberPriceCents: number | null;
  comparePriceCents: number | null;
  imageUrl: string | null;
  inStock: boolean;
  variantCount: number;
};

type ProductsResponse = {
  items: Product[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const PRODUCT_TYPES = [
  { value: "", label: "All Products" },
  { value: "PHYSICAL", label: "Physical" },
  { value: "DIGITAL", label: "Digital" },
];

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "price", label: "Price (Low to High)" },
  { value: "-price", label: "Price (High to Low)" },
  { value: "newest", label: "Newest First" },
];

export default function ProductCatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state from URL params
  const type = searchParams.get("type") || "";
  const sort = searchParams.get("sort") || "name";
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change
      if (!updates.page) {
        params.delete("page");
      }
      router.push(`/store/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (sort) params.set("sort", sort);
      if (query) params.set("q", query);
      if (page > 1) params.set("page", String(page));

      const res = await fetch(`/api/store/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data: ProductsResponse = await res.json();
      setProducts(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [type, sort, query, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Shop</h1>
        <p style={styles.subtitle}>
          Browse our collection of merchandise and digital products
        </p>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => updateParams({ q: e.target.value })}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            value={type}
            onChange={(e) => updateParams({ type: e.target.value })}
            style={styles.select}
          >
            {PRODUCT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            style={styles.select}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={styles.resultsInfo}>
        {loading ? (
          "Loading..."
        ) : (
          <>
            Showing {products.length} of {totalItems} products
          </>
        )}
      </div>

      {/* Product grid */}
      {loading ? (
        <div style={styles.loading}>Loading products...</div>
      ) : products.length === 0 ? (
        <div style={styles.empty}>
          <p>No products found</p>
          {(type || query) && (
            <button
              onClick={() => router.push("/store/products")}
              style={styles.clearButton}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/products/${product.slug}`}
              style={styles.productCard}
            >
              <div style={styles.imageContainer}>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.placeholderImage}>
                    {product.type === "DIGITAL" ? "📄" : "📦"}
                  </div>
                )}
                {!product.inStock && (
                  <div style={styles.outOfStock}>Out of Stock</div>
                )}
                {product.type === "DIGITAL" && (
                  <div style={styles.digitalBadge}>Digital</div>
                )}
              </div>

              <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                {product.description && (
                  <p style={styles.productDescription}>
                    {product.description.slice(0, 80)}
                    {product.description.length > 80 ? "..." : ""}
                  </p>
                )}

                <div style={styles.priceRow}>
                  {product.comparePriceCents && (
                    <span style={styles.comparePrice}>
                      {formatPrice(product.comparePriceCents)}
                    </span>
                  )}
                  <span style={styles.price}>
                    {formatPrice(product.priceCents)}
                  </span>
                  {product.memberPriceCents && (
                    <span style={styles.memberPrice}>
                      Members: {formatPrice(product.memberPriceCents)}
                    </span>
                  )}
                </div>

                {product.variantCount > 0 && (
                  <span style={styles.variantInfo}>
                    {product.variantCount} options
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={page <= 1}
            style={{
              ...styles.pageButton,
              opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages}
            style={{
              ...styles.pageButton,
              opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  header: { textAlign: "center", marginBottom: "32px" },
  title: { fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" },
  subtitle: { fontSize: "16px", color: "#6b7280" },
  filters: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
  },
  filterGroup: { flex: "1 1 200px" },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  resultsInfo: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  loading: { textAlign: "center", padding: "60px", color: "#6b7280" },
  empty: { textAlign: "center", padding: "60px", color: "#6b7280" },
  clearButton: {
    marginTop: "16px",
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  productCard: {
    textDecoration: "none",
    color: "inherit",
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  imageContainer: {
    position: "relative",
    aspectRatio: "1",
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    backgroundColor: "#f3f4f6",
  },
  outOfStock: {
    position: "absolute",
    top: "12px",
    left: "12px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#991b1b",
    backgroundColor: "#fef2f2",
    borderRadius: "20px",
  },
  digitalBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1d4ed8",
    backgroundColor: "#dbeafe",
    borderRadius: "20px",
  },
  productInfo: { padding: "16px" },
  productName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
  },
  productDescription: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "12px",
    lineHeight: "1.4",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  price: { fontSize: "18px", fontWeight: "700", color: "#1f2937" },
  comparePrice: {
    fontSize: "14px",
    color: "#9ca3af",
    textDecoration: "line-through",
  },
  memberPrice: {
    fontSize: "12px",
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  variantInfo: { fontSize: "12px", color: "#6b7280", marginTop: "8px", display: "block" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "32px",
  },
  pageButton: {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageInfo: { fontSize: "14px", color: "#6b7280" },
};
