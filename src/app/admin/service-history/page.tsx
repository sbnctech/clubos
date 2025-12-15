import ServiceHistoryTable from "./ServiceHistoryTable";

export default function ServiceHistoryExplorerPage() {
  return (
    <div data-test-id="admin-service-history-root" style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
        Service History Explorer
      </h1>
      <p style={{ marginBottom: "16px" }}>
        Browse all member service records including board positions, committee
        roles, and event hosting.
      </p>

      <ServiceHistoryTable />
    </div>
  );
}
