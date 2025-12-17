import EmailComposer from "./EmailComposer";

export default function AdminComposeEmailPage() {
  return (
    <div data-test-id="admin-comms-compose-root" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "12px" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Compose email</h1>
      </div>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        Compose and send emails using templates or custom content.
        Select a from-address, recipients, and schedule delivery.
      </p>

      <EmailComposer />
    </div>
  );
}
