import Link from "next/link";
import { JoinCard } from "@/components/JoinCard";

export default function Home() {
  return (
    <div className="animate-fadeUp">
      <div className="mx-auto max-w-[720px] px-6 pb-16 pt-[90px] text-center sm:px-12">
        <div className="mb-7 inline-block rounded-full bg-[var(--accent-light)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Group-Based Matching Platform
        </div>
        <h1 className="font-serif text-[clamp(40px,6vw,68px)] leading-[1.08] tracking-tight">
          Find your <em className="text-[var(--accent)]">perfect</em>
          <br />
          team match
        </h1>
        <p className="mx-auto mb-11 max-w-[500px] text-lg font-light leading-relaxed text-[var(--muted)]">
          Join your group, answer a few questions, and get matched with someone who truly complements your skills and style.
        </p>
        <Link
          href="/auth"
          className="inline-block rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-base font-medium text-white transition hover:bg-[var(--accent-hover)]"
        >
          Log in to get started →
        </Link>
      </div>

      <JoinCard />

      <hr className="mx-12 border-0 border-t border-[var(--border)]" />

      <section className="mx-auto max-w-[960px] px-6 pb-20 pt-[72px] sm:px-12">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          How it works
        </div>
        <h2 className="mb-12 font-serif text-[clamp(26px,4vw,40px)] tracking-tight">
          Three steps to your match
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition shadow-sm hover:shadow-md">
            <div className="font-serif text-[42px] leading-none text-[var(--border)]">01</div>
            <h3 className="mb-2 text-[15px] font-medium">Join your group</h3>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              Enter the code your organizer shared. You&apos;ll only ever be matched with people in your group — completely private.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition shadow-sm hover:shadow-md">
            <div className="font-serif text-[42px] leading-none text-[var(--border)]">02</div>
            <h3 className="mb-2 text-[15px] font-medium">Answer the questionnaire</h3>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              28 quick questions across skills, availability, work style, and motivation. Takes about 5 minutes.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 transition shadow-sm hover:shadow-md">
            <div className="font-serif text-[42px] leading-none text-[var(--border)]">03</div>
            <h3 className="mb-2 text-[15px] font-medium">Meet your match</h3>
            <p className="text-[13px] leading-relaxed text-[var(--muted)]">
              See exactly why you were paired — complementary strengths, shared traits, and aligned availability.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-20 sm:px-12">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Match Preview
        </div>
        <h2 className="mb-12 font-serif text-[clamp(26px,4vw,40px)] tracking-tight">
          Your match, explained
        </h2>
        <div className="mx-auto max-w-[580px] rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-9 shadow-lg">
          <div className="mb-6 flex items-center gap-3.5 border-b border-[var(--border)] pb-6">
            <div className="flex -space-x-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] font-serif text-lg text-white">
                A
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#8B5E3C] font-serif text-lg text-white">
                R
              </div>
            </div>
            <div className="flex-1">
              <strong className="block text-[15px]">You & your match</strong>
              <span className="text-[12px] text-[var(--muted)]">Matched in your group</span>
            </div>
            <div className="rounded-full bg-[var(--accent-light)] px-3 py-1.5 text-[12px] font-semibold text-[var(--accent)]">
              High match
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-3 rounded-[10px] bg-[var(--bg)] p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-light)] text-[13px]">
                ⚡
              </div>
              <p className="text-[13px] leading-relaxed">
                <strong className="font-medium text-[var(--accent)]">Complementary skills</strong> — Technical (Backend) meets Marketing (Growth). You cover what the other doesn&apos;t.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-[10px] bg-[var(--bg)] p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-light)] text-[13px]">
                🕐
              </div>
              <p className="text-[13px] leading-relaxed">
                <strong className="font-medium text-[var(--accent)]">Aligned availability</strong> — Both available 10–20 hrs/week, prefer weekly syncs.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-[10px] bg-[var(--bg)] p-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-[var(--accent-light)] text-[13px]">
                🤝
              </div>
              <p className="text-[13px] leading-relaxed">
                <strong className="font-medium text-[var(--accent)]">Compatible work style</strong> — Both prefer async communication and take deadlines seriously (4/5).
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-[12px] text-[var(--muted)]">
        Built for cohorts, competitions & E-Cells &nbsp;·&nbsp; Sprout © 2025
      </footer>
    </div>
  );
}
