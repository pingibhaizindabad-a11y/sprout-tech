"use client";

import type { Question } from "@/lib/questionnaire-data";

interface Props {
  questions: Question[];
  answers: Record<string, string | string[] | number>;
  onChange: (id: string, value: string | string[] | number) => void;
  disabled?: boolean;
}

export function QuestionSection({ questions, answers, onChange, disabled }: Props) {
  return (
    <div className="space-y-7">
      {questions.map((q) => (
        <div key={q.id} className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {q.id.toUpperCase()}
          </div>
          <div className="mb-3.5 text-[14px] font-medium leading-snug">{q.label}</div>
          {q.type === "scale" && q.scale && (
            <div className="py-2">
              <div className="mb-2 flex justify-between text-[11px] text-[var(--muted)]">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
              <input
                type="range"
                min={q.scale.min}
                max={q.scale.max}
                value={Number(answers[q.id]) || q.scale.min}
                onChange={(e) => onChange(q.id, parseInt(e.target.value, 10))}
                disabled={disabled}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[var(--border)] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-md"
              />
              <div className="mt-2.5 text-center font-serif text-[22px] text-[var(--accent)]">
                {Number(answers[q.id]) || q.scale.min}
              </div>
            </div>
          )}
          {q.type === "single" && q.options && (
            <div className={`grid gap-2 ${q.options.length > 4 ? "grid-cols-2" : "flex flex-col"}`}>
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(q.id, opt.value)}
                  className={`rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left text-[14px] transition ${
                    answers[q.id] === opt.value
                      ? "border-[var(--accent)] bg-[var(--accent-light)] font-medium text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          {q.type === "multi" && q.options && (
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((opt) => {
                const current = (answers[q.id] as string[] | undefined) ?? [];
                const checked = current.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      const next = checked ? current.filter((x) => x !== opt.value) : [...current, opt.value];
                      onChange(q.id, next);
                    }}
                    className={`rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left text-[14px] transition ${
                      checked
                        ? "border-[var(--accent)] bg-[var(--accent-light)] font-medium text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
