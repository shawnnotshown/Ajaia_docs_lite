"use client";

import type { DocumentPresence } from "@/types";

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

interface PresenceBarProps {
  presence: DocumentPresence[];
  currentUserId: string;
}

export default function PresenceBar({
  presence,
  currentUserId,
}: PresenceBarProps) {
  if (presence.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2" aria-label="Active collaborators">
      <div className="flex -space-x-2">
        {presence.map((person) => {
          const isCurrent = person.user_id === currentUserId;
          return (
            <div
              key={person.id}
              title={`${person.user_name}${isCurrent ? " (you)" : ""}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${colorForUser(
                person.user_id
              )}`}
            >
              {initials(person.user_name)}
            </div>
          );
        })}
      </div>
      <span className="text-xs text-slate-500">
        {presence.length === 1
          ? "1 person here"
          : `${presence.length} people here`}
      </span>
    </div>
  );
}
