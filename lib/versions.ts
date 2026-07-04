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
import { updateDocument } from "@/lib/documents";
import type { Document, DocumentVersion, TiptapDocument } from "@/types";
import { EMPTY_DOCUMENT_CONTENT } from "@/types";

const MAX_VERSIONS = 20;

function mapVersion(
  id: string,
  data: Record<string, unknown>
): DocumentVersion {
  return {
    id,
    document_id: data.document_id as string,
    title: (data.title as string) || "Untitled Document",
    content_json:
      (data.content_json as TiptapDocument) || EMPTY_DOCUMENT_CONTENT,
    saved_by: data.saved_by as string,
    saved_by_name: (data.saved_by_name as string) || "Unknown",
    saved_at: (data.saved_at as string) || new Date().toISOString(),
  };
}

export async function saveVersion(
  document: Document,
  userId: string,
  userName: string
): Promise<DocumentVersion> {
  const db = getDb();
  const ref = doc(collection(db, "document_versions"));
  const version: DocumentVersion = {
    id: ref.id,
    document_id: document.id,
    title: document.title,
    content_json: document.content_json,
    saved_by: userId,
    saved_by_name: userName,
    saved_at: new Date().toISOString(),
  };

  await setDoc(ref, version);

  const existing = await getVersions(document.id);
  if (existing.length > MAX_VERSIONS) {
    const overflow = existing.slice(MAX_VERSIONS);
    await Promise.all(
      overflow.map((item) =>
        deleteDoc(doc(db, "document_versions", item.id))
      )
    );
  }

  return version;
}

export async function getVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  const db = getDb();
  const q = query(
    collection(db, "document_versions"),
    where("document_id", "==", documentId)
  );
  const snap = await getDocs(q);

  return snap.docs
    .map((item) => mapVersion(item.id, item.data()))
    .sort(
      (a, b) =>
        new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
    );
}

export async function restoreVersion(
  documentId: string,
  version: DocumentVersion
): Promise<void> {
  await updateDocument(documentId, {
    title: version.title,
    content_json: version.content_json,
  });
}
