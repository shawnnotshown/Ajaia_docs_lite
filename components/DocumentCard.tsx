"use client";

import { useState } from "react";
import Link from "next/link";
import ShareModal from "@/components/editor/ShareModal";
import { deleteDocument } from "@/lib/documents";
import { getSharesForDocument } from "@/lib/shares";
import type { Document, DocumentShare, User } from "@/types";

interface DocumentCardProps {
  document: Document;
  activeUserId: string;
  owner?: User;
  onDeleted?: (documentId: string) => void;
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51 15.42 17.49" />
      <path d="M15.41 6.51 8.59 10.49" />
    </svg>
  );
}

function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function DocumentCard({
  document,
  activeUserId,
  owner,
  onDeleted,
}: DocumentCardProps) {
  const isOwner = document.owner_id === activeUserId;
  const ownershipLabel = isOwner
    ? "Owned by you"
    : `Shared by ${owner?.name ?? "Unknown"}`;

  const [shareOpen, setShareOpen] = useState(false);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleShareClick = async () => {
    setShareLoading(true);

    try {
      const docShares = await getSharesForDocument(document.id);
      setShares(docShares);
      setShareOpen(true);
    } catch {
      setShares([]);
      setShareOpen(true);
    } finally {
      setShareLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteDocument(document.id);
      setDeleteOpen(false);
      onDeleted?.(document.id);
    } catch {
      setDeleteError("Unable to delete document. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <>
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="min-w-0 flex-1 outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <h3 className="truncate text-base font-semibold text-slate-900">
              {document.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Updated {formatDate(document.updated_at)}
            </p>
            <p className="mt-3 text-sm text-slate-600">{ownershipLabel}</p>
          </Link>

          {isOwner ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareClick}
                disabled={shareLoading}
                title="Share document"
                aria-label={`Share ${document.title}`}
                className="inline-flex items-center justify-center rounded-full bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShareIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
                title="Delete document"
                aria-label={`Delete ${document.title}`}
                className="inline-flex items-center justify-center rounded-full bg-red-50 p-2 text-red-600 transition hover:bg-red-100 hover:text-red-700"
              >
                <DeleteIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span
              className="shrink-0 rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700"
              title="Shared with you"
            >
              Shared
            </span>
          )}
        </div>
      </article>

      {isOwner && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          documentId={document.id}
          ownerId={document.owner_id}
          shares={shares}
          onSharesChange={setShares}
        />
      )}

      {isOwner && deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete document?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              “{document.title}” will be permanently deleted. This cannot be
              undone.
            </p>

            {deleteError && (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
