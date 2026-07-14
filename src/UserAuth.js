import { useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/popup-closed-by-user":
      return "Login dibatalkan. Silakan coba lagi.";
    case "auth/popup-blocked":
      return "Popup diblokir. Izinkan popup lalu coba lagi.";
    case "auth/unauthorized-domain":
      return "Domain ini belum diizinkan di Firebase Auth. Tambahkan localhost atau domain aplikasi di panel Authentication > Settings > Authorized domains.";
    case "auth/network-request-failed":
      return "Koneksi bermasalah. Periksa jaringan lalu coba lagi.";
    default:
      return "Gagal masuk. Coba lagi ya.";
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (redirectError) {
        setError(getAuthErrorMessage(redirectError));
      } finally {
        setLoading(false);
      }
    }

    handleRedirectResult();
    return () => unsub();
  }, []);

  async function signIn() {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          setError(getAuthErrorMessage(redirectError));
        }
      } else {
        setError(getAuthErrorMessage(error));
      }
    }
  }

  async function signOutUser() {
    await firebaseSignOut(auth);
  }

  return { user, loading, error, signIn, signOut: signOutUser };
}
