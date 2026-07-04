"use client";

import { useEffect, useState } from "react";
import type { DocumentVersion, TiptapDocument } from "@/types";
import { getVersions } from "@/lib/versions";

interface VersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  canRestore: boolean;
  onRestore: (version: DocumentVersion) => Promise<void>;
  refreshKey?: number;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function previewText(content: TiptapDocument): string {
  const walk = (nodes: TiptapDocument["content"] = []): string =>
    nodes
      .map((node) => {
        if (node.text) {
          return node.text;
        }
        return walk(node.content);
      })
      .join(" ");

  const text = walk(content.content).replace(/\s+/g, " ").trim();
  return text.slice(0, 200) || "(empty document)";
}

export default function VersionHistoryPanel({
  open,
  onClose,
  documentId,
  canRestore,
  onRestore,
  refreshKey = 0,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<DocumentVersion | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await getVersions(documentId);
        if (!cancelled) {
          setVersions(items);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load version history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, documentId, refreshKey]);

  if (!open) {
    return null;
  }

  const handleRestore = async (version: DocumentVersion) => {
    setRestoringId(version.id);
    setError(null);
    try {
      await onRestore(version);
      setPreview(null);
    } catch {
      setError("Unable to restore this version.");
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      <aside className="flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Version history
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close version history"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading versions…</p>
          ) : versions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No saved versions yet. Use Save to create a snapshot.
            </p>
          ) : (
            versions.map((version) => (
              <article
                key={version.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="text-sm font-medium text-slate-800">
                  {formatTime(version.saved_at)}
                </p>
                <p className="text-xs text-slate-500">
                  Saved by {version.saved_by_name}
                </p>
                <p className="mt-1 truncate text-xs text-slate-600">
                  {version.title}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreview(version)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Preview
                  </button>
                  {canRestore && (
                    <button
                      type="button"
                      onClick={() => handleRestore(version)}
                      disabled={restoringId === version.id}
                      className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {restoringId === version.id ? "Restoring…" : "Restore"}
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </aside>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="version-preview-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="version-preview-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {preview.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatTime(preview.saved_at)} · {preview.saved_by_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <p className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {previewText(preview.content_json)}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {canRestore && (
                <button
                  type="button"
                  onClick={() => handleRestore(preview)}
                  disabled={restoringId === preview.id}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {restoringId === preview.id ? "Restoring…" : "Restore"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
