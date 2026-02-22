import { getCurrentUid } from "@/lib/firebase/auth-server";
import { JoinForm } from "./JoinForm";

export default async function JoinPage() {
  const uid = await getCurrentUid();

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[420px] px-6 py-20">
        <div className="mb-5 inline-block rounded-full bg-[var(--accent-light)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Enter your group code
        </div>
        <h1 className="font-serif text-4xl tracking-tight">Join your group</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">
          Enter the group code your organizer shared. {uid ? "We'll add you to the group." : "Then sign up or log in to continue."}
        </p>
        <JoinForm isLoggedIn={!!uid} />
      </main>
    </div>
  );
}
