export type AuthUser = {
  name: string;
  email: string;
};

type StoredUser = AuthUser & {
  password: string;
};

const USERS_KEY = "fos:users";
const SESSION_USER_KEY = "fos:session-user";
const SESSION_COOKIE = "fos_session";
export const SESSION_USER_EVENT = "fos:session-user-change";

function canUseStorage() {
  return typeof window !== "undefined";
}

function readUsers(): StoredUser[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSessionCookie(user: AuthUser) {
  if (!canUseStorage()) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(user.email)}; path=/; expires=${expires.toUTCString()}; samesite=lax`;
  window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(SESSION_USER_EVENT));
}

export function readSessionUser(): AuthUser | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getRegisteredUser(email: string) {
  return readUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function registerUser(user: AuthUser, password: string) {
  const users = readUsers();
  const existing = users.find((item) => item.email.toLowerCase() === user.email.toLowerCase());

  if (existing) {
    return { success: false as const, message: "An account with that email already exists." };
  }

  users.push({ ...user, password });
  saveUsers(users);
  setSessionCookie(user);

  return { success: true as const };
}

export function signInUser(email: string, password: string) {
  const user = getRegisteredUser(email);

  if (!user || user.password !== password) {
    return { success: false as const, message: "Invalid email or password." };
  }

  setSessionCookie(user);
  return { success: true as const, user };
}

export function signOutUser() {
  if (!canUseStorage()) return;

  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  window.localStorage.removeItem(SESSION_USER_KEY);
  window.dispatchEvent(new Event(SESSION_USER_EVENT));
}
