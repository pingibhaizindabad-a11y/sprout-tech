"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseAuth, getFirebaseStorage } from "@/lib/firebase/client";
import { syncUserAndSetCookie } from "./actions";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_ERRORS_SIGNUP: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists with this email. Try logging in.",
  "auth/weak-password": "Password must be at least 8 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
};
const AUTH_ERRORS_LOGIN: Record<string, string> = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Invalid email or password.",
};
const FALLBACK = "Something went wrong. Please try again.";

export function AuthForm() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [inlineErrors, setInlineErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInlineErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = (fd.get("email") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    const passwordConfirm = mode === "signup" ? (fd.get("passwordConfirm") as string) ?? "" : "";
    const name = mode === "signup" ? (fd.get("name") as string)?.trim() : undefined;
    const bio = mode === "signup" ? (fd.get("bio") as string)?.trim() : undefined;

    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setInlineErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
      return;
    }
    if (mode === "signup") {
      if (password.length < 8) {
        setInlineErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters." }));
        return;
      }
      if (password !== passwordConfirm) {
        setInlineErrors((prev) => ({ ...prev, confirm: "Passwords do not match." }));
        return;
      }
    }

    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      const userCred =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);

      let avatarUrl: string | undefined;
      if (mode === "signup" && userCred.user && avatarFile) {
        const storage = getFirebaseStorage();
        const storageRef = ref(storage, `avatars/${userCred.user.uid}/profile.jpg`);
        await uploadBytes(storageRef, avatarFile, { contentType: avatarFile.type });
        avatarUrl = await getDownloadURL(storageRef);
      }

      const idToken = await userCred.user.getIdToken();
      let groupId: string | null = null;
      let groupCode: string | null = null;
      let groupName: string | null = null;
      if (typeof window !== "undefined") {
        try {
          groupId = sessionStorage.getItem("sprout_groupId");
          groupCode = sessionStorage.getItem("sprout_groupCode");
          groupName = sessionStorage.getItem("sprout_groupName");
        } catch (_) {}
      }
      const result = await syncUserAndSetCookie(idToken, name, bio, avatarUrl, groupId ?? undefined, groupCode ?? undefined, groupName ?? undefined);
      if (result?.error) setError(result.error);
      else if (mode === "signup" && typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("sprout_groupId");
          sessionStorage.removeItem("sprout_groupCode");
          sessionStorage.removeItem("sprout_groupName");
        } catch (_) {}
      }
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      const map = mode === "signup" ? AUTH_ERRORS_SIGNUP : AUTH_ERRORS_LOGIN;
      setError(map[code] ?? FALLBACK);
    } finally {
      setLoading(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAvatarError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image must be under 2MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <>
      <p className="mb-3 text-[14px] text-[var(--muted)]">First time here? Sign up. Already have an account? Log in.</p>
      <div className="mb-6 flex gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--bg)] p-1">
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(null); }}
          className={`flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition ${
            mode === "signup" ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)]"
          }`}
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => { setMode("login"); setError(null); }}
          className={`flex-1 rounded-lg py-2.5 text-center text-sm font-medium transition ${
            mode === "login" ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)]"
          }`}
        >
          Log in
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-[#f5c6c3] bg-[#fdf1f0] px-3.5 py-2.5 text-[13px] text-[var(--danger)]">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Short Bio <span className="font-normal normal-case tracking-normal text-[#C5C2BA]">(optional)</span>
                </label>
                <input
                  name="bio"
                  type="text"
                  placeholder="e.g. CS student at UW, love building products"
                  className="w-full rounded-[10px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Profile Picture <span className="font-normal normal-case tracking-normal text-[#C5C2BA]">(optional, max 2MB)</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--accent-light)]">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xl">👤</span>
                    )}
                  </div>
                  <label className="flex flex-1 cursor-pointer rounded-[10px] border border-dashed border-[var(--border)] px-3.5 py-2.5 text-center text-[13px] text-[var(--muted)] transition hover:border-[var(--accent)]">
                    Click to upload photo
                    <input
                      ref={fileInputRef}
                      name="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`w-full rounded-[10px] border-[1.5px] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:bg-white ${inlineErrors.email ? "border-[var(--danger)]" : "border-[var(--border)] focus:border-[var(--accent)]"}`}
              required
            />
            {inlineErrors.email && (
              <p className="mt-1.5 text-[12px] text-[var(--danger)]">{inlineErrors.email}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              className={`w-full rounded-[10px] border-[1.5px] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:bg-white ${inlineErrors.password ? "border-[var(--danger)]" : "border-[var(--border)] focus:border-[var(--accent)]"}`}
              required
              minLength={mode === "signup" ? 8 : 1}
            />
            {inlineErrors.password && (
              <p className="mt-1.5 text-[12px] text-[var(--danger)]">{inlineErrors.password}</p>
            )}
          </div>
          {mode === "signup" && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Confirm Password
              </label>
              <input
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                className={`w-full rounded-[10px] border-[1.5px] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text)] outline-none transition focus:bg-white ${inlineErrors.confirm ? "border-[var(--danger)]" : "border-[var(--border)] focus:border-[var(--accent)]"}`}
                required
                minLength={8}
              />
              {inlineErrors.confirm && (
                <p className="mt-1.5 text-[12px] text-[var(--danger)]">{inlineErrors.confirm}</p>
              )}
            </div>
          )}
          {mode === "login" && (
            <p className="text-[13px]">
              <Link href="/auth/forgot-password" className="text-[var(--accent)] hover:underline">
                Forgot password?
              </Link>
            </p>
          )}
          {avatarError && mode === "signup" && (
            <p className="text-[12px] text-[var(--danger)]">{avatarError}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-[10px] bg-[var(--accent)] px-8 py-3.5 text-base font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Please wait…
              </span>
            ) : mode === "signup" ? "Create Account →" : "Log In →"}
          </button>
        </form>
      </div>
      <Link href="/join" className="mt-6 inline-block text-sm text-[var(--muted)] hover:text-[var(--text)]">
        ← Back to group code
      </Link>
    </>
  );
}
