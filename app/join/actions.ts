"use server";

import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import { cookies } from "next/headers";

const GROUP_COOKIE = "sprout_group_id";

/** Validate code only (no auth required). Returns group info for client to store in sessionStorage and redirect to /auth. */
export async function validateGroupCodeOnly(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  groupId?: string;
  groupName?: string;
  groupCode?: string;
}> {
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a group code." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { ok: false, error: "Something went wrong. Please try again." };
  try {
    const snap = await db.collection("groups").where("code", "==", code).where("is_active", "==", true).limit(1).get();
    const doc = snap.docs[0];
    if (!doc) return { ok: false, error: "Invalid or inactive group code. Check with your organizer." };
    const data = doc.data();
    return {
      ok: true,
      groupId: doc.id,
      groupName: (data.name as string) ?? "",
      groupCode: (data.code as string) ?? code,
    };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function validateGroupCode(formData: FormData): Promise<{ ok: boolean; error?: string; next?: "dashboard" | "questionnaire" }> {
  const uid = await getCurrentUid();
  if (!uid) return { ok: false, error: "You must be logged in to join a group. Log in first." };
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a group code." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { ok: false, error: "Something went wrong. Please try again." };
  try {
    const snap = await db.collection("groups").where("code", "==", code).where("is_active", "==", true).limit(1).get();
    const doc = snap.docs[0];
    if (!doc) return { ok: false, error: "Invalid or inactive group code. Check with your organizer." };
    const groupId = doc.id;
    const store = await cookies();
    store.set(GROUP_COOKIE, groupId, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 });
    await db.collection("users").doc(uid).set({ group_id: groupId }, { merge: true });
    const userSnap = await db.collection("users").doc(uid).get();
    const submitted = userSnap.data()?.questionnaire_submitted === true;
    return { ok: true, next: submitted ? "dashboard" : "questionnaire" };
  } catch {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function getStoredGroupId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GROUP_COOKIE)?.value ?? null;
}
