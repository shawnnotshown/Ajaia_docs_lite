# Architecture — Ajaia Docs Lite

## High-Level Overview

Ajaia Docs Lite is a Next.js App Router application that stores documents, shares, presence, comments, and versions in Firebase Firestore. The UI is a client-rendered productivity surface with:

- A dashboard for listing owned and shared documents
- A Tiptap-based editor for rich-text editing
- Role-based sharing, comments, presence, and version history
- A demo user switcher that simulates authentication

```
┌────────────────────┐
│  Browser (React)   │
│  UserContext       │
│  Dashboard / Editor│
└─────────┬──────────┘
          │ Firebase Web SDK
          ▼
┌────────────────────┐
│ Firebase Firestore │
│ users              │
│ documents          │
│ document_shares    │
│ document_presence  │
│ document_comments  │
│ document_versions  │
└────────────────────┘
```

There is no custom backend API. The Next.js app talks directly to Firestore from the browser using the Firebase client SDK.

## Why These Technologies

### React + Next.js

- Fast scaffolding and familiar component model
- App Router pages map cleanly to `/` and `/documents/[id]`
- Easy deployment to Vercel
- TypeScript support for safer data modeling

### Tiptap

- Mature ProseMirror-based editor
- Built-in extensions for the required toolbar actions
- Native JSON document format preserves formatting across refresh and save cycles

### Firebase Firestore

- Document-oriented storage fits documents, shares, comments, presence, and versions
- Simple client SDK for CRUD and `onSnapshot` listeners
- No server to operate for this demo scope

### Vercel

- First-class Next.js hosting
- Simple environment variable configuration
- Fast preview and production deploys

## Data Model

### `users`

Seeded demo users with fixed IDs:

| Field       | Type   | Notes                |
| ----------- | ------ | -------------------- |
| `id`        | string | Fixed UUID           |
| `name`      | string | Display name         |
| `email`     | string | Unique demo email    |
| `avatar_url`| string | Optional / unused    |

### `documents`

| Field          | Type   | Notes                                      |
| -------------- | ------ | ------------------------------------------ |
| `id`           | string | Firestore document ID                      |
| `title`        | string | Defaults to `Untitled Document`            |
| `content_json` | object | Tiptap JSON document                       |
| `owner_id`     | string | References `users.id`                      |
| `created_at`   | string | ISO timestamp                              |
| `updated_at`   | string | ISO timestamp, updated on every save       |

### `document_shares`

| Field         | Type   | Notes                                         |
| ------------- | ------ | --------------------------------------------- |
| `id`          | string | Composite `{documentId}_{userId}`             |
| `document_id` | string | Shared document                               |
| `user_id`     | string | User granted access                           |
| `role`        | string | `viewer` \| `commenter` \| `editor`           |
| `created_at`  | string | ISO timestamp                                 |

The composite share ID prevents duplicate `document_id` + `user_id` pairs.

### Supporting collections

- **Presence** — who is currently viewing a document (`last_seen` heartbeat)
- **Comments** — text comments with resolve state
- **Versions** — snapshots of title/content on save for restore

## Document Access and Sharing Logic

Because authentication is mocked, access rules are enforced in the frontend and documented here.

A user may open a document when:

1. `document.owner_id === activeUser.id`, or
2. A matching `document_shares` record exists for `activeUser.id`

A user may manage sharing only when:

1. `document.owner_id === activeUser.id`

Role capabilities:

| Role | View | Comment | Edit body | Resolve comments | Manage shares |
| ---- | ---- | ------- | --------- | ---------------- | ------------- |
| owner | yes | yes | yes | yes | yes |
| editor | yes | yes | yes | yes | no |
| commenter | yes | yes | no | no | no |
| viewer | yes | no | no | no | no |

Helpers live in `lib/access.ts`:

- `getUserRole`, `canAccess`, `canShare`
- `canView`, `canComment`, `canEdit`, `canResolveComments`

The editor page loads the document and its shares, then blocks unauthorized users with:

> Document not found or access denied

## Key Application Flows

### Create document

1. Active user clicks **New Document**
2. App writes a Firestore document with empty Tiptap JSON
3. User is redirected to `/documents/:id`

### Auto-save

1. Title or content changes update local state
2. Debounce (800ms) triggers `updateDocument`
3. Empty titles are normalized to `Untitled Document`
4. A version snapshot is written best-effort
5. UI shows `Saving…` / `Saved` / `Unable to save`

### Import

1. User selects `.txt` or `.md` file
2. Client validates extension and size (<= 1 MB)
3. Text is converted to Tiptap JSON
4. New owned document is created and opened

### Share

1. Owner opens Share modal
2. Selects the other demo user and a role
3. Share record is written
4. Recipient sees the document under **Shared with Me** after switching users

### Presence and comments

1. Opening a document joins presence and starts a heartbeat
2. Presence and comments subscribe via Firestore `onSnapshot`
3. Document body content is loaded once and saved on edit — it is **not** live-synced between clients

## Frontend Structure

```
app/                  Routes and layout
components/           UI building blocks (editor, share, comments, presence, export)
context/              Active user state
lib/                  Firebase, access, import, comments, presence, versions, export
types/                Shared TypeScript models
tests/                Unit tests
```

## Tradeoffs and Intentionally Excluded Features

Prioritized a reliable create → edit → persist → share loop, then added focused stretch features (roles, presence, comments, versions, export).

Intentionally deprioritized:

- Live co-editing of document body content (no CRDT / OT)
- Multi-cursor collaboration
- Production authentication (Firebase Auth, sessions, OAuth)
- Server-side access enforcement (Firestore rules are open for demo)
- DOCX import/export
- True PDF file generation (export uses browser print)
- Full CommonMark import fidelity

These exclusions keep the product focused on a reviewable end-to-end path within the timebox.
