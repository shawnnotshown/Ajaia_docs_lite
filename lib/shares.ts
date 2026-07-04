import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { DocumentShare, ShareRole } from "@/types";

function shareDocId(documentId: string, userId: string): string {
  return `${documentId}_${userId}`;
}

function mapShare(id: string, data: Record<string, unknown>): DocumentShare {
  const role = data.role as ShareRole | undefined;

  return {
    id,
    document_id: data.document_id as string,
    user_id: data.user_id as string,
    role: role === "viewer" || role === "commenter" || role === "editor"
      ? role
      : "editor",
    created_at: (data.created_at as string) || new Date().toISOString(),
  };
}

export async function getSharesForDocument(
  documentId: string
): Promise<DocumentShare[]> {
  const db = getDb();
  const q = query(
    collection(db, "document_shares"),
    where("document_id", "==", documentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => mapShare(item.id, item.data()));
}

export async function getSharesForUser(
  userId: string
): Promise<DocumentShare[]> {
  const db = getDb();
  const q = query(
    collection(db, "document_shares"),
    where("user_id", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((item) => mapShare(item.id, item.data()));
}

export async function shareDocument(
  documentId: string,
  userId: string,
  role: ShareRole = "editor"
): Promise<DocumentShare> {
  const db = getDb();
  const id = shareDocId(documentId, userId);
  const ref = doc(db, "document_shares", id);

  const share: DocumentShare = {
    id,
    document_id: documentId,
    user_id: userId,
    role,
    created_at: new Date().toISOString(),
  };

  await setDoc(ref, share);
  return share;
}

export async function updateShareRole(
  documentId: string,
  userId: string,
  role: ShareRole
): Promise<DocumentShare> {
  return shareDocument(documentId, userId, role);
}

export async function removeShare(
  documentId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, "document_shares", shareDocId(documentId, userId)));
}
