"use client";

import { useUser } from "@/context/UserContext";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserSwitcher() {
  const { users, activeUser, setActiveUserId } = useUser();

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Active user
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initials(activeUser.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {activeUser.name}
            </p>
            <p className="truncate text-xs text-slate-600">{activeUser.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Switch user
        </p>
        {users.map((user) => {
          const isActive = user.id === activeUser.id;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => setActiveUserId(user.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p
                  className={`truncate text-xs ${
                    isActive ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {user.email}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
