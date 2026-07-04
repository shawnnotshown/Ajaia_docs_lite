# Architecture — Ajaia Docs Lite

## High-Level Overview

Ajaia Docs Lite is a Next.js App Router application that stores documents and share relationships in Firebase Firestore. The UI is a client-rendered productivity surface with:

- A dashboard for listing owned and shared documents
- A Tiptap-based editor for rich-text editing
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

- Document-oriented storage fits the `documents` / `document_shares` model
- Simple client SDK for create/read/update/share flows
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
| `created_at`  | string | ISO timestamp                                 |

The composite share ID prevents duplicate `document_id` + `user_id` pairs.

## Document Access and Sharing Logic

Because authentication is mocked, access rules are enforced in the frontend and documented here.

A user may open a document when:

1. `document.owner_id === activeUser.id`, or
2. A matching `document_shares` record exists for `activeUser.id`

A user may manage sharing only when:

1. `document.owner_id === activeUser.id`

Shared users may edit title and content in this version.

Helpers live in `lib/access.ts`:

- `canAccess(doc, shares, userId)`
- `canShare(doc, userId)`

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
4. UI shows `Saving…` / `Saved` / `Unable to save`

### Import

1. User selects `.txt` or `.md` file
2. Client validates extension and size (<= 1 MB)
3. Text is converted to Tiptap JSON
4. New owned document is created and opened

### Share

1. Owner opens Share modal
2. Selects the other demo user
3. Share record is written
4. Recipient sees the document under **Shared with Me** after switching users

## Frontend Structure

```
app/                  Routes and layout
components/           UI building blocks
context/              Active user state
lib/                  Firebase, access, import helpers
types/                Shared TypeScript models
tests/                Unit tests
```

## Tradeoffs and Intentionally Excluded Features

To protect core functionality within the time limit, the following were intentionally deprioritized:

- Real-time collaboration / multi-cursor editing
- Live presence indicators
- Comments or suggestion mode
- Version history
- Advanced permissions beyond owner and shared editor
- Production authentication (Firebase Auth, sessions, OAuth)
- Complex file types such as `.docx`
- Mobile-first advanced layouts
- Server-side access enforcement

These exclusions keep the product focused on a reliable create → edit → persist → share loop that reviewers can complete end to end.
