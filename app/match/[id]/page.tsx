import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getCurrentUid } from "@/lib/firebase/auth-server";

const AVATAR_COLORS = ["bg-[var(--accent)]", "bg-[#8B5E3C]", "bg-[#2E4A7A]"];

function MemberAvatar({
  name,
  avatarUrl,
  index,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  index: number;
  size?: "md" | "lg";
}) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const bg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const dim = size === "lg" ? "h-[54px] w-[54px] text-xl" : "h-11 w-11 text-base";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-white text-white ${bg} ${dim}`}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover" } : undefined}
    >
      {!avatarUrl && initial}
    </div>
  );
}

const REASON_ICONS: Record<string, string> = {
  complementary_strength: "⚡",
  shared_trait: "🤝",
  availability_insight: "🕐",
  trio_balance: "🔗",
};

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uid = await getCurrentUid();
  if (!uid) redirect("/auth");

  const db = getAdminFirestoreIfConfigured();
  if (!db) notFound();

  const matchDoc = await db.collection("matches").doc(id).get();
  if (!matchDoc.exists) notFound();

  const match = matchDoc.data()!;
  const userIds = (match.user_ids as string[]) ?? [];
  if (!userIds.includes(uid)) notFound();

  const matchType = (match.match_type as string) ?? "pair";
  const score = Math.round((match.compatibility_score as number) ?? 0);
  const explanation = (match.match_explanation as Record<string, string>) ?? {};

  let groupName = "";
  const groupId = match.group_id as string | undefined;
  if (groupId) {
    const gSnap = await db.collection("groups").doc(groupId).get();
    groupName = (gSnap.data()?.name as string) ?? "";
  }

  const members: { id: string; name: string; email: string; bio?: string; avatar_url?: string }[] = [];
  for (const memberId of userIds) {
    const userSnap = await db.collection("users").doc(memberId).get();
    const d = userSnap.data();
    if (d)
      members.push({
        id: userSnap.id,
        name: (d.name as string) ?? "",
        email: (d.email as string) ?? "",
        bio: d.bio as string | undefined,
        avatar_url: d.avatar_url as string | undefined,
      });
  }

  const others = members.filter((m) => m.id !== uid);
  const reasonEntries = [
    explanation.complementary_strength && {
      key: "complementary_strength",
      title: "Complementary skills",
      text: explanation.complementary_strength,
    },
    explanation.shared_trait && { key: "shared_trait", title: "Compatible work style", text: explanation.shared_trait },
    explanation.availability_insight && {
      key: "availability_insight",
      title: "Aligned availability",
      text: explanation.availability_insight,
    },
    explanation.trio_balance && { key: "trio_balance", title: "Trio balance", text: explanation.trio_balance },
  ].filter(Boolean) as { key: string; title: string; text: string }[];

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[680px] px-6 py-12 pb-20">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="font-serif text-[38px] tracking-tight">Your Match</h1>
        <p className="mt-1.5 text-[15px] text-[var(--muted)]">
          Here&apos;s why you and {others.length === 1 ? others[0].name : "your team"} are a great fit.
        </p>

        <div className="mt-9 overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] shadow-lg">
          <div className="flex items-center gap-4 bg-[var(--accent)] px-8 py-7">
            <div className="flex items-center">
              {members.map((m, i) => (
                <span key={m.id} className={i === 0 ? "" : "-ml-2.5"}>
                  <MemberAvatar name={m.name} avatarUrl={m.avatar_url} index={i} size="lg" />
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1 text-white">
              <strong className="block text-lg">
                {members.map((m) => m.name).join(", ")}
              </strong>
              <span className="text-[13px] opacity-80">
                {groupName} · {matchType === "trio" ? "Trio" : "Pair"} Match
              </span>
            </div>
            <div className="rounded-xl bg-white/15 px-5 py-2.5 font-serif text-[28px] text-white">
              {score}%
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Why You Were Matched
            </div>
            <div className="space-y-2.5">
              {reasonEntries.map((e) => (
                <div key={e.key} className="flex items-start gap-3 rounded-[10px] bg-[var(--bg)] px-3.5 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-light)] text-[13px]">
                    {REASON_ICONS[e.key] ?? "🎯"}
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--text)]">
                    <strong className="font-medium text-[var(--accent)]">{e.title}</strong> — {e.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-[var(--border)] pt-6">
              <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                {others.length === 1 ? "Your Match's Contact" : "Your Team's Contacts"}
              </div>
              <div className="flex flex-col gap-2.5">
                {others.map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3.5 rounded-[14px] bg-[var(--bg)] px-5 py-5"
                  >
                    <MemberAvatar name={m.name} avatarUrl={m.avatar_url} index={i} />
                    <div className="min-w-0 flex-1">
                      <strong className="block text-[15px]">{m.name}</strong>
                      <span className="text-[13px] text-[var(--muted)]">{m.bio || groupName}</span>
                      <br />
                      <a
                        href={`mailto:${m.email}`}
                        className="text-[13px] text-[var(--accent)] hover:underline"
                      >
                        {m.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
