import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { getSharesForDocument, removeShare } from "@/lib/shares";
import type { Document, TiptapDocument } from "@/types";
import { EMPTY_DOCUMENT_CONTENT } from "@/types";

function toIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return new Date().toISOString();
}

function mapDocument(id: string, data: Record<string, unknown>): Document {
  return {
    id,
    title: (data.title as string) || "Untitled Document",
    content_json: (data.content_json as TiptapDocument) || EMPTY_DOCUMENT_CONTENT,
    owner_id: data.owner_id as string,
    created_at: toIso(data.created_at),
    updated_at: toIso(data.updated_at),
  };
}

export async function createDocument(
  ownerId: string,
  options?: {
    title?: string;
    content_json?: TiptapDocument;
  }
): Promise<Document> {
  const db = getDb();
  const ref = doc(collection(db, "documents"));
  const now = new Date().toISOString();

  const document: Document = {
    id: ref.id,
    title: options?.title?.trim() || "Untitled Document",
    content_json: options?.content_json || EMPTY_DOCUMENT_CONTENT,
    owner_id: ownerId,
    created_at: now,
    updated_at: now,
  };

  await setDoc(ref, document);
  return document;
}

export async function getDocument(id: string): Promise<Document | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "documents", id));

  if (!snap.exists()) {
    return null;
  }

  return mapDocument(snap.id, snap.data());
}

export async function updateDocument(
  id: string,
  patch: {
    title?: string;
    content_json?: TiptapDocument;
  }
): Promise<void> {
  const db = getDb();
  const title =
    patch.title !== undefined
      ? patch.title.trim() || "Untitled Document"
      : undefined;

  await updateDoc(doc(db, "documents", id), {
    ...(title !== undefined ? { title } : {}),
    ...(patch.content_json !== undefined
      ? { content_json: patch.content_json }
      : {}),
    updated_at: new Date().toISOString(),
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = getDb();
  const shares = await getSharesForDocument(id);

  await Promise.all([
    deleteDoc(doc(db, "documents", id)),
    ...shares.map((share) => removeShare(id, share.user_id)),
  ]);
}

export async function getUserDocuments(userId: string): Promise<Document[]> {
  const db = getDb();
  const q = query(collection(db, "documents"), where("owner_id", "==", userId));

  const snap = await getDocs(q);
  return snap.docs
    .map((item) => mapDocument(item.id, item.data()))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}

export async function getDocumentsByIds(ids: string[]): Promise<Document[]> {
  if (ids.length === 0) {
    return [];
  }

  const results = await Promise.all(ids.map((id) => getDocument(id)));
  return results
    .filter((docItem): docItem is Document => docItem !== null)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}
