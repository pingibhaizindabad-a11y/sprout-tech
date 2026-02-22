import { redirect } from "next/navigation";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import { LoginChoice } from "./LoginChoice";

export default async function AuthPage() {
  const uid = await getCurrentUid();
  if (uid) {
    const db = getAdminFirestoreIfConfigured();
    if (db) {
      const userSnap = await db.collection("users").doc(uid).get();
      const data = userSnap.data();
      const groupId = data?.group_id;
      const submitted = data?.questionnaire_submitted === true;
      if (!groupId) redirect("/join");
      if (submitted) redirect("/dashboard");
      redirect("/questionnaire");
    }
  }

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[480px] px-6 py-20">
        <div className="mb-5 inline-block rounded-full bg-[var(--accent-light)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)]">
          Log in to continue
        </div>
        <h1 className="font-serif text-[34px] tracking-tight">Who are you?</h1>
        <p className="mt-1.5 text-[14px] text-[var(--muted)]">
          Choose Admin if you manage groups and matching; choose Participant if you&apos;re joining a group and taking the questionnaire.
        </p>
        <LoginChoice />
      </main>
    </div>
  );
}
