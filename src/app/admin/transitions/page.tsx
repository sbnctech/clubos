import TransitionsTable from "./TransitionsTable";

const adminToken =
  process.env.NODE_ENV !== "production"
    ? process.env.ADMIN_E2E_TOKEN ?? "dev-admin-token"
    : undefined;

export default function TransitionsListPage() {
  return (
    <div data-test-id="admin-transitions-root" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: 0 }}>Transition Plans</h1>
      </div>
      <p style={{ marginBottom: "16px" }}>
        Manage leadership transition plans for scheduled role changes on Feb 1
        and Aug 1.
      </p>

      <TransitionsTable adminToken={adminToken} />
    </div>
  );
}
