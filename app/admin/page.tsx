import { redirect } from "next/navigation";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getAdminUid } from "./actions";
import { AdminPanel } from "./AdminPanel";
import type { AdminGroup, AdminUser, AdminMatch } from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminUid = await getAdminUid();
  if (!adminUid) {
    return null;
  }

  const db = getAdminFirestoreIfConfigured();
  if (!db) {
    return (
      <div className="min-h-[calc(100vh-61px)] bg-[var(--bg)]">
        <main className="mx-auto max-w-lg px-6 py-12">
          <h1 className="font-serif text-2xl">Admin</h1>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-[var(--text)]">
            <p className="font-medium">Firebase not configured</p>
            <p className="mt-2 text-sm">Configure Firebase credentials in your environment.</p>
          </div>
        </main>
      </div>
    );
  }

  const groupsSnap = await db.collection("groups").where("owner_id", "==", adminUid).get();
  const groupDocs = groupsSnap.docs.sort((a, b) => {
    const ta = (a.data().created_at as { toMillis?: () => number })?.toMillis?.() ?? 0;
    const tb = (b.data().created_at as { toMillis?: () => number })?.toMillis?.() ?? 0;
    return tb - ta;
  });
  const ownedGroupIds = new Set(groupDocs.map((d) => d.id));

  const groupById = new Map<string, { name: string; code: string }>();
  groupDocs.forEach((d) => {
    const data = d.data();
    groupById.set(d.id, { name: data.name as string, code: data.code as string });
  });

  const usersSnap = await db.collection("users").get();
  const userDocs = usersSnap.docs.filter((d) => ownedGroupIds.has((d.data().group_id as string) ?? ""));
  const responsesSnap = await db.collection("questionnaire_responses").get();
  const submittedUserIds = new Set<string>();
  responsesSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.submitted_at != null) submittedUserIds.add(data.user_id as string);
  });

  const matchesSnap = await db.collection("matches").get();
  const matchDocs = matchesSnap.docs.filter((d) => ownedGroupIds.has((d.data().group_id as string) ?? ""));
  const matchedUserIds = new Set<string>();
  matchDocs.forEach((d) => {
    const userIds = (d.data().user_ids as string[]) ?? [];
    userIds.forEach((id) => matchedUserIds.add(id));
  });

  const groups: AdminGroup[] = groupDocs.map((d) => {
    const data = d.data();
    const id = d.id;
    const memberCount = userDocs.filter((u) => u.data().group_id === id).length;
    const hasMatches = matchDocs.some((m) => (m.data().group_id as string) === id);
    return {
      id,
      name: data.name as string,
      code: data.code as string,
      is_active: (data.is_active as boolean) ?? true,
      member_count: memberCount,
      has_matches: hasMatches,
    };
  });

  const groupHasMatches = new Set(matchDocs.map((m) => m.data().group_id as string));

  const users: AdminUser[] = userDocs.map((d) => {
    const data = d.data();
    const groupId = data.group_id as string;
    const g = groupById.get(groupId);
    const groupName = g?.name ?? "—";
    const submitted = submittedUserIds.has(d.id);
    const isMatched = (data.is_matched as boolean) ?? false;
    let match_status: AdminUser["match_status"] = "—";
    if (!submitted) match_status = "—";
    else if (isMatched) match_status = "Matched";
    else if (!groupHasMatches.has(groupId)) match_status = "Waiting";
    else match_status = "Unmatched";
    return {
      id: d.id,
      name: (data.name as string) ?? "",
      email: (data.email as string) ?? "",
      group_name: groupName,
      questionnaire: submitted ? "Submitted" : "Pending",
      match_status: match_status as AdminUser["match_status"],
    };
  });

  const userIdToName = new Map<string, string>();
  userDocs.forEach((d) => userIdToName.set(d.id, (d.data().name as string) ?? ""));

  const matches: AdminMatch[] = matchDocs.map((d) => {
    const data = d.data();
    const userIds = (data.user_ids as string[]) ?? [];
    const team = userIds.map((id) => userIdToName.get(id) ?? "?").join(" & ");
    const groupId = data.group_id as string;
    const groupName = groupById.get(groupId)?.name ?? "—";
    const expl = (data.match_explanation as Record<string, string>) ?? {};
    const topReason =
      expl.complementary_strength ?? expl.shared_trait ?? expl.availability_insight ?? expl.trio_balance ?? "—";
    return {
      id: d.id,
      team,
      group_name: groupName,
      type: ((data.match_type as string) ?? "pair") as "pair" | "trio",
      score: Math.round((data.compatibility_score as number) ?? 0),
      top_reason: topReason,
    };
  });

  return <AdminPanel groups={groups} users={users} matches={matches} />;
}
