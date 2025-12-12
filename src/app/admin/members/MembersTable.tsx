"use client";

import { useState, useEffect } from "react";

type Member = {
  id: string;
  name: string;
  email: string;
  status: string;
  registrationCount: number;
  waitlistedCount: number;
};

type PaginatedResponse = {
  items: Member[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

export default function MembersTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/members?page=${page}&pageSize=${PAGE_SIZE}`
        );
        if (res.ok) {
          const data: PaginatedResponse = await res.json();
          setMembers(data.items ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        // Keep existing state on error
      }
      setLoading(false);
    }
    fetchMembers();
  }, [page]);

  return (
    <>
      <table
        data-test-id="admin-members-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "900px",
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
              Name
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Email
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
              Registrations
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Waitlisted
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} data-test-id="admin-members-row">
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                <a
                  href={`/admin/members/${member.id}`}
                  data-test-id="admin-members-link"
                  style={{ color: "#0066cc", textDecoration: "none" }}
                >
                  {member.name}
                </a>
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {member.email}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {member.status}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {member.registrationCount}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {member.waitlistedCount}
              </td>
            </tr>
          ))}
          {!loading && members.length === 0 && (
            <tr data-test-id="admin-members-empty-state">
              <td
                colSpan={5}
                style={{
                  padding: "8px",
                  fontStyle: "italic",
                  color: "#666",
                }}
              >
                No members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div
        data-test-id="admin-members-pagination"
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          data-test-id="admin-members-pagination-prev"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            cursor: page <= 1 ? "not-allowed" : "pointer",
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          Prev
        </button>
        <span data-test-id="admin-members-pagination-label">
          Page {page} of {totalPages}
        </span>
        <button
          data-test-id="admin-members-pagination-next"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </>
  );
}
