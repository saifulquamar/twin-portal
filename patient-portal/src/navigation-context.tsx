import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  createInitialNavigationState,
  getNavigationBackTarget,
  navigationReducer,
  parsePortalHash,
  type NavigationState,
  type RouteEntry,
} from './navigation';

export interface PortalNavigationContextValue {
  state: NavigationState;
  current: RouteEntry;
  history: RouteEntry[];
  canGoBack: boolean;
  backTarget: {
    targetHash: string;
    backLabel: string;
  };
  navigate: (rawHash: string, options?: { replace?: boolean; preserveScroll?: boolean }) => void;
  go: (tab: string, sub?: string | null) => void;
  goBack: (fallbackHash?: string) => void;
  resetHistory: (rawHash?: string) => void;
}

const PortalNavigationContext = createContext<PortalNavigationContextValue | null>(null);

function resolveInitialBrowserHash(): string {
  if (typeof window === 'undefined') return '#/twin';
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      window.localStorage.setItem('mx-onboarded', 'true');
      if (!window.location.hash || window.location.hash === '#/welcome') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/twin`);
        return '#/twin';
      }
    }
  } catch {
    // ignore storage access issues
  }
  return window.location.hash || '#/twin';
}

function resetPaneScroll() {
  if (typeof window === 'undefined') return;
  window.scrollTo(0, 0);
  document.querySelector('.pane')?.scrollTo(0, 0);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    navigationReducer,
    undefined,
    () => createInitialNavigationState(resolveInitialBrowserHash())
  );

  // Track programmatic hash updates so the `hashchange` listener does not double-dispatch
  const syncedHashRef = useRef<string>(state.current.hash);

  const applyBrowserHash = useCallback(
    (canonicalHash: string, replace = false, preserveScroll = false) => {
      if (typeof window === 'undefined') return;
      syncedHashRef.current = canonicalHash;
      const hashPath = canonicalHash.startsWith('#') ? canonicalHash : `#${canonicalHash}`;
      if (window.location.hash !== hashPath) {
        if (replace) {
          window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${window.location.search}${hashPath}`
          );
        } else {
          window.location.hash = hashPath.slice(1);
        }
      }
      if (!preserveScroll) {
        resetPaneScroll();
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const incoming = parsePortalHash(window.location.hash || '#/twin');
      if (incoming.hash === syncedHashRef.current) {
        return;
      }
      syncedHashRef.current = incoming.hash;
      dispatch({ type: 'NAVIGATE', rawHash: window.location.hash || '#/twin' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback(
    (rawHash: string, options?: { replace?: boolean; preserveScroll?: boolean }) => {
      const parsed = parsePortalHash(rawHash);
      dispatch({ type: 'NAVIGATE', rawHash: parsed.hash, replace: options?.replace });
      applyBrowserHash(parsed.hash, Boolean(options?.replace), Boolean(options?.preserveScroll));
    },
    [applyBrowserHash]
  );

  const go = useCallback(
    (tab: string, sub?: string | null) => {
      const preserveScroll =
        (tab === 'panel' && (sub === 'book' || Boolean(sub?.startsWith('t:')))) ||
        (tab === 'twin' && Boolean(sub?.startsWith('o:')));
      const rawHash = `#/${tab}${sub ? `/${sub}` : ''}`;
      navigate(rawHash, { preserveScroll });
    },
    [navigate]
  );

  const goBack = useCallback(
    (fallbackHash?: string) => {
      const target = getNavigationBackTarget(state);
      const nextHash =
        state.history.length === 0 && fallbackHash
          ? parsePortalHash(fallbackHash).hash
          : target.targetHash;
      dispatch({ type: 'GO_BACK', fallbackHash });
      applyBrowserHash(nextHash, true, false);
    },
    [applyBrowserHash, state]
  );

  const resetHistory = useCallback(
    (rawHash?: string) => {
      const nextHash = parsePortalHash(rawHash || state.current.hash).hash;
      dispatch({ type: 'RESET', rawHash: nextHash });
      applyBrowserHash(nextHash, true, false);
    },
    [applyBrowserHash, state.current.hash]
  );

  const computedBack = useMemo(() => getNavigationBackTarget(state), [state]);

  const value = useMemo<PortalNavigationContextValue>(
    () => ({
      state,
      current: state.current,
      history: state.history,
      canGoBack: computedBack.canGoBack,
      backTarget: {
        targetHash: computedBack.targetHash,
        backLabel: computedBack.backLabel,
      },
      navigate,
      go,
      goBack,
      resetHistory,
    }),
    [computedBack, go, goBack, navigate, resetHistory, state]
  );

  return (
    <PortalNavigationContext.Provider value={value}>
      {children}
    </PortalNavigationContext.Provider>
  );
}

export function usePortalNavigation(): PortalNavigationContextValue {
  const ctx = useContext(PortalNavigationContext);
  if (!ctx) {
    // Fallback safety if ever rendered outside provider during isolated tests
    const fallbackState = createInitialNavigationState(
      typeof window !== 'undefined' ? window.location.hash || '#/twin' : '#/twin'
    );
    const back = getNavigationBackTarget(fallbackState);
    return {
      state: fallbackState,
      current: fallbackState.current,
      history: fallbackState.history,
      canGoBack: back.canGoBack,
      backTarget: { targetHash: back.targetHash, backLabel: back.backLabel },
      navigate: (rawHash: string) => {
        if (typeof window !== 'undefined') {
          window.location.hash = rawHash.replace(/^#/, '');
        }
      },
      go: (tab: string, sub?: string | null) => {
        if (typeof window !== 'undefined') {
          window.location.hash = `/${tab}${sub ? `/${sub}` : ''}`;
        }
      },
      goBack: () => {
        if (typeof window !== 'undefined') {
          window.location.hash = back.targetHash.replace(/^#/, '');
        }
      },
      resetHistory: () => {},
    };
  }
  return ctx;
}
