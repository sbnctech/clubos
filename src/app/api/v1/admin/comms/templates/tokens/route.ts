// Copyright (c) Santa Barbara Newcomers Club
// Available Template Tokens API
// Charter: P4 (no hidden rules - tokens are documented)

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { getAvailableTokens } from "@/lib/publishing/email";

/**
 * GET /api/v1/admin/comms/templates/tokens
 *
 * Get all available template tokens with documentation
 */
export async function GET(request: NextRequest) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const tokens = getAvailableTokens();

  return NextResponse.json({
    tokens,
    usage: "Tokens use {{category.field}} syntax. Example: {{member.firstName}}",
    notes: [
      "All token values are HTML-escaped for safety",
      "Missing values render as empty strings",
      "Custom tokens can be added via the custom.* namespace",
    ],
  });
}
