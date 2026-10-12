import { API_BASE_URL } from './api';

export type UserRole = 'SUPER_ADMIN' | 'MAIN_BLOCK_ADMIN' | 'MECH_BLOCK_ADMIN' | 'MBA_BLOCK_ADMIN' | 'CANTEEN_ADMIN';

export interface AuthAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  assignedBlockIds: string[];
  permissions: string[];
  status: 'ACTIVE' | 'DISABLED';
}

export interface AuthSession {
  account: AuthAccount;
  token: string;
  expiresAt: string;
}

const STORAGE_KEY = 'ecopulse.auth.session';

export function getStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.token || !parsed.account || Date.parse(parsed.expiresAt) <= Date.now()) {
      clearStoredSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function storeSession(session: AuthSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Login failed with HTTP ${res.status}`);
  }

  const session: AuthSession = {
    account: data.account,
    token: data.token,
    expiresAt: data.expiresAt,
  };
  storeSession(session);
  return session;
}

export async function restoreSession(session: AuthSession): Promise<AuthSession> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    clearStoredSession();
    throw new Error(data?.error || 'Session expired.');
  }

  const restored = { ...session, account: data.account };
  storeSession(restored);
  return restored;
}

export async function logout(session: AuthSession | null): Promise<void> {
  if (session?.token) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.token}` },
    }).catch(() => undefined);
  }
  clearStoredSession();
}

export function createAuthorizedFetch(session: AuthSession | null, onUnauthorized: () => void) {
  return async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }
    const response = await fetch(input, { ...init, headers });
    if (response.status === 401) {
      onUnauthorized();
    }
    return response;
  };
}

export function can(account: AuthAccount | null, permission: string): boolean {
  return Boolean(account?.permissions.includes(permission));
}

