"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { DashboardMatched } from "./DashboardMatched";

const AVATAR_COLORS = ["bg-[var(--accent)]", "bg-[#8B5E3C]", "bg-[#2E4A7A]"];

function Avatar({
  name,
  avatarUrl,
  className = "h-11 w-11 text-base",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-white ${AVATAR_COLORS[0]} ${className}`}
      style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover" } : undefined}
    >
      {!avatarUrl && initial}
    </div>
  );
}

type Teammate = { id: string; name: string; email: string; bio?: string; avatar_url?: string };

export function DashboardWithRealtime({
  uid,
  name,
  email,
  avatarUrl,
  groupName,
  groupCode,
  initialIsMatched,
  initialMatch,
  initialTeammates,
}: {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  groupName: string;
  groupCode: string;
  initialIsMatched: boolean;
  initialMatch?: { id: string; user_ids: string[]; match_type: string; compatibility_score: number; match_explanation: Record<string, string> };
  initialTeammates?: Teammate[];
}) {
  const [isMatched, setIsMatched] = useState(initialIsMatched);
  const [match, setMatch] = useState(initialMatch);
  const [teammates, setTeammates] = useState<Teammate[]>(initialTeammates ?? []);

  useEffect(() => {
    if (initialIsMatched) return;
    const db = getFirebaseFirestore();
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        const d = snap.data();
        const matched = (d?.is_matched as boolean) ?? false;
        if (matched) setIsMatched(true);
      },
      (err) => {
        if (err?.code === "permission-denied") setIsMatched(false);
      }
    );
    return () => unsub();
  }, [uid, initialIsMatched]);

  useEffect(() => {
    if (!isMatched || match) return;
    const db = getFirebaseFirestore();
    (async () => {
      const matchesSnap = await getDocs(
        query(collection(db, "matches"), where("user_ids", "array-contains", uid))
      );
      const matchDoc = matchesSnap.docs[0];
      if (!matchDoc) return;
      const data = matchDoc.data();
      const userIds = (data.user_ids as string[]) ?? [];
      const otherIds = userIds.filter((id) => id !== uid);
      const teammatesList: Teammate[] = [];
      for (const id of otherIds) {
        const t = await getDoc(doc(db, "users", id));
        const d = t.data();
        if (d)
          teammatesList.push({
            id: t.id,
            name: (d.name as string) ?? "",
            email: (d.email as string) ?? "",
            bio: d.bio as string | undefined,
            avatar_url: d.avatar_url as string | undefined,
          });
      }
      setMatch({
        id: matchDoc.id,
        user_ids: userIds,
        match_type: (data.match_type as string) ?? "pair",
        compatibility_score: (data.compatibility_score as number) ?? 0,
        match_explanation: (data.match_explanation as Record<string, string>) ?? {},
      });
      setTeammates(teammatesList);
    })();
  }, [isMatched, uid, match]);

  const firstName = name.split(" ")[0] || name;

  if (!isMatched) {
    return (
      <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
        <main className="mx-auto max-w-[760px] px-6 py-12 pb-20">
          <div className="mb-10">
            <h1 className="font-serif text-[34px] tracking-tight">
              Good to see you, <span className="italic text-[var(--accent)]">{firstName}</span>
            </h1>
            <p className="mt-1 text-[15px] text-[var(--muted)]">
              Here&apos;s your matching status for <strong>{groupName}</strong>
            </p>
          </div>
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-[var(--bg)] px-6 py-5">
            <Avatar name={name} avatarUrl={avatarUrl} />
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px]">{name}</strong>
              <span className="text-[13px] text-[var(--muted)]">{email}</span>
            </div>
            {groupCode && (
              <span className="rounded-md bg-[var(--accent-light)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                {groupCode}
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <span className="inline-flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-[var(--accent-light)] text-3xl">⏳</span>
            </div>
            <h3 className="font-serif text-2xl">Waiting for your match</h3>
            <p className="mx-auto mt-2 max-w-[320px] text-[14px] text-[var(--muted)]">
              Your questionnaire is submitted. Your organizer will trigger matching soon — check back later.
            </p>
            <div className="mt-6 inline-block rounded-[10px] bg-[var(--bg)] px-5 py-4">
              <div className="text-xs text-[var(--muted)]">QUESTIONNAIRE STATUS</div>
              <div className="text-[14px] font-medium text-[var(--accent)]">✓ Submitted</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!match || teammates.length === 0) {
    return (
      <div className="min-h-[calc(100vh-61px)] flex items-center justify-center">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[760px] px-6 py-12 pb-20">
        <div className="mb-10">
          <h1 className="font-serif text-[34px] tracking-tight">
            Good to see you, <span className="italic text-[var(--accent)]">{firstName}</span>
          </h1>
          <p className="mt-1 text-[15px] text-[var(--muted)]">
            Here&apos;s your matching status for <strong>{groupName}</strong>
          </p>
        </div>
        <div className="mb-6 flex items-center gap-4 rounded-xl bg-[var(--bg)] px-6 py-5">
          <Avatar name={name} avatarUrl={avatarUrl} />
          <div className="min-w-0 flex-1">
            <strong className="block text-[15px]">{name}</strong>
            <span className="text-[13px] text-[var(--muted)]">{email}</span>
          </div>
          {groupCode && (
            <span className="rounded-md bg-[var(--accent-light)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
              {groupCode}
            </span>
          )}
        </div>
        <DashboardMatched
          matchId={match.id}
          score={match.compatibility_score}
          explanation={match.match_explanation}
          teammates={teammates}
        />
      </main>
    </div>
  );
}
