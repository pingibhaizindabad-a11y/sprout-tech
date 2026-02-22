"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateGroupCode, validateGroupCodeOnly } from "./actions";

export function JoinForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (isLoggedIn) {
      const result = await validateGroupCode(formData);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      const path = result.next === "dashboard" ? "/dashboard" : "/questionnaire";
      setTimeout(() => {
        router.push(path);
        router.refresh();
      }, 800);
      return;
    }
    const result = await validateGroupCodeOnly(formData);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (result.groupId != null && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("sprout_groupId", result.groupId);
        sessionStorage.setItem("sprout_groupCode", result.groupCode ?? result.groupId);
        sessionStorage.setItem("sprout_groupName", result.groupName ?? "");
      } catch (_) {}
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/auth");
      router.refresh();
    }, 800);
  }

  return (
    <div className="mt-9 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-[#c5d9ca] bg-[var(--accent-light)] px-3.5 py-2.5 text-[13px] text-[var(--accent)]">
          ✓ Code accepted! Redirecting…
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Group Code
          </label>
          <input
            name="code"
            type="text"
            autoComplete="off"
            placeholder="Enter code"
            maxLength={10}
            className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-center text-xl font-semibold tracking-widest text-[var(--text)] outline-none transition placeholder:text-[#C5C2BA] focus:border-[var(--accent)] focus:bg-white"
            required
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.toUpperCase();
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-base font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Checking…
            </span>
          ) : (
            "Continue →"
          )}
        </button>
      </form>
      <p className="mt-5 text-center text-[13px] text-[var(--muted)]">
        Don&apos;t have a code? Ask your organizer.
      </p>
    </div>
  );
}
