"use server";

import { getAdminApp } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { runMatching } from "@/lib/matching";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_COOKIE = "sprout_admin";
const CONFIG_ADMIN_PATH = "config/admin";

/** Allowed admin emails: read from Firestore config/admin; if empty, bootstrap from ADMIN_EMAILS env and write to Firestore. */
async function getAllowedAdminEmails(): Promise<Set<string>> {
  const db = getAdminFirestoreIfConfigured();
  if (!db) return new Set((process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
  const snap = await db.collection("config").doc("admin").get();
  const data = snap.data();
  const fromDoc = Array.isArray(data?.emails) ? (data.emails as string[]).map((e) => String(e).trim().toLowerCase()).filter(Boolean) : [];
  if (fromDoc.length > 0) return new Set(fromDoc);
  const fromEnv = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (fromEnv.length > 0) {
    await db.collection("config").doc("admin").set({ emails: fromEnv }, { merge: true });
    return new Set(fromEnv);
  }
  return new Set();
}

/** If ADMIN_PASSWORD is set and matches, grant admin access for an allowed email (no Firebase Auth required). */
export async function loginAdminWithPassword(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.trim() === "") return { ok: false, error: "" };
  const allowed = await getAllowedAdminEmails();
  if (allowed.size === 0) return { ok: false, error: "No admins configured. Set ADMIN_EMAILS in .env.local." };
  const normalized = email.trim().toLowerCase();
  if (!allowed.has(normalized)) return { ok: false, error: "This email is not authorized for admin access." };
  if (password !== adminPassword) return { ok: false, error: "Invalid password." };
  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", { path: "/admin", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
  return { ok: true };
}

/** Verify admin by Firebase email auth: client signs in, sends idToken; we verify and check email is allowed. */
export async function verifyAdminEmailAuth(idToken: string): Promise<{ ok: boolean; error?: string }> {
  const app = getAdminApp();
  if (!app) return { ok: false, error: "Firebase not configured." };
  const allowed = await getAllowedAdminEmails();
  if (allowed.size === 0) return { ok: false, error: "No admins configured. Add an admin email in the Admin panel (Admins tab) or set ADMIN_EMAILS in .env.local." };
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    const email = (decoded.email ?? "").toLowerCase();
    if (!allowed.has(email)) return { ok: false, error: "This email is not authorized for admin access." };
    const store = await cookies();
    store.set(ADMIN_COOKIE, "1", { path: "/admin", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid or expired sign-in. Try again." };
  }
}

export async function getAdminEmails(): Promise<string[]> {
  if (!(await ensureAdminSession())) return [];
  const allowed = await getAllowedAdminEmails();
  return Array.from(allowed).sort();
}

export async function addAdminEmail(formData: FormData): Promise<{ error?: string }> {
  if (!(await ensureAdminSession())) return { error: "Unauthorized" };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured." };
  const email = (formData.get("email") as string)?.trim()?.toLowerCase() ?? "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const allowed = await getAllowedAdminEmails();
  if (allowed.has(email)) return { error: "That email is already an admin." };
  const updated = Array.from(allowed);
  updated.push(email);
  updated.sort();
  await db.collection("config").doc("admin").set({ emails: updated }, { merge: true });
  return {};
}

export async function removeAdminEmail(formData: FormData): Promise<{ error?: string }> {
  if (!(await ensureAdminSession())) return { error: "Unauthorized" };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured." };
  const email = (formData.get("email") as string)?.trim()?.toLowerCase() ?? "";
  if (!email) return { error: "Email required." };
  const allowed = await getAllowedAdminEmails();
  if (!allowed.has(email)) return {};
  const updated = Array.from(allowed).filter((e) => e !== email);
  if (updated.length === 0) return { error: "Cannot remove the last admin. Add another admin first." };
  await db.collection("config").doc("admin").set({ emails: updated }, { merge: true });
  return {};
}

export async function ensureAdminSession(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "1";
}

export async function createGroup(formData: FormData): Promise<{ error?: string }> {
  if (!(await ensureAdminSession())) return { error: "Unauthorized" };
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name required." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env.local." };
  const customCode = (formData.get("code") as string)?.trim().toUpperCase();
  const code = customCode || generateCode();
  const existing = await db.collection("groups").where("code", "==", code).limit(1).get();
  if (!existing.empty) return { error: "That code is already in use." };
  await db.collection("groups").add({
    name,
    code,
    is_active: true,
    created_at: FieldValue.serverTimestamp(),
  });
  return {};
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function setGroupActive(formData: FormData): Promise<void> {
  if (!(await ensureAdminSession())) return;
  const groupId = formData.get("groupId") as string;
  const isActive = formData.get("isActive") === "true";
  const db = getAdminFirestoreIfConfigured();
  if (db) await db.collection("groups").doc(groupId).update({ is_active: isActive });
}

/** Run matching for a group (server-side only). Call from admin UI or API with auth already verified. */
export async function runMatchingForGroup(groupId: string): Promise<{ error?: string; matched?: number; unmatched?: number; trios?: number }> {
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured. Add Firebase credentials to .env.local." };

  const usersSnap = await db.collection("users").where("group_id", "==", groupId).get();
  const userIds = usersSnap.docs.map((d) => d.id);
  if (userIds.length === 0) return { error: "No users in group." };

  const responsesSnap = await db.collection("questionnaire_responses")
    .where("group_id", "==", groupId)
    .get();
  const answersByUser = new Map<string, Record<string, unknown>>();
  const responseRefsToLock: import("firebase-admin/firestore").DocumentReference[] = [];
  responsesSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.submitted_at == null) return;
    responseRefsToLock.push(d.ref);
    answersByUser.set(data.user_id as string, (data.answers as Record<string, unknown>) ?? {});
  });
  const eligibleIds = userIds.filter((id) => answersByUser.has(id));
  if (eligibleIds.length < 2) return { error: "Need at least 2 users with submitted questionnaires." };

  const result = runMatching({ userIds: eligibleIds, answersByUser: answersByUser as Map<string, Record<string, string | string[] | number>> });

  const batch = db.batch();
  for (const doc of usersSnap.docs) {
    batch.update(doc.ref, { is_matched: false });
  }
  for (const ref of responseRefsToLock) {
    batch.update(ref, { is_locked: true });
  }
  const existingMatches = await db.collection("matches").where("group_id", "==", groupId).get();
  existingMatches.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  const matchedIds = new Set<string>();
  for (const m of result.pairMatches) {
    matchedIds.add(m.user_ids[0]);
    matchedIds.add(m.user_ids[1]);
    await db.collection("matches").add({
      group_id: groupId,
      user_ids: m.user_ids,
      match_type: "pair",
      compatibility_score: m.compatibility_score,
      match_explanation: m.match_explanation,
      created_at: new Date(),
    });
  }
  for (const m of result.trioMatches) {
    m.user_ids.forEach((id) => matchedIds.add(id));
    await db.collection("matches").add({
      group_id: groupId,
      user_ids: m.user_ids,
      match_type: "trio",
      compatibility_score: m.compatibility_score,
      match_explanation: m.match_explanation,
      created_at: new Date(),
    });
  }
  for (const uid of matchedIds) {
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ is_matched: true });
  }
  const matched = result.pairMatches.length * 2 + result.trioMatches.length * 3;
  return { matched, unmatched: result.unmatchedUserIds.length, trios: result.trioMatches.length };
}

export async function triggerMatching(groupId: string): Promise<{ error?: string; matched?: number; unmatched?: number; trios?: number }> {
  if (!(await ensureAdminSession())) return { error: "Unauthorized" };
  return runMatchingForGroup(groupId);
}
