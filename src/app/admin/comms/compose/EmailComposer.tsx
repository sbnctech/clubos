"use client";

import { useEffect, useState, useCallback } from "react";

type EmailIdentity = {
  id: string;
  email: string;
  displayName: string;
  canUse: boolean;
};

type MessageTemplate = {
  id: string;
  name: string;
  slug: string;
  subject: string;
};

type Recipient = {
  email: string;
  name: string;
};

type PreviewData = {
  subject: string;
  html: string;
};

export default function EmailComposer() {
  const [identities, setIdentities] = useState<EmailIdentity[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedIdentityId, setSelectedIdentityId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [sendImmediately, setSendImmediately] = useState(false);

  // Preview state
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [identitiesRes, templatesRes] = await Promise.all([
        fetch("/api/v1/admin/comms/identities?onlyUsable=true"),
        fetch("/api/v1/admin/comms/templates"),
      ]);

      if (!identitiesRes.ok || !templatesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [identitiesData, templatesData] = await Promise.all([
        identitiesRes.json(),
        templatesRes.json(),
      ]);

      setIdentities(identitiesData.items);
      setTemplates(templatesData.items);

      // Set default identity
      const defaultIdentity = identitiesData.items.find((i: EmailIdentity) => i.canUse);
      if (defaultIdentity) {
        setSelectedIdentityId(defaultIdentity.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // When template is selected, populate subject
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setSubject(template.subject);
      }
    }
  }, [selectedTemplateId, templates]);

  const addRecipient = () => {
    if (!newRecipientEmail) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipientEmail)) {
      setError("Invalid email address");
      return;
    }

    if (recipients.some((r) => r.email === newRecipientEmail)) {
      setError("Recipient already added");
      return;
    }

    setRecipients([...recipients, { email: newRecipientEmail, name: newRecipientName }]);
    setNewRecipientEmail("");
    setNewRecipientName("");
    setError(null);
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r.email !== email));
  };

  const handlePreview = async () => {
    if (!selectedTemplateId) {
      setError("Select a template to preview");
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/comms/templates/${selectedTemplateId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to generate preview");

      const data = await res.json();
      setPreview({
        subject: data.preview.subject,
        html: data.preview.html,
      });
      setShowPreview(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleTestSend = async () => {
    const testEmail = prompt("Enter email address for test send:");
    if (!testEmail) return;

    if (!selectedTemplateId || !selectedIdentityId) {
      setError("Select a template and identity first");
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/comms/templates/${selectedTemplateId}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          identityId: selectedIdentityId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to send test email");
      }

      const data = await res.json();
      setSuccess(`Test email sent to ${testEmail} (ID: ${data.messageId})`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSuccess(null);
    }
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);

    if (!selectedIdentityId) {
      setError("Select a sender identity");
      return;
    }

    if (recipients.length === 0) {
      setError("Add at least one recipient");
      return;
    }

    if (!selectedTemplateId && !subject) {
      setError("Select a template or enter a subject");
      return;
    }

    const payload: Record<string, unknown> = {
      identityId: selectedIdentityId,
      recipients: recipients.map((r) => ({ email: r.email, name: r.name || undefined })),
      sendImmediately,
    };

    if (selectedTemplateId) {
      payload.templateId = selectedTemplateId;
    } else {
      payload.subject = subject;
      payload.bodyHtml = bodyHtml || "<p>No content</p>";
    }

    if (scheduledFor) {
      payload.scheduledFor = new Date(scheduledFor).toISOString();
    }

    try {
      const res = await fetch("/api/v1/admin/comms/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to send email");
      }

      const data = await res.json();
      const statusMsg = sendImmediately
        ? `Sent ${data.outboxCount} email(s)`
        : scheduledFor
          ? `Scheduled ${data.outboxCount} email(s)`
          : `Queued ${data.outboxCount} email(s) as drafts`;

      setSuccess(statusMsg);
      setRecipients([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: "800px" }}>
      {error && (
        <div style={{ padding: "12px", backgroundColor: "#fee", color: "#c00", marginBottom: "16px", borderRadius: "4px" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "12px", backgroundColor: "#e6f4ea", color: "#1e7e34", marginBottom: "16px", borderRadius: "4px" }}>
          {success}
        </div>
      )}

      {/* From Address */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
          From address *
        </label>
        <select
          value={selectedIdentityId}
          onChange={(e) => setSelectedIdentityId(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
          data-test-id="identity-select"
        >
          <option value="">Select sender identity...</option>
          {identities.map((identity) => (
            <option key={identity.id} value={identity.id}>
              {identity.displayName} &lt;{identity.email}&gt;
            </option>
          ))}
        </select>
        {identities.length === 0 && (
          <small style={{ color: "#c00" }}>No identities available. You may not have permission to send emails.</small>
        )}
      </div>

      {/* Template Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
          Template
        </label>
        <select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
          data-test-id="template-select"
        >
          <option value="">No template (custom email)</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {selectedTemplateId && (
          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={handlePreview}
              style={{ padding: "6px 12px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handleTestSend}
              style={{ padding: "6px 12px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              Test send
            </button>
          </div>
        )}
      </div>

      {/* Custom Subject (if no template) */}
      {!selectedTemplateId && (
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line"
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
            data-test-id="subject-input"
          />
        </div>
      )}

      {/* Custom Body (if no template) */}
      {!selectedTemplateId && (
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
            Body (HTML)
          </label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            placeholder="<p>Your email content here...</p>"
            rows={8}
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px", fontFamily: "monospace" }}
            data-test-id="body-input"
          />
        </div>
      )}

      {/* Recipients */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
          Recipients *
        </label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input
            type="email"
            value={newRecipientEmail}
            onChange={(e) => setNewRecipientEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ flex: 2, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            data-test-id="recipient-email-input"
          />
          <input
            type="text"
            value={newRecipientName}
            onChange={(e) => setNewRecipientName(e.target.value)}
            placeholder="Name (optional)"
            style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button
            type="button"
            onClick={addRecipient}
            style={{ padding: "8px 16px", cursor: "pointer", borderRadius: "4px", border: "1px solid #ccc" }}
            data-test-id="add-recipient-button"
          >
            Add
          </button>
        </div>
        {recipients.length > 0 && (
          <div style={{ border: "1px solid #eee", borderRadius: "4px", padding: "8px" }}>
            {recipients.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                <span>
                  {r.name ? `${r.name} <${r.email}>` : r.email}
                </span>
                <button
                  type="button"
                  onClick={() => removeRecipient(r.email)}
                  style={{ color: "#c00", cursor: "pointer", border: "none", background: "none" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {recipients.length === 0 && (
          <small style={{ color: "#666" }}>Add recipients above or select a mailing list</small>
        )}
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
          Schedule (optional)
        </label>
        <input
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          data-test-id="schedule-input"
        />
      </div>

      {/* Send Options */}
      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={sendImmediately}
            onChange={(e) => setSendImmediately(e.target.checked)}
          />
          Send immediately (skip queue)
        </label>
      </div>

      {/* Send Button */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={handleSend}
          disabled={!selectedIdentityId || recipients.length === 0}
          style={{
            padding: "12px 24px",
            backgroundColor: sendImmediately ? "#0066cc" : "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            opacity: (!selectedIdentityId || recipients.length === 0) ? 0.5 : 1,
          }}
          data-test-id="send-button"
        >
          {sendImmediately ? "Send now" : scheduledFor ? "Schedule" : "Save as draft"}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && preview && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "24px",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflow: "auto",
            width: "90%",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Email preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                style={{ cursor: "pointer", border: "none", background: "none", fontSize: "20px" }}
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <strong>Subject:</strong> {preview.subject}
            </div>
            <div style={{ border: "1px solid #eee", borderRadius: "4px", padding: "16px" }}>
              <div dangerouslySetInnerHTML={{ __html: preview.html }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
