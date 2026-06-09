import { db } from "./config";
import emailjs from "@emailjs/browser";

// Remove redundant init if it's already in config.js, but for safety in this debug phase:
// emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY); 

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (email, logFn = console.log) => {
  logFn("sendOTP: Function started");

  if (!import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
    logFn("sendOTP Error: Missing EmailJS Key");
    alert("CRITICAL: VITE_EMAILJS_PUBLIC_KEY is missing!");
    return false;
  }

  const otp = generateOTP();
  logFn(`sendOTP: OTP Generated ${otp}`);

  // Local Backup for Offline/Timeout scenarios
  localStorage.setItem("temp_otp_payload", JSON.stringify({
    email,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins
  }));

  // RAM Backup for extra safety
  try {
    window.AGROOT_RAM_OTP = {
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };
    logFn("sendOTP: Saved to RAM (window.AGROOT_RAM_OTP)");
  } catch (e) {
    logFn("sendOTP: RAM Save Failed? " + e.message);
  }

  // IMMEDIATE READBACK CHECK
  const check = localStorage.getItem("temp_otp_payload");
  logFn(`sendOTP: Saved to LocalStorage. Readback: ${check ? "OK" : "FAILED"}`);

  const docRef = doc(db, "otp_requests", email);
  logFn("sendOTP: DocRef created");

  try {
    // Save OTP in Firestore
    logFn("sendOTP: Starting setDoc...");

    // Add a race with timeout to see if it hangs
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore Timeout (5s)")), 5000)
    );

    await Promise.race([
      setDoc(docRef, {
        email,
        otp,
        verified: false,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        )
      }),
      timeoutPromise
    ]);

    logFn("sendOTP: setDoc successful");
  } catch (err) {
    logFn(`sendOTP Error (Firestore): ${err.message} - PROCEEDING ANYWAY`);
    // Do NOT throw here. We want to try sending email even if DB fails.
  }

  logFn("sendOTP: Preparing EmailJS...");

  try {
    // Send OTP via EmailJS
    logFn("sendOTP: Calling emailjs.send...");
    const emailRes = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        email: email, // must match {{email}}
        otp: otp       // must match {{otp}}
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    logFn(`sendOTP: emailjs.send success (${emailRes.status} ${emailRes.text})`);
  } catch (err) {
    logFn(`sendOTP Error (EmailJS): ${err.message}`);
    throw err;
  }

  return true;
};

// Returns { success: boolean, message: string }
export const verifyOTP = async (email, enteredOTP, logFn = console.log) => {
  logFn("verifyOTP: Starting (Forced Local Mode)...");

  /* FIRESTORE DISABLED FOR DEBUGGING
  // 1. Check Firestore with Timeout
  try {
    logFn("verifyOTP: Checking Firestore...");
    const docRef = doc(db, "otp_requests", email);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore Timeout (2s)")), 2000)
    );

    const snap = await Promise.race([
      getDoc(docRef),
      timeoutPromise
    ]);

    if (snap.exists()) {
      const data = snap.data();
      const now = new Date();
      if (data.expiresAt.toDate() < now) {
        logFn("verifyOTP: Firestore OTP expired");
        return false;
      }
      if (data.otp === enteredOTP) {
        logFn("verifyOTP: Firestore Match!");
        await deleteDoc(docRef);
        return true;
      } else {
        logFn(`verifyOTP: Firestore Mismatch (Input: ${enteredOTP}, DB: ${data.otp})`);
      }
    } else {
      logFn("verifyOTP: No doc in Firestore");
    }
  } catch (err) {
    logFn(`verifyOTP: Firestore failed (${err.message}). Trying local...`);
  }
  */

  // 2. Fallback to LocalStorage
  logFn("verifyOTP: Checking LocalStorage...");
  let raw = localStorage.getItem("temp_otp_payload");

  // RAM Fallback if LocalStorage failed
  if (!raw && window.AGROOT_RAM_OTP) {
    logFn("verifyOTP: LocalStorage empty, checking RAM...");
    raw = JSON.stringify(window.AGROOT_RAM_OTP);
  }

  if (!raw) {
    logFn("verifyOTP: No local backup found (RAM or Storage)");
    return { success: false, message: "No OTP found on device. Resend OTP." };
  }

  try {
    const data = JSON.parse(raw);
    logFn(`verifyOTP: Local Data found for ${data.email}`);

    if (data.email !== email) {
      logFn(`verifyOTP: Email mismatch (Input: ${email}, Stored: ${data.email})`);
      return { success: false, message: "Email mismatch. Did you change email?" };
    }
    if (Date.now() > data.expiresAt) {
      logFn("verifyOTP: Local OTP expired");
      return { success: false, message: "OTP Expired" };
    }
    if (String(data.otp).trim() === String(enteredOTP).trim()) {
      logFn("verifyOTP: Local Match!");
      localStorage.removeItem("temp_otp_payload");
      return { success: true, message: "Verified" };
    } else {
      logFn(`verifyOTP: Local Mismatch (Input: ${enteredOTP}, Stored: ${data.otp})`);
      return { success: false, message: `Incorrect OTP (Expected: ${data.otp})` }; // Showing expected for debug!
    }
  } catch (e) {
    logFn(`verifyOTP: Local parse error: ${e.message}`);
    return { success: false, message: "Internal Error (Parse)" };
  }
};