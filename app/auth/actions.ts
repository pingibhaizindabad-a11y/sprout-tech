"use server";

import { getAdminAuthIfConfigured, getAdminFirestoreIfConfigured } from "@/lib/firebase/admin";
import { getStoredGroupId } from "@/app/join/actions";
import { setAuthCookie, clearAuthCookie } from "@/lib/firebase/auth-server";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";

/** Call after client-side sign in/sign up. Verifies token, syncs user to Firestore, sets auth cookie, redirects. */
export async function syncUserAndSetCookie(
  idToken: string,
  name?: string,
  bio?: string,
  avatarUrl?: string,
  groupIdFromClient?: string,
  groupCodeFromClient?: string,
  groupNameFromClient?: string
): Promise<{ error?: string }> {
  const groupId = groupIdFromClient ?? (await getStoredGroupId());
  try {
    const db = getAdminFirestoreIfConfigured();
    const auth = getAdminAuthIfConfigured();
    if (!db || !auth) {
      const err = "Firebase Admin not configured. Add FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) to .env.local.";
      console.error(err);
      return { error: err };
    }
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;
    const email = decoded.email ?? "";
    const displayName = name ?? decoded.name ?? email.split("@")[0];
    const userRef = db.collection("users").doc(uid);
    const existing = await userRef.get();
    const isNewUser = !existing.exists;
    const existingData = existing.data();
    const payload = {
      name: displayName,
      email,
      bio: bio ?? "",
      avatar_url: avatarUrl ?? "",
      group_id: groupId ?? null,
      group_code: groupCodeFromClient ?? "",
      group_name: groupNameFromClient ?? "",
      is_matched: isNewUser ? false : (existingData?.is_matched ?? false),
      questionnaire_submitted: isNewUser ? false : (existingData?.questionnaire_submitted ?? false),
      created_at: existingData?.created_at ?? FieldValue.serverTimestamp(),
    };
    await userRef.set(payload, { merge: true });
    if (process.env.NODE_ENV === "development") {
      console.log("User written to Firestore:", uid);
    }
    await setAuthCookie(idToken);
    const after = await userRef.get();
    const data = after.data();
    const hasGroup = !!data?.group_id;
    const submitted = data?.questionnaire_submitted === true;
    if (!hasGroup) redirect("/join");
    if (submitted) redirect("/dashboard");
    redirect("/questionnaire");
  } catch (e) {
    console.error("Firestore write or auth error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("not configured") || msg.includes("missing env") || msg.includes("Firebase Admin")) {
      return { error: "Firebase not connected. Check .env.local has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY." };
    }
    return { error: "Invalid or expired sign-in. Try again." };
  }
}


export async function signOut() {
  await clearAuthCookie();
  redirect("/");
}
