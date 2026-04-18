export type AuthUser = {
  name: string;
  email: string;
  location?: string;
  phoneNumber?: string;
  businessName?: string;
  businessLocation?: string;
  businessRegistrationNumber?: string;
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

export function updateUserProfile(nextUser: AuthUser) {
  const email = nextUser.email.trim();
  const name = nextUser.name.trim();

  if (!name || name.length < 2) {
    return { success: false as const, message: "Name must be at least 2 characters long." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false as const, message: "Enter a valid email address." };
  }

  const current = readSessionUser();
  if (!current) {
    return { success: false as const, message: "You must be signed in to update profile." };
  }

  const users = readUsers();
  const currentIndex = users.findIndex(
    (item) => item.email.toLowerCase() === current.email.toLowerCase()
  );

  if (currentIndex < 0) {
    return { success: false as const, message: "Could not find your account record." };
  }

  const duplicate = users.find(
    (item, index) => index !== currentIndex && item.email.toLowerCase() === email.toLowerCase()
  );

  if (duplicate) {
    return { success: false as const, message: "An account with that email already exists." };
  }

  const merged: StoredUser = {
    ...users[currentIndex],
    ...nextUser,
    name,
    email,
  };

  users[currentIndex] = merged;
  saveUsers(users);
  setSessionCookie({
    name: merged.name,
    email: merged.email,
    location: merged.location,
    phoneNumber: merged.phoneNumber,
    businessName: merged.businessName,
    businessLocation: merged.businessLocation,
    businessRegistrationNumber: merged.businessRegistrationNumber,
  });

  return { success: true as const, user: merged };
}

export function signOutUser() {
  if (!canUseStorage()) return;

  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
  window.localStorage.removeItem(SESSION_USER_KEY);
  window.dispatchEvent(new Event(SESSION_USER_EVENT));
}
