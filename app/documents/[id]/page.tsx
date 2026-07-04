"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CommentsPanel from "@/components/editor/CommentsPanel";
import ExportMenu from "@/components/editor/ExportMenu";
import PresenceBar from "@/components/editor/PresenceBar";
import ShareModal from "@/components/editor/ShareModal";
import TiptapEditor from "@/components/editor/TiptapEditor";
import VersionHistoryPanel from "@/components/editor/VersionHistoryPanel";
import Spinner from "@/components/Spinner";
import { useUser } from "@/context/UserContext";
import {
  canComment,
  canEdit,
  canResolveComments,
  canShare,
  getUserRole,
  roleLabel,
} from "@/lib/access";
import { addComment, resolveComment, subscribeToComments } from "@/lib/comments";
import { getDocument, updateDocument } from "@/lib/documents";
import { useDebounce } from "@/lib/hooks";
import {
  joinDocument,
  leaveDocument,
  subscribeToPresence,
} from "@/lib/presence";
import { getSharesForDocument } from "@/lib/shares";
import { restoreVersion, saveVersion } from "@/lib/versions";
import type {
  Document,
  DocumentComment,
  DocumentPresence,
  DocumentShare,
  DocumentVersion,
  SaveStatus,
  TiptapDocument,
} from "@/types";
import { EMPTY_DOCUMENT_CONTENT } from "@/types";

export default function DocumentEditorPage() {
  const params = useParams<{ id: string }>();
  const documentId = params.id;
  const { activeUser, ready } = useUser();

  const [document, setDocument] = useState<Document | null>(null);
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<TiptapDocument>(EMPTY_DOCUMENT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [presence, setPresence] = useState<DocumentPresence[]>([]);
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsRefreshKey, setVersionsRefreshKey] = useState(0);

  const hydratedRef = useRef(false);
  const lastSavedRef = useRef<{ title: string; content: string } | null>(null);

  const debouncedTitle = useDebounce(title, 800);
  const debouncedContent = useDebounce(content, 800);

  const userRole = useMemo(() => {
    if (!document) {
      return null;
    }
    return getUserRole(document, shares, activeUser.id);
  }, [document, shares, activeUser.id]);

  const editable = canEdit(userRole);
  const commentable = canComment(userRole);
  const resolvable = canResolveComments(userRole);
  const ownerCanShare = document
    ? canShare(document, activeUser.id)
    : false;

  const loadDocument = useCallback(async () => {
    if (!ready || !documentId) {
      return;
    }

    setLoading(true);
    setAccessDenied(false);
    hydratedRef.current = false;

    try {
      const [doc, docShares] = await Promise.all([
        getDocument(documentId),
        getSharesForDocument(documentId),
      ]);

      if (!doc || !getUserRole(doc, docShares, activeUser.id)) {
        setAccessDenied(true);
        setDocument(null);
        return;
      }

      setDocument(doc);
      setShares(docShares);
      setTitle(doc.title);
      setContent(doc.content_json);
      lastSavedRef.current = {
        title: doc.title,
        content: JSON.stringify(doc.content_json),
      };
      setSaveStatus("saved");
      hydratedRef.current = true;
    } catch {
      setAccessDenied(true);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [activeUser.id, documentId, ready]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    if (!document || !ready) {
      return;
    }

    void joinDocument(document.id, activeUser);
    const heartbeat = window.setInterval(() => {
      void joinDocument(document.id, activeUser);
    }, 15_000);

    const unsubscribe = subscribeToPresence(document.id, setPresence);

    return () => {
      window.clearInterval(heartbeat);
      unsubscribe();
      void leaveDocument(document.id, activeUser.id);
    };
  }, [document?.id, activeUser, ready]);

  useEffect(() => {
    if (!document || !ready) {
      return;
    }

    return subscribeToComments(document.id, setComments);
  }, [document?.id, ready]);

  const persist = useCallback(
    async (nextTitle: string, nextContent: TiptapDocument) => {
      if (!document || !canEdit(getUserRole(document, shares, activeUser.id))) {
        return false;
      }

      const normalizedTitle = nextTitle.trim() || "Untitled Document";
      const payloadKey = {
        title: normalizedTitle,
        content: JSON.stringify(nextContent),
      };

      if (
        lastSavedRef.current &&
        lastSavedRef.current.title === payloadKey.title &&
        lastSavedRef.current.content === payloadKey.content
      ) {
        return true;
      }

      setSaveStatus("saving");

      try {
        await updateDocument(document.id, {
          title: normalizedTitle,
          content_json: nextContent,
        });

        if (normalizedTitle !== nextTitle) {
          setTitle(normalizedTitle);
        }

        lastSavedRef.current = payloadKey;
        const updatedDocument: Document = {
          ...document,
          title: normalizedTitle,
          content_json: nextContent,
          updated_at: new Date().toISOString(),
        };
        setDocument(updatedDocument);
        setSaveStatus("saved");
        return true;
      } catch {
        setSaveStatus("error");
        return false;
      }
    },
    [document, shares, activeUser.id]
  );

  useEffect(() => {
    if (!hydratedRef.current || !document || !editable) {
      return;
    }

    void persist(debouncedTitle, debouncedContent);
  }, [debouncedTitle, debouncedContent, document, persist, editable]);

  const handleManualSave = async () => {
    if (!document || !editable) {
      return;
    }

    setManualSaving(true);
    const saved = await persist(title, content);
    if (saved) {
      const snapshot: Document = {
        ...document,
        title: title.trim() || "Untitled Document",
        content_json: content,
      };
      try {
        await saveVersion(snapshot, activeUser.id, activeUser.name);
        setVersionsRefreshKey((value) => value + 1);
      } catch {
        // Version history is best-effort; document save already succeeded.
      }
    }
    setManualSaving(false);
  };

  const handleAddComment = async (text: string) => {
    if (!document) {
      return;
    }
    await addComment(document.id, activeUser.id, activeUser.name, text);
  };

  const handleResolveComment = async (commentId: string) => {
    await resolveComment(commentId);
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
    if (!document || !editable) {
      return;
    }

    await restoreVersion(document.id, version);
    setTitle(version.title);
    setContent(version.content_json);
    lastSavedRef.current = {
      title: version.title,
      content: JSON.stringify(version.content_json),
    };
    setDocument({
      ...document,
      title: version.title,
      content_json: version.content_json,
      updated_at: new Date().toISOString(),
    });
    setSaveStatus("saved");
    setVersionsRefreshKey((value) => value + 1);
  };

  const openComments = comments.filter((comment) => !comment.resolved).length;

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Unable to save"
          : "";

  if (loading || !ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner label="Loading document…" />
      </main>
    );
  }

  if (accessDenied || !document || !userRole) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Document not found or access denied
          </h1>
          <p className="mt-3 text-slate-600">
            This document does not exist, or you do not have permission to open
            it.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Documents
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Back to Documents
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <PresenceBar
                presence={presence}
                currentUserId={activeUser.id}
              />
              {editable && (
                <span
                  className={`text-sm ${
                    saveStatus === "error" ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {statusLabel}
                </span>
              )}
              {editable && (
                <button
                  type="button"
                  onClick={handleManualSave}
                  disabled={manualSaving || saveStatus === "saving"}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {manualSaving ? "Saving…" : "Save"}
                </button>
              )}
              <ExportMenu title={title} content={content} />
              <button
                type="button"
                onClick={() => {
                  setCommentsOpen((current) => !current);
                  setVersionsOpen(false);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  commentsOpen
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Comments{openComments > 0 ? ` (${openComments})` : ""}
              </button>
              <button
                type="button"
                onClick={() => {
                  setVersionsOpen((current) => !current);
                  setCommentsOpen(false);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  versionsOpen
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                History
              </button>
              {ownerCanShare && (
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Share
                </button>
              )}
            </div>
          </div>

          <input
            value={title}
            onChange={(event) => {
              if (!editable) {
                return;
              }
              setTitle(event.target.value);
              if (saveStatus === "saved") {
                setSaveStatus("idle");
              }
            }}
            onBlur={() => {
              if (!title.trim()) {
                setTitle("Untitled Document");
              }
            }}
            readOnly={!editable}
            aria-label="Document title"
            className={`w-full border-0 bg-transparent text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-400 ${
              !editable ? "cursor-default" : ""
            }`}
            placeholder="Untitled Document"
          />
          <p className="text-sm text-slate-500">
            Viewing as {activeUser.name} ({roleLabel(userRole)})
          </p>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-0 px-4 py-6 sm:px-6">
        <div
          className={`min-w-0 flex-1 ${
            commentsOpen || versionsOpen ? "pr-4" : ""
          }`}
        >
          {saveStatus === "error" && editable && (
            <div className="no-print mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to save your changes. Check your connection and try again.
            </div>
          )}

          {!editable && (
            <div className="no-print mb-4 rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
              You have {roleLabel(userRole).toLowerCase()} access. Editing is
              disabled.
            </div>
          )}

          <TiptapEditor
            key={`${document.id}-${activeUser.id}-${editable}`}
            content={content}
            editable={editable}
            onChange={(next) => {
              if (!editable) {
                return;
              }
              setContent(next);
              if (saveStatus === "saved") {
                setSaveStatus("idle");
              }
            }}
          />
        </div>

        {commentsOpen && (
          <div className="no-print sticky top-4 h-[calc(100vh-8rem)] shrink-0">
            <CommentsPanel
              open={commentsOpen}
              onClose={() => setCommentsOpen(false)}
              comments={comments}
              canAdd={commentable}
              canResolve={resolvable}
              onAdd={handleAddComment}
              onResolve={handleResolveComment}
            />
          </div>
        )}

        {versionsOpen && (
          <div className="no-print sticky top-4 h-[calc(100vh-8rem)] shrink-0">
            <VersionHistoryPanel
              open={versionsOpen}
              onClose={() => setVersionsOpen(false)}
              documentId={document.id}
              canRestore={editable}
              onRestore={handleRestoreVersion}
              refreshKey={versionsRefreshKey}
            />
          </div>
        )}
      </div>

      {ownerCanShare && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          documentId={document.id}
          ownerId={document.owner_id}
          shares={shares}
          onSharesChange={setShares}
        />
      )}
    </main>
  );
}
