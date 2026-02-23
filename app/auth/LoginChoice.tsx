"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "./AuthForm";

type Role = "admin" | "student" | null;

export function LoginChoice() {
  const router = useRouter();
  const [role, setRole] = useState<Role>(null);

  if (role === null) {
    return (
      <div className="mt-8 space-y-4">
        <p className="text-[14px] text-[var(--muted)]">Choose how you&apos;re logging in:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
          >
            <span className="text-2xl">👤</span>
            <h3 className="mt-3 font-semibold text-[var(--text)]">Admin / Organizer</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Manage groups, run matching, view results</p>
          </button>
          <button
            type="button"
            onClick={() => setRole("student")}
            className="rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-6 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
          >
            <span className="text-2xl">🎓</span>
            <h3 className="mt-3 font-semibold text-[var(--text)]">Participant / Student</h3>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Join a group, fill questionnaire, see your match</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() => setRole(null)}
        className="mb-4 text-[13px] text-[var(--muted)] hover:text-[var(--text)]"
      >
        ← Back to choice
      </button>
      <AuthForm />
    </div>
  );
}
