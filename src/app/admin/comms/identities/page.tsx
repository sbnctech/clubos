import IdentitiesTable from "./IdentitiesTable";

export default function AdminEmailIdentitiesPage() {
  return (
    <div data-test-id="admin-comms-identities-root" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h1 style={{ fontSize: "24px", margin: 0 }}>Email identities</h1>
      </div>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        Manage sender identities (from-addresses) for sbnewcomers.org emails.
        Each identity can be restricted to specific roles.
      </p>

      <IdentitiesTable />
    </div>
  );
}
