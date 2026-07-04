import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "@/lib/firebase";
import { DEMO_USERS } from "@/types";

let seedPromise: Promise<void> | null = null;

/**
 * Ensures the two demo users exist in Firestore.
 * Safe to call multiple times; runs only once per page session.
 */
export async function ensureDemoUsersSeeded(): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }

  if (!seedPromise) {
    seedPromise = (async () => {
      const db = getDb();

      await Promise.all(
        DEMO_USERS.map(async (user) => {
          const ref = doc(db, "users", user.id);
          const existing = await getDoc(ref);
          if (!existing.exists()) {
            await setDoc(ref, user);
          }
        })
      );
    })();
  }

  return seedPromise;
}
