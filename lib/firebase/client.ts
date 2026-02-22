"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseClientConfig, requireClientEnv } from "./config";

let connected = false;

function getApp() {
  if (getApps().length === 0) {
    requireClientEnv();
    const app = initializeApp(firebaseClientConfig);
    if (typeof window !== "undefined") {
      console.log("Firebase connected (client)");
      connected = true;
    }
    return app;
  }
  return getApps()[0];
}

export function getFirebaseAuth() {
  return getAuth(getApp());
}

export function getFirebaseFirestore() {
  return getFirestore(getApp());
}

export function getFirebaseStorage() {
  return getStorage(getApp());
}
