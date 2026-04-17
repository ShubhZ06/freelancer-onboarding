"use client";

import { useSyncExternalStore } from "react";
import { SESSION_USER_EVENT, type AuthUser } from "@/lib/auth-session";

const SESSION_USER_KEY = "fos:session-user";

let cachedRaw: string | null | undefined;
let cachedUser: AuthUser | null = null;

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === "fos:session-user") {
      onStoreChange();
    }
  };

  window.addEventListener(SESSION_USER_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(SESSION_USER_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function getClientSnapshot(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_USER_KEY);
  if (raw === cachedRaw) {
    return cachedUser;
  }

  cachedRaw = raw;
  if (!raw) {
    cachedUser = null;
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(raw) as AuthUser;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

function getServerSnapshot(): AuthUser | null {
  return null;
}

export function useSessionUser(): AuthUser | null {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
