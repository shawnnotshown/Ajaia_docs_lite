"use client";

import { useEffect, useState } from "react";
import {
  DEMO_USERS,
  SHARE_ROLES,
  type DocumentShare,
  type ShareRole,
  type User,
} from "@/types";
import { roleLabel } from "@/lib/access";
import { removeShare, shareDocument, updateShareRole } from "@/lib/shares";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  ownerId: string;
  shares: DocumentShare[];
  onSharesChange: (shares: DocumentShare[]) => void;
}

export default function ShareModal({
  open,
  onClose,
  documentId,
  ownerId,
  shares,
  onSharesChange,
}: ShareModalProps) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<ShareRole>("editor");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const availableUsers = DEMO_USERS.filter(
    (user) =>
      user.id !== ownerId && !shares.some((share) => share.user_id === user.id)
  );

  const sharedEntries = shares
    .map((share) => {
      const user = DEMO_USERS.find((item) => item.id === share.user_id);
      return user ? { share, user } : null;
    })
    .filter(
      (entry): entry is { share: DocumentShare; user: User } => entry !== null
    );

  useEffect(() => {
    if (!open) {
      setSelectedUserId("");
      setSelectedRole("editor");
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleShare = async () => {
    if (!selectedUserId) {
      setError("Select a user to share with.");
      return;
    }

    if (shares.some((share) => share.user_id === selectedUserId)) {
      setError("This user already has access.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const share = await shareDocument(
        documentId,
        selectedUserId,
        selectedRole
      );
      onSharesChange([...shares, share]);
      setSelectedUserId("");
      setSelectedRole("editor");
    } catch {
      setError("Unable to share document. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (userId: string, role: ShareRole) => {
    setBusy(true);
    setError(null);

    try {
      const updated = await updateShareRole(documentId, userId, role);
      onSharesChange(
        shares.map((share) => (share.user_id === userId ? updated : share))
      );
    } catch {
      setError("Unable to update role. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setBusy(true);
    setError(null);

    try {
      await removeShare(documentId, userId);
      onSharesChange(shares.filter((share) => share.user_id !== userId));
    } catch {
      setError("Unable to remove access. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="share-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              Share document
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Grant access with viewer, commenter, or editor permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Add people
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={busy || availableUsers.length === 0}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">
                {availableUsers.length
                  ? "Select a user"
                  : "No users available to share with"}
              </option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(event.target.value as ShareRole)
              }
              disabled={busy}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {SHARE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleShare}
            disabled={busy || !selectedUserId}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working…" : "Grant access"}
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800">
            People with access
          </h3>
          {sharedEntries.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Not shared with anyone yet.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {sharedEntries.map(({ share, user }) => (
                <li
                  key={user.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={share.role}
                      onChange={(event) =>
                        handleRoleChange(
                          user.id,
                          event.target.value as ShareRole
                        )
                      }
                      disabled={busy}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:border-blue-500"
                      aria-label={`Role for ${user.name}`}
                    >
                      {SHARE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel(role)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemove(user.id)}
                      disabled={busy}
                      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
