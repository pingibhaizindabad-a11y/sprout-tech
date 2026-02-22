import { redirect } from "next/navigation";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import { DashboardWithRealtime } from "./DashboardWithRealtime";

export default async function DashboardPage() {
  const uid = await getCurrentUid();
  if (!uid) redirect("/auth");

  const db = getAdminFirestoreIfConfigured();
  if (!db) redirect("/auth");

  const meSnap = await db.collection("users").doc(uid).get();
  const me = meSnap.data();
  if (!me) redirect("/auth");

  const name = (me.name as string) ?? "";
  const email = (me.email as string) ?? "";
  const avatarUrl = (me.avatar_url as string | undefined) ?? null;
  const groupId = me.group_id as string | undefined;
  const isMatched = (me.is_matched as boolean) ?? false;

  let groupName = "Your group";
  let groupCode = "";
  if (groupId) {
    const groupSnap = await db.collection("groups").doc(groupId).get();
    const g = groupSnap.data();
    if (g?.name) groupName = g.name as string;
    if (g?.code) groupCode = g.code as string;
  }

  let initialMatch: { id: string; user_ids: string[]; match_type: string; compatibility_score: number; match_explanation: Record<string, string> } | undefined;
  let initialTeammates: { id: string; name: string; email: string; bio?: string; avatar_url?: string }[] | undefined;

  if (isMatched) {
    const matchSnap = await db.collection("matches").where("user_ids", "array-contains", uid).limit(1).get();
    const matchDoc = matchSnap.docs[0];
    if (matchDoc) {
      const matchData = matchDoc.data();
      initialMatch = {
        id: matchDoc.id,
        user_ids: (matchData.user_ids as string[]) ?? [],
        match_type: (matchData.match_type as string) ?? "pair",
        compatibility_score: (matchData.compatibility_score as number) ?? 0,
        match_explanation: (matchData.match_explanation as Record<string, string>) ?? {},
      };
      const otherIds = initialMatch.user_ids.filter((id) => id !== uid);
      initialTeammates = [];
      for (const id of otherIds) {
        const t = await db.collection("users").doc(id).get();
        const d = t.data();
        if (d)
          initialTeammates.push({
            id: t.id,
            name: (d.name as string) ?? "",
            email: (d.email as string) ?? "",
            bio: d.bio as string | undefined,
            avatar_url: d.avatar_url as string | undefined,
          });
      }
    }
  }

  return (
    <DashboardWithRealtime
      uid={uid}
      name={name}
      email={email}
      avatarUrl={avatarUrl}
      groupName={groupName}
      groupCode={groupCode}
      initialIsMatched={isMatched}
      initialMatch={initialMatch}
      initialTeammates={initialTeammates}
    />
  );
}
