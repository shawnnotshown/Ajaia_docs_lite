import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { DocumentComment } from "@/types";

function mapComment(
  id: string,
  data: Record<string, unknown>
): DocumentComment {
  return {
    id,
    document_id: data.document_id as string,
    user_id: data.user_id as string,
    user_name: (data.user_name as string) || "Unknown",
    text: (data.text as string) || "",
    resolved: Boolean(data.resolved),
    created_at: (data.created_at as string) || new Date().toISOString(),
  };
}

export async function addComment(
  documentId: string,
  userId: string,
  userName: string,
  text: string
): Promise<DocumentComment> {
  const db = getDb();
  const ref = doc(collection(db, "document_comments"));
  const comment: DocumentComment = {
    id: ref.id,
    document_id: documentId,
    user_id: userId,
    user_name: userName,
    text: text.trim(),
    resolved: false,
    created_at: new Date().toISOString(),
  };

  await setDoc(ref, comment);
  return comment;
}

export async function resolveComment(commentId: string): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "document_comments", commentId), {
    resolved: true,
  });
}

export function subscribeToComments(
  documentId: string,
  callback: (comments: DocumentComment[]) => void
): () => void {
  const db = getDb();
  const q = query(
    collection(db, "document_comments"),
    where("document_id", "==", documentId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const comments = snap.docs
        .map((item) => mapComment(item.id, item.data()))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      callback(comments);
    },
    () => {
      callback([]);
    }
  );
}
