import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "./config";

export const setupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
    }
  );

  return window.recaptchaVerifier;
};

export const sendOTP = async (phoneNumber) => {
  const appVerifier = setupRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};