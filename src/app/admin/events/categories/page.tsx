"use client";

/**
 * Event Category Management Page
 *
 * Admin interface for managing event categories with CRUD operations,
 * color badges, event counts, and reordering capabilities.
 *
 * Charter: P3 (state machines), P6 (human-first UI)
 */

import { useState, useCallback } from "react";

interface EventCategory {
  id: string;
  name: string;
  color: string;
  description: string;
  eventCount: number;
  sortOrder: number;
}

const PRESET_COLORS = [
  "#2563eb", // Blue
  "#7c3aed", // Purple
  "#059669", // Green
  "#dc2626", // Red
  "#ea580c", // Orange
  "#ca8a04", // Yellow
  "#0891b2", // Cyan
  "#be185d", // Pink
  "#4b5563", // Gray
  "#1e293b", // Slate
];

const INITIAL_CATEGORIES: EventCategory[] = [
  { id: "1", name: "Social", color: "#2563eb", description: "Social gatherings and mixers", eventCount: 12, sortOrder: 1 },
  { id: "2", name: "Day Trip", color: "#059669", description: "Day excursions and outings", eventCount: 8, sortOrder: 2 },
  { id: "3", name: "Workshop", color: "#7c3aed", description: "Educational workshops and classes", eventCount: 5, sortOrder: 3 },
  { id: "4", name: "Luncheon", color: "#ea580c", description: "Monthly luncheon meetings", eventCount: 11, sortOrder: 4 },
  { id: "5", name: "Wine & Dine", color: "#be185d", description: "Dining experiences and wine tastings", eventCount: 6, sortOrder: 5 },
  { id: "6", name: "Outdoor", color: "#0891b2", description: "Hiking, golf, and outdoor activities", eventCount: 9, sortOrder: 6 },
  { id: "7", name: "Cultural", color: "#ca8a04", description: "Arts, theater, and museum visits", eventCount: 4, sortOrder: 7 },
  { id: "8", name: "Board Meeting", color: "#4b5563", description: "Board and committee meetings", eventCount: 3, sortOrder: 8 },
];

function CategoryBadge({ color, name }: { color: string; name: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: color,
        color: "#ffffff",
        padding: "4px 12px",
        borderRadius: "16px",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {name}
    </span>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  category: EventCategory;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "12px 16px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* Reorder arrows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          style={{
            background: "none",
            border: "none",
            cursor: isFirst ? "not-allowed" : "pointer",
            opacity: isFirst ? 0.3 : 1,
            fontSize: "14px",
            padding: "2px",
          }}
          title="Move up"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          style={{
            background: "none",
            border: "none",
            cursor: isLast ? "not-allowed" : "pointer",
            opacity: isLast ? 0.3 : 1,
            fontSize: "14px",
            padding: "2px",
          }}
          title="Move down"
        >
          ▼
        </button>
      </div>

      {/* Category badge */}
      <div style={{ width: "140px" }}>
        <CategoryBadge color={category.color} name={category.name} />
      </div>

      {/* Description */}
      <div style={{ flex: 1, color: "#6b7280", fontSize: "14px" }}>
        {category.description}
      </div>

      {/* Event count */}
      <div style={{ width: "80px", textAlign: "center" }}>
        <span
          style={{
            backgroundColor: "#f3f4f6",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "13px",
            color: "#374151",
          }}
        >
          {category.eventCount} events
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onEdit}
          style={{
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            backgroundColor: category.eventCount > 0 ? "#fef2f2" : "#f3f4f6",
            color: category.eventCount > 0 ? "#dc2626" : "#374151",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: EventCategory | null;
  onSave: (cat: Omit<EventCategory, "id" | "eventCount" | "sortOrder">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || PRESET_COLORS[0]);
  const [description, setDescription] = useState(category?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), color, description: description.trim() });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          maxWidth: "90vw",
        }}
      >
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600 }}>
          {category ? "Edit Category" : "Add Category"}
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
            Color
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: c,
                  border: color === c ? "3px solid #1f2937" : "2px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this category"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {category ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteConfirmModal({
  category,
  onConfirm,
  onCancel,
}: {
  category: EventCategory;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const hasEvents = category.eventCount > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          width: "400px",
          maxWidth: "90vw",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 600, color: "#dc2626" }}>
          Delete Category
        </h3>

        {hasEvents ? (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: 0, color: "#991b1b", fontSize: "14px" }}>
              <strong>Warning:</strong> This category has {category.eventCount} event(s) assigned.
              Deleting it will leave those events without a category.
            </p>
          </div>
        ) : null}

        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
          Are you sure you want to delete the &ldquo;{category.name}&rdquo; category?
          This action cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Delete Category
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventCategoriesPage() {
  const [categories, setCategories] = useState<EventCategory[]>(INITIAL_CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<EventCategory | null>(null);

  const handleSave = useCallback(
    (data: Omit<EventCategory, "id" | "eventCount" | "sortOrder">) => {
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...data } : c
          )
        );
      } else {
        const newCategory: EventCategory = {
          id: Date.now().toString(),
          ...data,
          eventCount: 0,
          sortOrder: categories.length + 1,
        };
        setCategories((prev) => [...prev, newCategory]);
      }
      setShowForm(false);
      setEditingCategory(null);
    },
    [editingCategory, categories.length]
  );

  const handleDelete = useCallback(() => {
    if (deletingCategory) {
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeletingCategory(null);
    }
  }, [deletingCategory]);

  const handleMoveUp = useCallback((index: number) => {
    if (index === 0) return;
    setCategories((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setCategories((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((c, i) => ({ ...c, sortOrder: i + 1 }));
    });
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: 700, color: "#1f2937" }}>
            Event Categories
          </h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
            Manage categories for organizing club events
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          + Add Category
        </button>
      </div>

      {/* Categories list */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            fontSize: "12px",
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
          }}
        >
          <div style={{ width: "40px" }}>Order</div>
          <div style={{ width: "140px" }}>Category</div>
          <div style={{ flex: 1 }}>Description</div>
          <div style={{ width: "80px", textAlign: "center" }}>Events</div>
          <div style={{ width: "140px" }}>Actions</div>
        </div>

        {/* Category rows */}
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            category={category}
            onEdit={() => {
              setEditingCategory(category);
              setShowForm(true);
            }}
            onDelete={() => setDeletingCategory(category)}
            onMoveUp={() => handleMoveUp(index)}
            onMoveDown={() => handleMoveDown(index)}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}

        {categories.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            No categories yet. Click &ldquo;Add Category&rdquo; to create one.
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingCategory && (
        <DeleteConfirmModal
          category={deletingCategory}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </div>
  );
}
