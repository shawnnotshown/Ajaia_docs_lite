# Ajaia Docs Lite — Submission

**Candidate:** Shawn Mikel Parungao Campo  
**Email:** s.mikelcampo@gmail.com

## Links

- **Google Drive folder:** YOUR_GOOGLE_DRIVE_FOLDER_LINK
- **Live product:** https://ajaia-docs-lite-six.vercel.app/
- **Walkthrough video:** https://drive.google.com/file/d/1RPxKP5u5Sri5KLvzXHIdTcTFaHCsFIpk/view?usp=sharing

## Demo credentials

No passwords. Use the sidebar **Switch user** panel:

| Name | Email |
| --- | --- |
| Shawn Campo | shawn@example.com |
| Alex Rivera | alex@example.com |

### Suggested review path

1. Open the live app as **Shawn Campo**.
2. Click **New Document**, rename the title, apply bold / heading / list formatting.
3. Refresh to confirm persistence.
4. Click **Share** and grant **Alex Rivera** access as **Editor** (or try Viewer / Commenter).
5. Switch to **Alex Rivera** in the sidebar.
6. Open the document under **Shared with Me** and confirm role behavior (edit vs comment-only vs view-only).
7. As Shawn, open Comments and Version History; confirm presence when both users have the doc open.
8. Export Markdown or PDF from the export menu.
9. Switch back to Shawn, open Share, and remove Alex.
10. Switch to Alex again and confirm access is denied.
11. Optional: import a `.txt` or `.md` file (max 1 MB).

## Google Drive folder contents

- Source code
- `README.md` — local setup and run instructions
- `ARCHITECTURE.md` — prioritization and tradeoffs
- `AI_WORKFLOW.md` — AI tools used, what was accepted/rejected, verification
- `SUBMISSION.md` — deliverables checklist and demo path
- Walkthrough video URL text file

## Local setup

Prerequisites: Node.js 18+, npm, Firebase project with Firestore.

```bash
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_FIREBASE_* values
npm run dev
```

Tests: `npm test`

Full details are in `README.md` in the Drive folder.

## What is working

- Demo user switching with localStorage persistence
- Create document and open editor
- Rename document title
- Rich-text editing (bold, italic, underline, H1/H2, bullet/numbered lists)
- Auto-save and manual save, with save status indicator
- Save and reopen documents after refresh
- Import `.txt` and `.md` files (max 1 MB)
- Share / unshare between demo users with role tiers (**viewer**, **commenter**, **editor**)
- Visible distinction between owned documents and **Shared with Me**
- Access-denied page for unauthorized documents
- Presence indicators for users currently viewing a document
- Comments (add / resolve, role-aware)
- Version history (save snapshots on edit, restore)
- Export as Markdown and PDF (print-based PDF)
- Document delete from the dashboard
- Persistence via Firebase Firestore
- Live deployment on Vercel
- Unit tests for access helpers and import validation

## What is incomplete

- Mocked authentication only (no real login/passwords)
- Frontend-enforced access control (Firestore rules open for demo use only)
- Document body is not live-synced between editors (presence and comments update in real time; content requires refresh)
- No DOCX import/export
- PDF export uses browser print, not a generated PDF file
- Markdown import is best-effort (headings/lists), not full CommonMark fidelity

## What you would build next with another 2–4 hours

1. Firebase Authentication (email magic link or anonymous auth mapped to demo personas)
2. Server-side access checks via Firestore security rules using authenticated `request.auth.uid`
3. Live document-content listeners so co-editors see remote saves without refresh
4. Stronger markdown import fidelity and optional DOCX import
5. True PDF file generation (instead of print dialog)
6. End-to-end Playwright smoke tests for create → share by role → revoke

## Stack

Next.js 14, React, TypeScript, Firebase Firestore, Tiptap, Tailwind, Vitest, Vercel.
