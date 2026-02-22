import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
import { TriggerMatchingButton } from "../TriggerMatchingButton";

export default async function AdminGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const db = getAdminFirestoreIfConfigured();
  if (!db) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900">
        <main className="mx-auto max-w-lg px-6 py-12">
          <p className="text-zinc-600">Firebase not configured. Add keys to .env.local.</p>
          <Link href="/admin" className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-700">← Admin</Link>
        </main>
      </div>
    );
  }
  const groupDoc = await db.collection("groups").doc(groupId).get();
  if (!groupDoc.exists) notFound();
  const group = { id: groupDoc.id, ...groupDoc.data() } as { id: string; name: string; code: string };

  const usersSnap = await db.collection("users").where("group_id", "==", groupId).get();
  const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; name: string; email: string; is_matched?: boolean }[];

  const matchesSnap = await db.collection("matches").where("group_id", "==", groupId).get();
  const matches = matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; user_ids: string[]; match_type: string; compatibility_score: number }[];
  const matchedIds = new Set<string>();
  matches.forEach((m) => m.user_ids.forEach((id: string) => matchedIds.add(id)));
  const unmatched = users.filter((u) => !matchedIds.has(u.id));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-700">← Groups</Link>
        <h1 className="mt-4 text-2xl font-semibold">{group.name}</h1>
        <p className="text-zinc-500">Code: {group.code}</p>

        <div className="mt-8">
          <h2 className="text-lg font-medium">Run matching</h2>
          <p className="mt-1 text-sm text-zinc-600">Pairs and trios from submitted questionnaires. Running again replaces existing matches.</p>
          <TriggerMatchingButton groupId={groupId} />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium">Matches</h2>
          {matches.length ? (
            <ul className="mt-4 space-y-3">
              {matches.map((m) => (
                <li key={m.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
                  <span className="font-medium">{m.match_type}</span> — {Math.round(m.compatibility_score)}% — {m.user_ids.length} member(s)
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-zinc-500">No matches yet. Run matching above.</p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium">Unmatched users</h2>
          {unmatched.length ? (
            <ul className="mt-4 space-y-2">
              {unmatched.map((u) => (
                <li key={u.id} className="text-sm text-zinc-700">{u.name} — {u.email}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-zinc-500">None (everyone matched or no users).</p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-medium">All users ({users.length})</h2>
          <ul className="mt-4 space-y-2">
            {users.map((u) => (
              <li key={u.id} className="text-sm text-zinc-700">
                {u.name} — {u.email} {u.is_matched ? "(matched)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
