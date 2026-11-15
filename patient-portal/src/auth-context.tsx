import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from './types';
import { resolvePortalApiUrl } from './voice-engine';

const AUTH_TOKEN_STORAGE_KEY = 'mx-auth-token-v1';
const AUTH_USER_STORAGE_KEY = 'mx-auth-user-v1';

interface AuthModalState {
  open: boolean;
  defaultTab: 'signin' | 'signup' | 'admin';
  reason?: string;
}

export interface PortalAuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  canSwitchPatients: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (params: {
    email: string;
    password: string;
    displayName: string;
    assignedPatientId?: string;
  }) => Promise<AuthUser>;
  enableAdminDemo: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
  openAuthModal: (tab?: 'signin' | 'signup' | 'admin', reason?: string) => void;
  closeAuthModal: () => void;
  authHeaders: () => Record<string, string>;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistSession(token: string | null, user: AuthUser | null) {
  try {
    if (token && user) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function getStoredAuthHeaders(): Record<string, string> {
  const tok = readStoredToken();
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

export async function fetchEncryptedVault(patientId: string, apiBase?: string): Promise<any | null> {
  try {
    const res = await fetch(
      resolvePortalApiUrl(`/v1/preserve/vault/${encodeURIComponent(patientId)}`, apiBase),
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...getStoredAuthHeaders(),
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.vault || null;
  } catch {
    return null;
  }
}

export async function saveEncryptedVault(
  patientId: string,
  patch: Record<string, unknown>,
  apiBase?: string
): Promise<any | null> {
  try {
    const res = await fetch(
      resolvePortalApiUrl(`/v1/preserve/vault/${encodeURIComponent(patientId)}`, apiBase),
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getStoredAuthHeaders(),
        },
        body: JSON.stringify(patch),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.vault || null;
  } catch {
    return null;
  }
}

export async function purgeEncryptedVault(
  patientId: string,
  scope: 'voice' | 'all',
  apiBase?: string
): Promise<boolean> {
  try {
    const res = await fetch(
      resolvePortalApiUrl(
        `/v1/preserve/vault/${encodeURIComponent(patientId)}?scope=${scope}`,
        apiBase
      ),
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...getStoredAuthHeaders(),
        },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState<boolean>(Boolean(readStoredToken()));
  const [modal, setModal] = useState<AuthModalState>({
    open: false,
    defaultTab: 'signin',
  });

  useEffect(() => {
    const currentTok = readStoredToken();
    if (!currentTok) {
      setLoading(false);
      return;
    }
    fetch(resolvePortalApiUrl('/v1/auth/me'), {
      credentials: 'include',
      headers: { Authorization: `Bearer ${currentTok}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.authenticated && data?.user) {
          setUser(data.user as AuthUser);
          persistSession(currentTok, data.user as AuthUser);
        } else {
          setToken(null);
          setUser(null);
          persistSession(null, null);
        }
      })
      .catch(() => {
        // Retain cached local user if offline
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await fetch(resolvePortalApiUrl('/v1/auth/signin'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.user) {
      throw new Error(data?.error || 'Invalid email or password.');
    }
    setToken(data.token || null);
    setUser(data.user);
    persistSession(data.token || null, data.user);
    setModal((prev) => ({ ...prev, open: false }));
    return data.user as AuthUser;
  }, []);

  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      displayName: string;
      assignedPatientId?: string;
    }): Promise<AuthUser> => {
      const res = await fetch(resolvePortalApiUrl('/v1/auth/signup'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          display_name: params.displayName,
          assigned_patient_id: params.assignedPatientId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.user) {
        throw new Error(data?.error || 'Could not create account.');
      }
      setToken(data.token || null);
      setUser(data.user);
      persistSession(data.token || null, data.user);
      setModal((prev) => ({ ...prev, open: false }));
      return data.user as AuthUser;
    },
    []
  );

  const enableAdminDemo = useCallback(async (): Promise<AuthUser> => {
    const res = await fetch(resolvePortalApiUrl('/v1/auth/admin-demo'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.user) {
      throw new Error(data?.error || 'Could not activate Admin mode.');
    }
    setToken(data.token || null);
    setUser(data.user);
    persistSession(data.token || null, data.user);
    setModal((prev) => ({ ...prev, open: false }));
    return data.user as AuthUser;
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const currentTok = token || readStoredToken();
    try {
      await fetch(resolvePortalApiUrl('/v1/auth/signout'), {
        method: 'POST',
        credentials: 'include',
        headers: currentTok ? { Authorization: `Bearer ${currentTok}` } : {},
      });
    } catch {
      // ignore network error on signout
    }
    setToken(null);
    setUser(null);
    persistSession(null, null);
  }, [token]);

  const openAuthModal = useCallback(
    (tab: 'signin' | 'signup' | 'admin' = 'signin', reason?: string) => {
      setModal({ open: true, defaultTab: tab, reason });
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }));
  }, []);

  const authHeaders = useCallback((): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : getStoredAuthHeaders();
  }, [token]);

  // Members signed in as a dedicated patient are isolated to their assigned Twin;
  // Admins (or unauthenticated clinical preview mode when unlocked) can switch across all 12 profiles.
  const isAdmin = user?.role === 'admin';
  const canSwitchPatients = isAdmin;

  const ctxValue = useMemo<PortalAuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin,
      canSwitchPatients,
      signIn,
      signUp,
      enableAdminDemo,
      signOut,
      openAuthModal,
      closeAuthModal,
      authHeaders,
    }),
    [
      user,
      token,
      loading,
      isAdmin,
      canSwitchPatients,
      signIn,
      signUp,
      enableAdminDemo,
      signOut,
      openAuthModal,
      closeAuthModal,
      authHeaders,
    ]
  );

  return (
    <PortalAuthContext.Provider value={ctxValue}>
      {children}
      {modal.open && (
        <AuthModal
          initialTab={modal.defaultTab}
          reason={modal.reason}
          onClose={closeAuthModal}
          onSignIn={signIn}
          onSignUp={signUp}
          onAdminDemo={enableAdminDemo}
        />
      )}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) {
    return {
      user: null,
      token: null,
      loading: false,
      isAdmin: false,
      canSwitchPatients: false,
      signIn: async () => {
        throw new Error('AuthProvider not mounted');
      },
      signUp: async () => {
        throw new Error('AuthProvider not mounted');
      },
      enableAdminDemo: async () => {
        throw new Error('AuthProvider not mounted');
      },
      signOut: async () => {},
      openAuthModal: () => {},
      closeAuthModal: () => {},
      authHeaders: () => ({}),
    };
  }
  return ctx;
}

function AuthModal({
  initialTab,
  reason,
  onClose,
  onSignIn,
  onSignUp,
  onAdminDemo,
}: {
  initialTab: 'signin' | 'signup' | 'admin';
  reason?: string;
  onClose: () => void;
  onSignIn: (email: string, password: string) => Promise<AuthUser>;
  onSignUp: (p: {
    email: string;
    password: string;
    displayName: string;
    assignedPatientId?: string;
  }) => Promise<AuthUser>;
  onAdminDemo: () => Promise<AuthUser>;
}) {
  const [tab, setTab] = useState<'signin' | 'signup' | 'admin'>(initialTab);
  const [email, setEmail] = useState(
    initialTab === 'admin' ? 'admin@mutanex.ai' : ''
  );
  const [password, setPassword] = useState(
    initialTab === 'admin' ? 'MutanexAdmin!2026' : ''
  );
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    if (tab === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (tab === 'signup' && !displayName.trim()) {
      setError('Please enter your preferred name.');
      return;
    }
    setBusy(true);
    try {
      if (tab === 'signup') {
        const currentPid = localStorage.getItem('mx-patient') || 'MX-SYN-T02';
        await onSignUp({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
          assignedPatientId: currentPid,
        });
      } else {
        await onSignIn(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mx-tour-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Mutanex Account & Clinical Admin Access"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-tour-modal mx-auth-modal">
        <div className="mx-tour-head">
          <div>
            <span className="mx-eyebrow">Encrypted Identity &amp; Twin Session</span>
            <h2>
              {tab === 'signup'
                ? 'Create your Mutanex account'
                : tab === 'admin'
                  ? 'Clinical Admin & Multi-Twin Mode'
                  : 'Sign in to your Twin'}
            </h2>
          </div>
          <button type="button" className="secondary sm" onClick={onClose}>
            Close
          </button>
        </div>

        {reason && <p className="note">{reason}</p>}

        <div className="mx-tour-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signin'}
            className={`mx-kg-chip${tab === 'signin' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'signup'}
            className={`mx-kg-chip${tab === 'signup' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
          >
            Create account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'admin'}
            className={`mx-kg-chip${tab === 'admin' ? ' is-active' : ''}`}
            onClick={() => {
              setTab('admin');
              setEmail('admin@mutanex.ai');
              setPassword('MutanexAdmin!2026');
              setError(null);
            }}
          >
            Admin Mode (12 Twins)
          </button>
        </div>

        {tab === 'admin' && (
          <div className="mx-admin-quick-banner">
            <p className="note">
              Admin Mode unlocks switching across all 10 synthetic Twins (<code>MX-SYN-T01..T10</code>) and 2 de-identified real patient Twins (<code>MX-DEID-A</code>, <code>MX-DEID-B</code>), plus onboarding new Twins.
            </p>
            <button
              type="button"
              className="primary sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                try {
                  await onAdminDemo();
                } catch (err: any) {
                  setError(err?.message || 'Could not enable Admin Mode.');
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Activating…' : 'Enable Admin Mode Now'}
            </button>
          </div>
        )}

        <form className="feed-form" onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <label className="feed-f">
              <span>Preferred name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Anika Rao"
                autoComplete="name"
              />
            </label>
          )}

          <label className="feed-f">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="feed-f">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>

          {tab === 'signin' && (
            <div className="mx-auth-presets">
              <span className="note">Quick demo accounts:</span>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setEmail('anika@mutanex.ai');
                  setPassword('AnikaTwin!2026');
                }}
              >
                Member (Anika)
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setEmail('admin@mutanex.ai');
                  setPassword('MutanexAdmin!2026');
                }}
              >
                Clinical Admin
              </button>
            </div>
          )}

          {error && (
            <p className="note mx-err-note" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="primary" disabled={busy}>
            {busy
              ? 'Signing in…'
              : tab === 'signup'
                ? 'Create encrypted account'
                : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
