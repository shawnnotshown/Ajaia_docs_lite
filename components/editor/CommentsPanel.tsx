"use client";

import { FormEvent, useState } from "react";
import type { DocumentComment } from "@/types";

interface CommentsPanelProps {
  open: boolean;
  onClose: () => void;
  comments: DocumentComment[];
  canAdd: boolean;
  canResolve: boolean;
  onAdd: (text: string) => Promise<void>;
  onResolve: (commentId: string) => Promise<void>;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function CommentsPanel({
  open,
  onClose,
  comments,
  canAdd,
  canResolve,
  onAdd,
  onResolve,
}: CommentsPanelProps) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const openComments = comments.filter((comment) => !comment.resolved);
  const resolvedComments = comments.filter((comment) => comment.resolved);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || !canAdd) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onAdd(text.trim());
      setText("");
    } catch {
      setError("Unable to add comment.");
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    setResolvingId(commentId);
    setError(null);
    try {
      await onResolve(commentId);
    } catch {
      setError("Unable to resolve comment.");
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Comments</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          aria-label="Close comments"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {openComments.length === 0 ? (
          <p className="text-sm text-slate-500">No open comments yet.</p>
        ) : (
          openComments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {comment.user_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTime(comment.created_at)}
                  </p>
                </div>
                {canResolve && (
                  <button
                    type="button"
                    onClick={() => handleResolve(comment.id)}
                    disabled={resolvingId === comment.id}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
                  >
                    {resolvingId === comment.id ? "Resolving…" : "Resolve"}
                  </button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {comment.text}
              </p>
            </article>
          ))
        )}

        {resolvedComments.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Resolved
            </h3>
            <div className="space-y-3">
              {resolvedComments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3 opacity-70"
                >
                  <p className="text-sm font-medium text-slate-700">
                    {comment.user_name}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                    {comment.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
        {canAdd ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={3}
              placeholder="Add a comment…"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">
            You have view-only access and cannot comment.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </aside>
  );
}
