type Member = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type EventItem = {
  id: string;
  title: string;
  category: string;
  startTime: string;
};

type RegistrationItem = {
  id: string;
  memberId: string;
  eventId: string;
  status: string;
};

async function getMembers(): Promise<Member[]> {
  const res = await fetch("/api/members", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch members:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return data.members ?? [];
}

async function getEvents(): Promise<EventItem[]> {
  const res = await fetch("/api/events", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch events:", res.status, res.statusText);
    return [];
  }

  const data = await res.json();
  return data.events ?? [];
}

function resolveMemberName(memberId: string, members: Member[]): string {
  const member = members.find((m) => m.id === memberId);
  if (!member) return memberId;
  return `${member.firstName} ${member.lastName}`;
}

function resolveEventTitle(eventId: string, events: EventItem[]): string {
  const event = events.find((e) => e.id === eventId);
  if (!event) return eventId;
  return event.title;
}

export default async function AdminPage() {
  const [members, events] = await Promise.all([
    getMembers(),
    getEvents(),
  ]);

  // Temporary hard-coded registrations, joined in memory with members and events
  const registrations: RegistrationItem[] = [
    {
      id: "r1",
      memberId: "m1",
      eventId: "e1",
      status: "REGISTERED",
    },
    {
      id: "r2",
      memberId: "m2",
      eventId: "e2",
      status: "WAITLISTED",
    },
  ];

  return (
    <div data-test-id="admin-root" style={{ padding: "20px" }}>
      <header
        data-test-id="admin-header"
        style={{ fontSize: "24px", marginBottom: "20px" }}
      >
        Admin
      </header>

      {/* Members section */}
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Members overview
        </h2>
        <p style={{ marginBottom: "12px" }}>
          This table is backed by the /api/members endpoint. Data is currently
          mocked and will later be replaced with database-backed queries.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
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

      {/* Events section */}
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Events overview
        </h2>
        <p style={{ marginBottom: "12px" }}>
          This table is backed by the /api/events endpoint. Data is currently
          mocked and will later be replaced with database-backed queries.
        </p>
      </section>

      <section style={{ marginBottom: "32px" }}>
        <table
          data-test-id="admin-events-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            maxWidth: "800px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Title
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Category
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Start time
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                data-test-id="admin-events-row"
              >
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {event.title}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {event.category}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {event.startTime}
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr data-test-id="admin-events-empty-state">
                <td
                  colSpan={3}
                  style={{ padding: "8px", fontStyle: "italic", color: "#666" }}
                >
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Registrations section */}
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
          Registrations overview
        </h2>
        <p style={{ marginBottom: "12px" }}>
          This table is currently backed by in-memory mock registrations joined
          with members and events. In the next phase, this will be replaced with
          a database-backed query.
        </p>
      </section>

      <section>
        <table
          data-test-id="admin-registrations-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            maxWidth: "800px",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Member
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Event
              </th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "8px" }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr
                key={registration.id}
                data-test-id="admin-registrations-row"
              >
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {resolveMemberName(registration.memberId, members)}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {resolveEventTitle(registration.eventId, events)}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {registration.status}
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr data-test-id="admin-registrations-empty-state">
                <td
                  colSpan={3}
                  style={{ padding: "8px", fontStyle: "italic", color: "#666" }}
                >
                  No registrations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
