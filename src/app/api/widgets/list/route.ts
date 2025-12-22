import { NextResponse } from "next/server";
import { runListGadget } from "@/lib/widgets/listGadgetRuntime";

export async function POST(request: Request) {
  const body = await request.json();
  void body;

  await runListGadget(
    { templateId: "TODO", params: {} },
    { memberId: null, roleIds: [], scopes: [] },
  );

  return NextResponse.json({ error: "TODO" }, { status: 501 });
}
