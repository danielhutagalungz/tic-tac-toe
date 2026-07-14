import { useEffect, useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signIn() {
    setError("");
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      setError("Gagal masuk. Coba lagi ya.");
    }
  }

  async function signOutUser() {
    await firebaseSignOut(auth);
  }

  return { user, loading, error, signIn, signOut: signOutUser };
}