# AI Workflow — Ajaia Docs Lite

## AI Tools Used

- **Cursor** — primary implementation environment for scaffolding, coding, tests, and documentation
- **ChatGPT / Cursor Agent** — planning support, boilerplate generation, and documentation drafting

## Tasks Where AI Sped Up Implementation

### Initial project scaffolding

- Generated the Next.js App Router project structure
- Installed and wired Firebase, Tiptap, Tailwind, and Vitest dependencies
- Established folder conventions for `app/`, `components/`, `lib/`, `context/`, and `tests/`

### Tiptap toolbar setup

- Drafted the editor component with StarterKit + Underline
- Produced toolbar actions for bold, italic, underline, headings, and lists
- Connected editor JSON output to the auto-save pipeline

### Firestore query drafting

- Drafted CRUD helpers for `documents` and `document_shares`
- Implemented share uniqueness via composite document IDs
- Added demo-user seed logic for fixed UUIDs
- Extended to presence, comments, and version snapshots with `onSnapshot` where useful

### Role-based access and stretch features

- Role helpers (`viewer` / `commenter` / `editor` / `owner`)
- Share modal role selection
- Comments panel, presence bar, version history, and export menu

### Test case brainstorming

- Defined access-control cases for owner, shared roles, and outsider
- Defined file validation cases for unsupported types and oversized files
- Kept tests focused on pure helpers for reliability without Firebase mocks

### Documentation drafting

- Produced README setup instructions
- Drafted architecture notes and submission materials
- Documented known limitations and non-goals

## Output Reviewed, Changed, or Rejected

All generated code was reviewed manually before acceptance.

Adjustments made to match product requirements:

- Used Firebase Firestore instead of the PRD’s Supabase SQL examples while preserving the same logical data model
- Enforced empty-title fallback to `Untitled Document`
- Limited import support to `.txt` and `.md` only
- Restricted Share UI to document owners
- Added role tiers instead of a single shared-editor permission
- Added access-denied handling for unauthorized document opens
- Sorted owned/shared documents client-side to avoid requiring a Firestore composite index
- Added presence, comments, version history, and Markdown/PDF export as stretch work after core flows were solid

Rejected unnecessary complexity or unstable dependencies:

- No CRDT / OT live body co-editing libraries
- No DOCX parsers
- No production auth providers
- No extra state-management libraries beyond React context

## Verification Steps

### Manual testing checklist

Run after Firebase env vars are configured:

- [ ] Create a document as Shawn
- [ ] Rename title and apply formatting
- [ ] Confirm auto-save status transitions
- [ ] Refresh and confirm persistence
- [ ] Import `.txt` / `.md` files
- [ ] Reject unsupported file types and files over 1 MB
- [ ] Share document from Shawn to Alex as Editor / Commenter / Viewer
- [ ] Switch to Alex and open under **Shared with Me**
- [ ] Confirm role behavior (edit vs comment-only vs view-only)
- [ ] Confirm presence when both users have the document open
- [ ] Add and resolve a comment
- [ ] Open version history and restore a snapshot
- [ ] Export Markdown and PDF
- [ ] Delete a document from the dashboard
- [ ] Remove Alex’s access as Shawn
- [ ] Confirm Alex receives access denied afterward
- [ ] Confirm active user survives refresh

### Automated tests

```bash
npm test
```

### Deployment smoke test

After deploying to Vercel with Firebase env vars configured:

1. Open the live URL: https://ajaia-docs-lite-six.vercel.app/
2. Switch users
3. Create, edit, share by role, comment, and revoke access once
4. Confirm no console/runtime blockers on the happy path

## Submission links

- Google Drive folder: https://drive.google.com/drive/folders/1tFxRxPMcFfa-GBVKZ5TFNb-q3Bf2mTPK?usp=sharing
- Live product: https://ajaia-docs-lite-six.vercel.app/
- Walkthrough video: https://drive.google.com/file/d/1RPxKP5u5Sri5KLvzXHIdTcTFaHCsFIpk/view?usp=sharing
