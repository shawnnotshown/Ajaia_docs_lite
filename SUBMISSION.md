# Submission — Ajaia Docs Lite

## Live Product URL

https://ajaia-docs-lite-six.vercel.app/

## Source Code Location

This repository root.

## Walkthrough Video URL

_Add your walkthrough video URL here._

## Demo Credentials / Demo User Switching Instructions

This app does not use passwords. Use the sidebar user switcher:

| Name        | Email             |
| ----------- | ----------------- |
| Shawn Campo | shawn@example.com |
| Alex Rivera | alex@example.com  |

Suggested demo path:

1. Open the app as **Shawn Campo**.
2. Click **New Document**.
3. Rename the title and apply formatting (bold, heading, list).
4. Refresh to confirm persistence.
5. Click **Share** and grant access to **Alex Rivera**.
6. Switch to **Alex Rivera** in the sidebar.
7. Open the document from **Shared with Me** and edit it.
8. Switch back to Shawn, open Share, and remove Alex.
9. Switch to Alex again and confirm access is denied.

## Included Files

- `README.md` — setup and usage
- `ARCHITECTURE.md` — system design and tradeoffs
- `AI_WORKFLOW.md` — AI-assisted development notes
- `SUBMISSION.md` — this file
- `firestore.rules` — demo Firestore rules
- `.env.example` — required environment variables
- Application source under `app/`, `components/`, `context/`, `lib/`, `types/`, and `tests/`

## Features That Work

- Demo user switching with localStorage persistence
- Create document and open editor
- Rich-text editing with toolbar controls
- Auto-save and manual save
- Save status indicator
- Import `.txt` and `.md` files (max 1 MB)
- Share / unshare between demo users
- Shared-with-me dashboard section
- Access-denied page for unauthorized documents
- Empty states for document lists
- Unit tests for access and import validation

## Known Limitations

- Mocked authentication only
- Frontend-enforced access control
- No real-time collaboration
- No comments, version history, or presence
- No DOCX/PDF support
- Open Firestore rules intended for demo use only

## What I Would Build Next With Another 2–4 Hours

1. Firebase Authentication (email magic link or anonymous auth mapped to demo personas)
2. Server-side access checks via Firestore security rules using authenticated `request.auth.uid`
3. Lightweight real-time listeners so shared editors see remote saves without refresh
4. Document delete and rename-from-dashboard actions
5. Better import preview and markdown fidelity
6. End-to-end Playwright smoke tests for create → share → revoke
