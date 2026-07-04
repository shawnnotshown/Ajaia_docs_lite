"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ensureDemoUsersSeeded } from "@/lib/seed";
import { DEMO_USERS, DEFAULT_USER_ID, type User } from "@/types";

const STORAGE_KEY = "ajaia-active-user-id";

interface UserContextValue {
  users: User[];
  activeUser: User;
  setActiveUserId: (userId: string) => void;
  ready: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [activeUserId, setActiveUserIdState] = useState(DEFAULT_USER_ID);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && DEMO_USERS.some((user) => user.id === stored)) {
      setActiveUserIdState(stored);
    }

    ensureDemoUsersSeeded().finally(() => setReady(true));
  }, []);

  const setActiveUserId = useCallback((userId: string) => {
    if (!DEMO_USERS.some((user) => user.id === userId)) {
      return;
    }

    setActiveUserIdState(userId);
    window.localStorage.setItem(STORAGE_KEY, userId);
  }, []);

  const activeUser =
    DEMO_USERS.find((user) => user.id === activeUserId) ?? DEMO_USERS[0];

  const value = useMemo(
    () => ({
      users: DEMO_USERS,
      activeUser,
      setActiveUserId,
      ready,
    }),
    [activeUser, setActiveUserId, ready]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
