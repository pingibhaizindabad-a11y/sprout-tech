"use server";

import { getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getCurrentUid } from "@/lib/firebase/auth-server";
import type { Json } from "@/types/database";

export async function saveDraft(answers: Json) {
  const uid = await getCurrentUid();
  if (!uid) return { error: "Not signed in." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Server not configured." };
  const userDoc = await db.collection("users").doc(uid).get();
  const groupId = userDoc.data()?.group_id;
  if (!groupId) return { error: "No group." };
  const docId = `${uid}_${groupId}`;
  await db.collection("questionnaire_responses").doc(docId).set(
    { user_id: uid, group_id: groupId, answers, is_locked: false, updated_at: new Date() },
    { merge: true }
  );
  return {};
}

export async function submitQuestionnaire(answers: Json) {
  const uid = await getCurrentUid();
  if (!uid) return { error: "Not signed in." };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { error: "Server not configured." };
  const userDoc = await db.collection("users").doc(uid).get();
  const groupId = userDoc.data()?.group_id;
  if (!groupId) return { error: "No group." };
  const docId = `${uid}_${groupId}`;
  const existing = await db.collection("questionnaire_responses").doc(docId).get();
  const existingData = existing.data();
  if (existingData?.submitted_at) return { error: "Already submitted." };
  await db.collection("questionnaire_responses").doc(docId).set({
    user_id: uid,
    group_id: groupId,
    answers,
    submitted_at: new Date(),
    is_locked: false,
    updated_at: new Date(),
  });
  await db.collection("users").doc(uid).update({ questionnaire_submitted: true });
  return {};
}

export async function getMyResponse(): Promise<{ answers: Json | null; isLocked: boolean; submitted: boolean }> {
  const uid = await getCurrentUid();
  if (!uid) return { answers: null, isLocked: false, submitted: false };
  const db = getAdminFirestoreIfConfigured();
  if (!db) return { answers: null, isLocked: false, submitted: false };
  const userDoc = await db.collection("users").doc(uid).get();
  const groupId = userDoc.data()?.group_id;
  if (!groupId) return { answers: null, isLocked: false, submitted: false };
  const docId = `${uid}_${groupId}`;
  const doc = await db.collection("questionnaire_responses").doc(docId).get();
  const data = doc.data();
  const submitted = !!data?.submitted_at;
  return {
    answers: (data?.answers as Json) ?? null,
    isLocked: data?.is_locked ?? false,
    submitted,
  };
}
