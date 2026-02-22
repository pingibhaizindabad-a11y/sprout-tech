"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuestionSection } from "./QuestionSection";
import { saveDraft, submitQuestionnaire } from "./actions";
import type { Question } from "@/lib/questionnaire-data";

type Answers = Record<string, string | string[] | number>;

interface Props {
  sections: Question[][];
  pillarNames: readonly string[];
  initialAnswers: Answers;
}

export function QuestionnaireForm({ sections, pillarNames, initialAnswers }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = sections.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleChange = useCallback((id: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const saveAndNext = async () => {
    setSaving(true);
    await saveDraft(answers);
    setSaving(false);
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const saveAndBack = async () => {
    setSaving(true);
    await saveDraft(answers);
    setSaving(false);
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSaving(true);
    const result = await submitQuestionnaire(answers);
    setSaving(false);
    if (result?.error) {
      setSubmitError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div>
      <div className="mb-10">
        <div className="mb-2.5 flex justify-between text-[13px]">
          <span className="text-[var(--muted)]">{pillarNames[step]}</span>
          <strong className="text-[var(--accent)]">Section {step + 1} of {totalSteps}</strong>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <h2 className="font-serif text-[28px] tracking-tight">{pillarNames[step]}</h2>
      <p className="mb-9 text-[14px] text-[var(--muted)]">Answer honestly — helps us match you with the right teammates.</p>
      <div className="space-y-7">
        <QuestionSection
          questions={sections[step]}
          answers={answers}
          onChange={handleChange}
        />
      </div>
      <div className="mt-9 flex items-center justify-between">
        <button
          type="button"
          onClick={saveAndBack}
          disabled={step === 0 || saving}
          className="rounded-lg border border-[var(--accent)] bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-light)] disabled:invisible disabled:opacity-60"
        >
          ← Back
        </button>
        <div className="flex-1" />
        {step < totalSteps - 1 ? (
          <button
            type="button"
            onClick={saveAndNext}
            disabled={saving}
            className="rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Next Section →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {saving ? "Submitting…" : "Submit →"}
          </button>
        )}
      </div>
      {submitError && <p className="mt-4 text-sm text-[var(--danger)]">{submitError}</p>}
    </div>
  );
}
