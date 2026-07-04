import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { DocumentPresence, User } from "@/types";

const PRESENCE_TTL_MS = 30_000;

function presenceDocId(documentId: string, userId: string): string {
  return `${documentId}_${userId}`;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date().toISOString();
}

function mapPresence(
  id: string,
  data: Record<string, unknown>
): DocumentPresence {
  return {
    id,
    document_id: data.document_id as string,
    user_id: data.user_id as string,
    user_name: (data.user_name as string) || "Unknown",
    last_seen: toIso(data.last_seen),
  };
}

export async function joinDocument(
  documentId: string,
  user: User
): Promise<void> {
  const db = getDb();
  const id = presenceDocId(documentId, user.id);

  await setDoc(doc(db, "document_presence", id), {
    id,
    document_id: documentId,
    user_id: user.id,
    user_name: user.name,
    last_seen: serverTimestamp(),
  });
}

export async function leaveDocument(
  documentId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  await deleteDoc(
    doc(db, "document_presence", presenceDocId(documentId, userId))
  );
}

export function subscribeToPresence(
  documentId: string,
  callback: (presence: DocumentPresence[]) => void
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "document_presence"),
    where("document_id", "==", documentId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const cutoff = Date.now() - PRESENCE_TTL_MS;
      const active = snap.docs
        .map((item) => mapPresence(item.id, item.data()))
        .filter((item) => new Date(item.last_seen).getTime() >= cutoff)
        .sort((a, b) => a.user_name.localeCompare(b.user_name));

      callback(active);
    },
    () => {
      callback([]);
    }
  );
}
