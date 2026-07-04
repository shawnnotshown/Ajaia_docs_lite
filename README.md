# Ajaia Docs Lite

A lightweight collaborative document editor inspired by Google Docs. Users can create, edit, format, save, import, share, comment, and export documents between two seeded demo users.

This is a time-boxed product exercise focused on a reliable end-to-end experience.

**Live demo:** [https://ajaia-docs-lite-six.vercel.app/](https://ajaia-docs-lite-six.vercel.app/)

**Submission materials:** [Google Drive folder](https://drive.google.com/drive/folders/1tFxRxPMcFfa-GBVKZ5TFNb-q3Bf2mTPK?usp=sharing) · [Walkthrough video](https://drive.google.com/file/d/1RPxKP5u5Sri5KLvzXHIdTcTFaHCsFIpk/view?usp=sharing)

## Features Implemented

- Demo user switcher (Shawn Campo / Alex Rivera) with localStorage persistence
- Document dashboard with **My Documents** and **Shared with Me**
- Create, rename, and delete documents
- Rich-text editor powered by Tiptap (bold, italic, underline, H1, H2, bullet/numbered lists)
- Auto-save with debounce plus a manual Save button
- Save status indicator (`Saving…`, `Saved`, `Unable to save`)
- Import `.txt` and `.md` files (max 1 MB)
- Role-based sharing: **viewer**, **commenter**, **editor** (owner-only share management)
- Access-denied page for unauthorized documents
- Live presence indicators for users currently viewing a document
- Comments (add / resolve, role-aware)
- Version history (snapshots on save, restore)
- Export as Markdown or PDF (print-based PDF)
- Automated unit tests for access and file validation helpers

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **React 18**
- **Firebase Firestore**
- **Tiptap** (JSON document format)
- **Tailwind CSS**
- **Vitest**
- **Vercel** (deployment target)

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- A Firebase project with Firestore enabled

### Install

```bash
npm install
```

### Environment Variables

Copy the example file and fill in your Firebase web app config:

```bash
cp .env.example .env.local
```

Required variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

You can find these values in the Firebase Console under **Project settings → Your apps → Web app**.

### Configure Firebase / Firestore

1. Create a Firebase project.
2. Enable **Cloud Firestore** (start in test mode for this demo, or deploy the included `firestore.rules`).
3. Register a **Web app** and copy the config values into `.env.local`.
4. Deploy rules if desired:

```bash
firebase deploy --only firestore:rules
```

> **Note:** This demo uses mocked authentication. Access control is enforced in the frontend. The included Firestore rules allow open read/write for demo convenience and are **not** production-safe.

### Seed Demo Users

Demo users are seeded automatically on first app load:

| Name         | Email             | ID                                   |
| ------------ | ----------------- | ------------------------------------ |
| Shawn Campo  | shawn@example.com | `11111111-1111-1111-1111-111111111111` |
| Alex Rivera  | alex@example.com  | `22222222-2222-2222-2222-222222222222` |

No manual seed script is required. The app writes these users to the `users` collection if they do not already exist.

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to Run Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Tests cover:

- Document access helpers (`canAccess`, `canShare`, role permissions)
- File import validation (type and size)

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add the same `NEXT_PUBLIC_FIREBASE_*` environment variables in the Vercel project settings.
4. Deploy.

Build command: `next build`  
Output: Next.js default

Live deployment: [https://ajaia-docs-lite-six.vercel.app/](https://ajaia-docs-lite-six.vercel.app/)

After deploy, open the live URL and run through the demo checklist in `SUBMISSION.md`.

## Demo Users and Switching

Use the **Switch user** panel in the left sidebar on the dashboard:

1. Start as **Shawn Campo**.
2. Create or import a document.
3. Open the document and click **Share**.
4. Grant access to **Alex Rivera** as Viewer, Commenter, or Editor.
5. Switch to **Alex Rivera** in the sidebar.
6. Confirm the document appears under **Shared with Me** and role behavior matches.

The active user is stored in `localStorage` and survives page refresh.

## Known Limitations

- No real authentication (demo user switcher only)
- Access control is frontend-only
- Document body is not live-synced between editors (presence and comments update in real time; content requires refresh)
- No multi-cursor collaboration
- No DOCX import/export
- PDF export uses browser print, not a generated PDF file
- Markdown import is best-effort (headings/lists), not full CommonMark fidelity
- Firestore rules are intentionally open for the demo

## Project Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start local dev server   |
| `npm run build`   | Production build         |
| `npm run start`   | Start production server  |
| `npm run lint`    | Run ESLint               |
| `npm test`        | Run unit tests once      |
| `npm run test:watch` | Run tests in watch mode |

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — system design and tradeoffs
- [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) — AI-assisted development notes
- [`SUBMISSION.md`](./SUBMISSION.md) — submission details and demo checklist
- [`WALKTHROUGH_VIDEO_URL.txt`](./WALKTHROUGH_VIDEO_URL.txt) — walkthrough video URL
