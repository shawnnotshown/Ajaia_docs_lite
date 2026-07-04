export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface TiptapDocument {
  type: "doc";
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

export interface Document {
  id: string;
  title: string;
  content_json: TiptapDocument;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type ShareRole = "viewer" | "commenter" | "editor";

export type AccessRole = ShareRole | "owner";

export interface DocumentShare {
  id: string;
  document_id: string;
  user_id: string;
  role: ShareRole;
  created_at: string;
}

export interface DocumentPresence {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  last_seen: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  user_id: string;
  user_name: string;
  text: string;
  resolved: boolean;
  created_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  title: string;
  content_json: TiptapDocument;
  saved_by: string;
  saved_by_name: string;
  saved_at: string;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const EMPTY_DOCUMENT_CONTENT: TiptapDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const SHARE_ROLES: ShareRole[] = ["viewer", "commenter", "editor"];

export const DEMO_USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Shawn Campo",
    email: "shawn@example.com",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Alex Rivera",
    email: "alex@example.com",
  },
];

export const DEFAULT_USER_ID = DEMO_USERS[0].id;
