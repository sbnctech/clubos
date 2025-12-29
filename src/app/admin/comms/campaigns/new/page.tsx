/**
 * Create New Campaign Page
 *
 * P1.3: Message Composer (Send Flow)
 * Multi-step wizard for creating and sending email campaigns.
 *
 * Charter: P6 (human-first UI), P2 (capability-scoped actions), P1 (audit)
 *
 * Copyright (c) Murmurant, Inc.
 */

import Link from "next/link";
import MessageComposer from "./MessageComposer";

export default function NewCampaignPage() {
  return (
    <div data-test-id="admin-campaign-new" style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link
          href="/admin/comms/campaigns"
          style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none" }}
        >
          &larr; Back to campaigns
        </Link>
      </div>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "20px" }}>
        Create Email Campaign
      </h1>
      <MessageComposer />
    </div>
  );
}
