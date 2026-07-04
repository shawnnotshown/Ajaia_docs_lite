"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentCard from "@/components/DocumentCard";
import ImportButton from "@/components/ImportButton";
import Spinner from "@/components/Spinner";
import UserSwitcher from "@/components/UserSwitcher";
import { useUser } from "@/context/UserContext";
import { createDocument, getDocumentsByIds, getUserDocuments } from "@/lib/documents";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getSharesForUser } from "@/lib/shares";
import { DEMO_USERS, type Document } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { activeUser, ready } = useUser();
  const [myDocuments, setMyDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!isFirebaseConfigured()) {
      setError(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const owned = await getUserDocuments(activeUser.id);
      const shares = await getSharesForUser(activeUser.id);
      const shared = await getDocumentsByIds(
        shares.map((share) => share.document_id)
      );

      setMyDocuments(owned);
      setSharedDocuments(shared);
    } catch {
      setError("Unable to load documents. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  }, [activeUser.id, ready]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);

    try {
      const document = await createDocument(activeUser.id);
      router.push(`/documents/${document.id}`);
    } catch {
      setError("Unable to create document. Please try again.");
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-200 bg-white p-5 lg:border-b-0 lg:border-r">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Ajaia Docs Lite
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">Documents</h1>
        </div>
        <UserSwitcher />
      </aside>

      <main className="px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome, {activeUser.name.split(" ")[0]}
              </h2>
              <p className="mt-1 text-slate-600">
                Create, import, and manage your documents.
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating || !isFirebaseConfigured()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? "Creating…" : "New Document"}
              </button>
              <ImportButton />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <Spinner label="Loading documents…" className="mt-16" />
          ) : (
            <div className="mt-8 space-y-10">
              <section>
                <h3 className="text-lg font-semibold text-slate-900">
                  My Documents
                </h3>
                {myDocuments.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                    <p className="font-medium text-slate-800">
                      No documents yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a new document or import a .txt / .md file to get
                      started.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {myDocuments.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        activeUserId={activeUser.id}
                        onDeleted={(documentId) =>
                          setMyDocuments((current) =>
                            current.filter((item) => item.id !== documentId)
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-900">
                  Shared with Me
                </h3>
                {sharedDocuments.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                    <p className="font-medium text-slate-800">
                      Nothing shared with you
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Documents shared by other users will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {sharedDocuments.map((document) => (
                      <DocumentCard
                        key={document.id}
                        document={document}
                        activeUserId={activeUser.id}
                        owner={DEMO_USERS.find(
                          (user) => user.id === document.owner_id
                        )}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
