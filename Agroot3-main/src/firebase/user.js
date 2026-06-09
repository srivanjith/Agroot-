import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";

export const createOrGetUser = async ({ email, phone }) => {
  const userRef = doc(db, "users", email);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      email,
      phone: phone || "",
      language: "",
      region: "",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
    return { isNew: true };
  } else {
    await setDoc(
      userRef,
      { lastLogin: serverTimestamp() },
      { merge: true }
    );
    return { isNew: false };
  }
};

export const updateUserLanguage = async (userId, language) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    language,
    updatedAt: new Date(),
  });
};