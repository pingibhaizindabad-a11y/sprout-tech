import { NextResponse } from "next/server";
import { runMatchingForGroup } from "@/app/admin/actions";

/** POST /api/match — run matching for a group. Requires Authorization: Bearer <ADMIN_SECRET>. */
export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim() ?? authHeader?.trim();
  const secret = process.env.ADMIN_SECRET;
  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { groupId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const groupId = body.groupId;
  if (!groupId || typeof groupId !== "string") {
    return NextResponse.json({ error: "Missing groupId" }, { status: 400 });
  }
  const result = await runMatchingForGroup(groupId, { skipOwnershipCheck: true });
  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    matched: result.matched ?? 0,
    unmatched: result.unmatched ?? 0,
    trios: result.trios ?? 0,
  });
}
