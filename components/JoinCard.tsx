"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateGroupCode } from "@/app/join/actions";

export function JoinCard() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function handleJoin() {
    setError("");
    const formData = new FormData();
    formData.set("code", code.trim().toUpperCase());
    const result = await validateGroupCode(formData);
    if (result.ok) {
      const path = result.next === "dashboard" ? "/dashboard" : "/questionnaire";
      router.push(path);
      router.refresh();
    } else {
      setError(result.error ?? "Invalid code.");
    }
  }

  return (
    <div className="mx-auto mb-20 max-w-[400px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-md sm:px-8">
      <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        Have a group code?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter code"
          maxLength={10}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[#C5C2BA] focus:border-[var(--accent)] focus:bg-white"
        />
        <button
          type="button"
          onClick={handleJoin}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
        >
          Join
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
      <p className="mt-2.5 text-center text-[12px] text-[var(--muted)]">
        Get your code from your organizer
      </p>
    </div>
  );
}
