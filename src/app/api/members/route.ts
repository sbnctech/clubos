import { NextResponse } from "next/server";

export async function GET() {
  const members = [
    { id: "m1", firstName: "Alice", lastName: "Johnson", email: "alice@example.com" },
    { id: "m2", firstName: "Bob", lastName: "Smith", email: "bob@example.com" }
  ];

  return NextResponse.json({ members });
}
