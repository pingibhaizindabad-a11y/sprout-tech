"use server";

import { getAdminApp } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";
import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { runMatching } from "@/lib/matching";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

const ADMIN_COOKIE = "sprout_admin";

/** Returns the current admin uid from cookie, or null. */
export async function getAdminUid(): Promise<string | null> {
  const store = await cookies();
  const uid = store.get(ADMIN_COOKIE)?.value?.trim();
  return uid && /^[a-zA-Z0-9_-]+$/.test(uid) ? uid : null;
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { path: "/admin", httpOnly: true, sameSite: "lax", maxAge: 0 });
}

export async function ensureAdminSession(): Promise<boolean> {
  return (await getAdminUid()) != null;
}

/** Create /admins/{uid} for a newly signed-up user. Call with idToken + name/email; uses Admin SDK so no client rules. */
export async function createAdminDoc(
  idToken: string,
  name: string,
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const app = getAdminApp();
  if (!app) return { ok: false, error: "Firebase not configured." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { ok: false, error: "Firebase not configured." };
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    const uid = decoded.uid;
    const ref = db.collection("admins").doc(uid);
    const snap = await ref.get();
    if (snap.exists) return { ok: true };
    await ref.set({
      uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: FieldValue.serverTimestamp(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid or expired sign-in. Try again." };
  }
}

/** Verify Firebase idToken and that user is in /admins/{uid}. Set admin cookie to uid. */
export async function verifyAdminByFirebase(idToken: string): Promise<{ ok: boolean; error?: string }> {
  const app = getAdminApp();
  if (!app) return { ok: false, error: "Firebase not configured." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { ok: false, error: "Firebase not configured." };
  try {
    const decoded = await getAuth(app).verifyIdToken(idToken);
    const uid = decoded.uid;
    const adminSnap = await db.collection("admins").doc(uid).get();
    if (!adminSnap.exists) {
      return { ok: false, error: "You are not registered as an admin." };
    }
    const store = await cookies();
    store.set(ADMIN_COOKIE, uid, { path: "/admin", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid or expired sign-in. Try again." };
  }
}

export async function createGroup(formData: FormData): Promise<{ error?: string }> {
  const ownerId = await getAdminUid();
  if (!ownerId) return { error: "Unauthorized" };
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name required." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured." };
  const customCode = (formData.get("code") as string)?.trim().toUpperCase();
  const code = customCode || generateCode();
  const existing = await db.collection("groups").where("code", "==", code).limit(1).get();
  if (!existing.empty) return { error: "That code is already in use." };
  await db.collection("groups").add({
    name,
    code,
    is_active: true,
    owner_id: ownerId,
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

export async function setGroupActive(formData: FormData): Promise<{ error?: string }> {
  const ownerId = await getAdminUid();
  if (!ownerId) return { error: "Unauthorized" };
  const groupId = formData.get("groupId") as string;
  const isActive = formData.get("isActive") === "true";
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured." };
  const groupSnap = await db.collection("groups").doc(groupId).get();
  const data = groupSnap.data();
  if (!groupSnap.exists || (data?.owner_id as string) !== ownerId) return { error: "Unauthorized" };
  await db.collection("groups").doc(groupId).update({ is_active: isActive });
  return {};
}

/** Run matching for a group. When called from panel, ownerId must match group.owner_id. */
export async function runMatchingForGroup(
  groupId: string,
  options?: { skipOwnershipCheck?: boolean }
): Promise<{ error?: string; matched?: number; unmatched?: number; trios?: number }> {
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Firebase not configured." };

  const groupSnap = await db.collection("groups").doc(groupId).get();
  if (!groupSnap.exists) return { error: "Group not found." };
  const groupData = groupSnap.data();
  const ownerId = groupData?.owner_id as string | undefined;

  if (!options?.skipOwnershipCheck) {
    const currentUid = await getAdminUid();
    if (!currentUid) return { error: "Unauthorized" };
    if (ownerId !== currentUid) return { error: "You can only trigger matching for your own groups." };
  }

  const usersSnap = await db.collection("users").where("group_id", "==", groupId).get();
  const userIds = usersSnap.docs.map((d) => d.id);
  if (userIds.length === 0) return { error: "No users in group." };

  const responsesSnap = await db.collection("questionnaire_responses").where("group_id", "==", groupId).get();
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

  const sanitize = (obj: unknown): unknown =>
    obj === undefined ? null : Array.isArray(obj) ? obj.map(sanitize) : obj && typeof obj === "object" ? Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [k, sanitize(v)])) : obj;

  const matchedIds = new Set<string>();
  for (const m of result.pairMatches) {
    matchedIds.add(m.user_ids[0]);
    matchedIds.add(m.user_ids[1]);
    await db.collection("matches").add({
      group_id: groupId,
      user_ids: m.user_ids,
      match_type: "pair",
      compatibility_score: m.compatibility_score,
      match_explanation: sanitize(m.match_explanation) as Record<string, unknown>,
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
      match_explanation: sanitize(m.match_explanation) as Record<string, unknown>,
      created_at: new Date(),
    });
  }
  for (const uid of matchedIds) {
    const userRef = db.collection("users").doc(uid);
    await userRef.update({ is_matched: true });
  }
  return { matched: result.pairMatches.length * 2 + result.trioMatches.length * 3, unmatched: result.unmatchedUserIds.length, trios: result.trioMatches.length };
}

export async function triggerMatching(groupId: string): Promise<{ error?: string; matched?: number; unmatched?: number; trios?: number }> {
  return runMatchingForGroup(groupId);
}

/** Set admin session from Firebase idToken (e.g. after signup). */
export async function setAdminSession(idToken: string): Promise<{ ok: boolean; error?: string }> {
  return verifyAdminByFirebase(idToken);
}
