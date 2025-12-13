import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Validate UUID format to avoid Prisma errors
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  // Fetch event with registrations and member details directly from DB
  const dbEvent = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          registeredAt: "asc",
        },
      },
    },
  });

  if (!dbEvent) {
    notFound();
  }

  const event = {
    id: dbEvent.id,
    title: dbEvent.title,
    category: dbEvent.category ?? "",
    startTime: dbEvent.startTime.toISOString(),
  };

  const registrations = dbEvent.registrations.map((r) => ({
    id: r.id,
    memberId: r.memberId,
    memberName: `${r.member.firstName} ${r.member.lastName}`,
    status: r.status,
    registeredAt: r.registeredAt.toISOString(),
  }));

  return (
    <div data-test-id="admin-event-detail-root" style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>{event.title}</h1>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Category:</strong>{" "}
          <span data-test-id="admin-event-detail-category">{event.category}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <strong>Start time:</strong>{" "}
          <span data-test-id="admin-event-detail-start-time">{event.startTime}</span>
        </div>
      </div>

      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Registrations</h2>

      <table
        data-test-id="admin-event-detail-registrations-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "600px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Member
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Status
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Registered at
            </th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} data-test-id="admin-event-detail-registration-row">
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.memberName}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.status}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.registeredAt}
              </td>
            </tr>
          ))}
          {registrations.length === 0 && (
            <tr>
              <td
                colSpan={3}
                data-test-id="admin-event-detail-empty"
                style={{
                  padding: "8px",
                  fontStyle: "italic",
                  color: "#666",
                }}
              >
                No registrations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
