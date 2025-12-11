type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

async function getMembers(): Promise<Member[]> {
  const res = await fetch("http://localhost:3000/api/members", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch members:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return data.members ?? [];
}

export default async function AdminPage() {
  const members = await getMembers();

  return (
    <div data-test-id="admin-root" style={{ padding: "20px" }}>
      <header
        data-test-id="admin-header"
        style={{ fontSize: "24px", marginBottom: "20px" }}
      >
        Admin
      </header>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Members overview
        </h2>
        <p style={{ marginBottom: "12px" }}>
          This table is backed by the /api/members endpoint. Data is currently
          mocked and will later be replaced with database-backed queries.
        </p>
      </section>

      <section>
        <table
          data-test-id="admin-members-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            maxWidth: "800px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Name
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                data-test-id="admin-members-row"
              >
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {member.firstName} {member.lastName}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {member.email}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr data-test-id="admin-members-empty-state">
                <td
                  colSpan={2}
                  style={{ padding: "8px", fontStyle: "italic", color: "#666" }}
                >
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
