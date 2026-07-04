import type {
  AccessRole,
  Document,
  DocumentShare,
  ShareRole,
} from "@/types";

/**
 * A user may open a document when they own it or have a share record.
 * Access is enforced in the frontend for this demo (mocked auth).
 */
export function canAccess(
  doc: Document,
  shares: DocumentShare[],
  userId: string
): boolean {
  return getUserRole(doc, shares, userId) !== null;
}

/**
 * Only the document owner may manage sharing.
 */
export function canShare(doc: Document, userId: string): boolean {
  return doc.owner_id === userId;
}

/**
 * Resolve the active user's role for a document.
 * Returns null when the user has no access.
 */
export function getUserRole(
  doc: Document,
  shares: DocumentShare[],
  userId: string
): AccessRole | null {
  if (doc.owner_id === userId) {
    return "owner";
  }

  const share = shares.find(
    (item) => item.document_id === doc.id && item.user_id === userId
  );

  return share?.role ?? null;
}

export function canView(role: AccessRole | null): boolean {
  return role !== null;
}

export function canComment(role: AccessRole | null): boolean {
  return role === "owner" || role === "editor" || role === "commenter";
}

export function canEdit(role: AccessRole | null): boolean {
  return role === "owner" || role === "editor";
}

export function canResolveComments(role: AccessRole | null): boolean {
  return role === "owner" || role === "editor";
}

export function roleLabel(role: AccessRole | ShareRole): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "editor":
      return "Editor";
    case "commenter":
      return "Commenter";
    case "viewer":
      return "Viewer";
  }
}
