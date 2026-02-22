"use client";

import Link from "next/link";

const AVATAR_COLORS = ["bg-[#8B5E3C]", "bg-[#2E4A7A]", "bg-[#6B3FA0]"];

function TeammateAvatar({ name, avatarUrl, colorIndex }: { name: string; avatarUrl?: string; colorIndex: number }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const bg = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base text-white ${bg}`}
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

export function DashboardMatched({
  matchId,
  score,
  explanation,
  teammates,
}: {
  matchId: string;
  score: number;
  explanation: Record<string, string>;
  teammates: { id: string; name: string; email: string; bio?: string; avatar_url?: string }[];
}) {
  const entries = [
    explanation.complementary_strength && { key: "complementary_strength", label: "Complementary skills", text: explanation.complementary_strength },
    explanation.shared_trait && { key: "shared_trait", label: "Compatible work style", text: explanation.shared_trait },
    explanation.availability_insight && { key: "availability_insight", label: "Aligned availability", text: explanation.availability_insight },
    explanation.trio_balance && { key: "trio_balance", label: "Trio balance", text: explanation.trio_balance },
  ].filter(Boolean) as { key: string; label: string; text: string }[];

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between bg-[var(--accent)] px-7 py-5">
        <div className="text-white">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-80">Your Match</div>
          <div className="font-serif text-[22px]">You've been matched! 🎉</div>
        </div>
        <div className="rounded-[10px] bg-white/15 px-[18px] py-2 font-serif text-[26px] text-white">
          {Math.round(score)}%
        </div>
      </div>
      <div className="p-7">
        {teammates.map((t, i) => (
          <div key={t.id} className="mb-5 flex items-center gap-3.5 rounded-[14px] bg-[var(--bg)] px-5 py-5">
            <TeammateAvatar name={t.name} avatarUrl={t.avatar_url} colorIndex={i} />
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px]">{t.name}</strong>
              <span className="text-[13px] text-[var(--muted)]">{t.bio || "Teammate"}</span>
              <br />
              <a href={`mailto:${t.email}`} className="text-[13px] text-[var(--accent)]">
                {t.email}
              </a>
            </div>
          </div>
        ))}
        <div className="space-y-2.5">
          {entries.map((e) => (
            <div key={e.key} className="flex items-start gap-3 rounded-[10px] bg-[var(--bg)] px-3.5 py-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-light)] text-[13px]">
                {REASON_ICONS[e.key] ?? "🎯"}
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--text)]">
                <strong className="font-medium text-[var(--accent)]">{e.label}</strong> — {e.text}
              </p>
            </div>
          ))}
        </div>
        <Link
          href={`/match/${matchId}`}
          className="mt-5 block w-full rounded-[10px] bg-[var(--accent)] py-3.5 text-center text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
        >
          View Full Match Details →
        </Link>
      </div>
    </div>
  );
}
