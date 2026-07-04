import { describe, expect, it } from "vitest";
import {
  canAccess,
  canComment,
  canEdit,
  canResolveComments,
  canShare,
  canView,
  getUserRole,
} from "@/lib/access";
import type { Document, DocumentShare } from "@/types";
import { EMPTY_DOCUMENT_CONTENT } from "@/types";

const ownerId = "11111111-1111-1111-1111-111111111111";
const editorId = "22222222-2222-2222-2222-222222222222";
const commenterId = "33333333-3333-3333-3333-333333333333";
const viewerId = "44444444-4444-4444-4444-444444444444";
const outsiderId = "55555555-5555-5555-5555-555555555555";

const document: Document = {
  id: "doc-1",
  title: "Team Notes",
  content_json: EMPTY_DOCUMENT_CONTENT,
  owner_id: ownerId,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const shares: DocumentShare[] = [
  {
    id: "doc-1_editor",
    document_id: "doc-1",
    user_id: editorId,
    role: "editor",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "doc-1_commenter",
    document_id: "doc-1",
    user_id: commenterId,
    role: "commenter",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "doc-1_viewer",
    document_id: "doc-1",
    user_id: viewerId,
    role: "viewer",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("canAccess", () => {
  it("returns true for the document owner", () => {
    expect(canAccess(document, shares, ownerId)).toBe(true);
  });

  it("returns true for a shared user", () => {
    expect(canAccess(document, shares, editorId)).toBe(true);
    expect(canAccess(document, shares, commenterId)).toBe(true);
    expect(canAccess(document, shares, viewerId)).toBe(true);
  });

  it("returns false for a user without access", () => {
    expect(canAccess(document, shares, outsiderId)).toBe(false);
  });
});

describe("canShare", () => {
  it("returns true only for the owner", () => {
    expect(canShare(document, ownerId)).toBe(true);
    expect(canShare(document, editorId)).toBe(false);
  });
});

describe("getUserRole", () => {
  it("returns owner for the document owner", () => {
    expect(getUserRole(document, shares, ownerId)).toBe("owner");
  });

  it("returns the share role for shared users", () => {
    expect(getUserRole(document, shares, editorId)).toBe("editor");
    expect(getUserRole(document, shares, commenterId)).toBe("commenter");
    expect(getUserRole(document, shares, viewerId)).toBe("viewer");
  });

  it("returns null for outsiders", () => {
    expect(getUserRole(document, shares, outsiderId)).toBeNull();
  });
});

describe("role permissions", () => {
  it("allows viewing for all access roles", () => {
    expect(canView("owner")).toBe(true);
    expect(canView("editor")).toBe(true);
    expect(canView("commenter")).toBe(true);
    expect(canView("viewer")).toBe(true);
    expect(canView(null)).toBe(false);
  });

  it("allows commenting for owner, editor, and commenter", () => {
    expect(canComment("owner")).toBe(true);
    expect(canComment("editor")).toBe(true);
    expect(canComment("commenter")).toBe(true);
    expect(canComment("viewer")).toBe(false);
  });

  it("allows editing only for owner and editor", () => {
    expect(canEdit("owner")).toBe(true);
    expect(canEdit("editor")).toBe(true);
    expect(canEdit("commenter")).toBe(false);
    expect(canEdit("viewer")).toBe(false);
  });

  it("allows resolving comments only for owner and editor", () => {
    expect(canResolveComments("owner")).toBe(true);
    expect(canResolveComments("editor")).toBe(true);
    expect(canResolveComments("commenter")).toBe(false);
    expect(canResolveComments("viewer")).toBe(false);
  });
});
