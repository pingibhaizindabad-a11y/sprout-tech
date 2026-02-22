import { redirect } from "next/navigation";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import { getMyResponse } from "./actions";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { QUESTIONS, PILLARS } from "@/lib/questionnaire-data";

export default async function QuestionnairePage() {
  const uid = await getCurrentUid();
  if (!uid) redirect("/auth");
  const { answers: initial, isLocked, submitted } = await getMyResponse();
  if (submitted || isLocked) redirect("/dashboard");

  const sections = PILLARS.map((name, i) =>
    QUESTIONS.filter((q) => q.pillar === i + 1)
  );

  return (
    <div className="min-h-[calc(100vh-61px)] animate-fadeUp">
      <main className="mx-auto max-w-[680px] px-6 py-12 pb-20">
        <QuestionnaireForm sections={sections} pillarNames={PILLARS} initialAnswers={(initial ?? {}) as Record<string, string | string[] | number>} />
      </main>
    </div>
  );
}
