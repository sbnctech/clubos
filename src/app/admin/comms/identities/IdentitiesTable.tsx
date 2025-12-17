"use client";

import { useEffect, useState, useCallback } from "react";

type EmailIdentity = {
  id: string;
  email: string;
  displayName: string;
  description: string | null;
  replyTo: string | null;
  isActive: boolean;
  isDefault: boolean;
  allowedRoles: string[];
  canUse: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  email: string;
  displayName: string;
  description: string;
  replyTo: string;
  allowedRoles: string[];
  isDefault: boolean;
};

const AVAILABLE_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "president", label: "President" },
  { value: "vp-activities", label: "VP Activities" },
  { value: "webmaster", label: "Webmaster" },
];

export default function IdentitiesTable() {
  const [identities, setIdentities] = useState<EmailIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    displayName: "",
    description: "",
    replyTo: "",
    allowedRoles: [],
    isDefault: false,
  });

  const fetchIdentities = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/comms/identities?includeInactive=true");
      if (!res.ok) throw new Error("Failed to fetch identities");
      const data = await res.json();
      setIdentities(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdentities();
  }, [fetchIdentities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const url = editingId
      ? `/api/v1/admin/comms/identities/${editingId}`
      : "/api/v1/admin/comms/identities";

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          replyTo: formData.replyTo || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save identity");
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        email: "",
        displayName: "",
        description: "",
        replyTo: "",
        allowedRoles: [],
        isDefault: false,
      });
      fetchIdentities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleEdit = (identity: EmailIdentity) => {
    setEditingId(identity.id);
    setFormData({
      email: identity.email,
      displayName: identity.displayName,
      description: identity.description || "",
      replyTo: identity.replyTo || "",
      allowedRoles: identity.allowedRoles,
      isDefault: identity.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this identity? It can be reactivated later.")) return;

    try {
      const res = await fetch(`/api/v1/admin/comms/identities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete identity");
      fetchIdentities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedRoles: prev.allowedRoles.includes(role)
        ? prev.allowedRoles.filter((r) => r !== role)
        : [...prev.allowedRoles, role],
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {error && (
        <div style={{ padding: "12px", backgroundColor: "#fee", color: "#c00", marginBottom: "16px", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({
            email: "",
            displayName: "",
            description: "",
            replyTo: "",
            allowedRoles: [],
            isDefault: false,
          });
        }}
        style={{
          padding: "8px 16px",
          backgroundColor: "#0066cc",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "16px",
        }}
        data-test-id="add-identity-button"
      >
        {showForm ? "Cancel" : "Add identity"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
              Email address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="president@sbnewcomers.org"
              required
              disabled={!!editingId}
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              data-test-id="identity-email-input"
            />
            <small style={{ color: "#666" }}>Must be a sbnewcomers.org address</small>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
              Display name *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="SBNC President"
              required
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              data-test-id="identity-display-name-input"
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="For official club communications"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
              Reply-to address
            </label>
            <input
              type="email"
              value={formData.replyTo}
              onChange={(e) => setFormData((p) => ({ ...p, replyTo: e.target.value }))}
              placeholder="Optional - replies go here"
              style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
              Allowed roles
            </label>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {AVAILABLE_ROLES.map((role) => (
                <label key={role.value} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <input
                    type="checkbox"
                    checked={formData.allowedRoles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                  />
                  {role.label}
                </label>
              ))}
            </div>
            <small style={{ color: "#666" }}>Only selected roles can send from this identity</small>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData((p) => ({ ...p, isDefault: e.target.checked }))}
              />
              Set as default identity
            </label>
          </div>

          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#0066cc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            data-test-id="save-identity-button"
          >
            {editingId ? "Update identity" : "Create identity"}
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }} data-test-id="identities-table">
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Display name</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Allowed roles</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Status</th>
            <th style={{ textAlign: "center", padding: "8px" }}>Can use</th>
            <th style={{ textAlign: "right", padding: "8px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {identities.map((identity) => (
            <tr key={identity.id} style={{ borderBottom: "1px solid #eee", opacity: identity.isActive ? 1 : 0.5 }}>
              <td style={{ padding: "8px" }}>
                {identity.email}
                {identity.isDefault && (
                  <span style={{ marginLeft: "8px", fontSize: "12px", backgroundColor: "#0066cc", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
                    Default
                  </span>
                )}
              </td>
              <td style={{ padding: "8px" }}>{identity.displayName}</td>
              <td style={{ padding: "8px" }}>
                {identity.allowedRoles.length > 0
                  ? identity.allowedRoles.join(", ")
                  : <span style={{ color: "#999" }}>Admin only</span>}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  backgroundColor: identity.isActive ? "#e6f4ea" : "#fce8e6",
                  color: identity.isActive ? "#1e7e34" : "#c5221f",
                }}>
                  {identity.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {identity.canUse ? "Yes" : "No"}
              </td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                <button
                  onClick={() => handleEdit(identity)}
                  style={{ marginRight: "8px", padding: "4px 8px", cursor: "pointer" }}
                >
                  Edit
                </button>
                {identity.isActive && (
                  <button
                    onClick={() => handleDelete(identity.id)}
                    style={{ padding: "4px 8px", cursor: "pointer", color: "#c00" }}
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
          {identities.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#666" }}>
                No email identities configured. Add one to start sending emails.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
