export interface RouteEntry {
  hash: string;
  tab: string;
  sub: string | null;
  pageKey: string;
}

export interface NavigationState {
  current: RouteEntry;
  history: RouteEntry[];
}

export type NavigationAction =
  | { type: 'NAVIGATE'; rawHash: string; replace?: boolean }
  | { type: 'GO_BACK'; fallbackHash?: string }
  | { type: 'RESET'; rawHash?: string };

const ROUTE_ALIASES: Record<string, [string, string | null]> = {
  home: ['twin', null],
  findings: ['research', 'findings'],
  me: ['you', null],
  ask: ['you', 'checkin'],
  health: ['you', 'health'],
};

const ROOT_TABS = new Set([
  'twin',
  'research',
  'panel',
  'results',
  'clinical',
  'you',
  'welcome',
]);

export const TAB_LABELS: Record<string, string> = {
  twin: 'Twin',
  you: 'You',
  research: 'Research',
  results: 'Results',
  panel: 'Panel',
  clinical: 'Clinical',
  welcome: 'Welcome',
};

const MAX_HISTORY_ENTRIES = 50;

/**
 * Computes the logical screen identity (`pageKey`) for a `{ tab, sub }` pair so
 * switching in-page tabs/segments or 3D organ highlights updates `current` in place
 * without pushing duplicate entries onto the React back-history stack.
 */
function computePageKey(tab: string, sub: string | null): string {
  if (!sub) return tab;

  // Twin organ focus (`#/twin/o:kidneys`) stays on the main Twin canvas screen
  if (tab === 'twin' && sub.startsWith('o:')) {
    return 'twin';
  }

  // Clinical & Results sub-routes are segmented tabs inside the same page
  if (tab === 'clinical' || tab === 'results') {
    return tab;
  }

  // Research section tabs (`findings`, `dossier`, `sources`, `genes`) share the Research hub,
  // while a specific finding detail (`f:...`) can step back to Research
  if (tab === 'research' && !sub.startsWith('f:')) {
    return 'research';
  }

  // Group sub-tabs of a subpage (e.g. `checkin:today` and `checkin:ask` -> `you/checkin`)
  const baseSub = sub.split(':')[0];
  return `${tab}/${baseSub}`;
}

/**
 * Normalizes any portal hash (e.g. "#/me/feed", "#/ask/ask", "#/you/checkin:ask", "#/twin/stats")
 * into its canonical RouteEntry `{ hash, tab, sub, pageKey }`.
 */
export function parsePortalHash(rawHash: string): RouteEntry {
  const cleaned = (rawHash || '').replace(/^#\/?/, '').trim();
  if (!cleaned) {
    return { hash: '#/twin', tab: 'twin', sub: null, pageKey: 'twin' };
  }

  const [first, ...rest] = cleaned.split('/');
  const joinedRest = rest.join('/') || null;

  let tab = first;
  let sub: string | null = joinedRest;

  if (ROUTE_ALIASES[first]) {
    tab = ROUTE_ALIASES[first][0];
    if (first === 'ask') {
      if (!joinedRest) {
        sub = 'checkin';
      } else if (joinedRest === 'checkin' || joinedRest.startsWith('checkin:')) {
        sub = joinedRest;
      } else {
        sub = `checkin:${joinedRest}`;
      }
    } else {
      sub = joinedRest || ROUTE_ALIASES[first][1];
    }
  } else if (!ROOT_TABS.has(first)) {
    tab = 'twin';
    sub = joinedRest;
  }

  const pageKey = computePageKey(tab, sub);
  const canonicalHash = `#/${tab}${sub ? `/${sub}` : ''}`;

  return { hash: canonicalHash, tab, sub, pageKey };
}

/**
 * Computes the deterministic logical parent hash for any portal route when
 * no prior in-app React history entry exists (e.g., deep link or refresh).
 */
export function getLogicalParentHash(rawHash: string): {
  targetHash: string;
  parentLabel: string;
} {
  const { tab, sub } = parsePortalHash(rawHash);

  if (tab === 'you') {
    if (sub && /^journey-[123]$/.test(sub)) {
      return { targetHash: '#/you/journey', parentLabel: 'Your journey' };
    }
    return sub
      ? { targetHash: '#/you', parentLabel: 'You' }
      : { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  if (tab === 'twin') {
    return { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  if (tab === 'research') {
    return sub
      ? { targetHash: '#/research', parentLabel: 'Research' }
      : { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  if (tab === 'results') {
    return sub
      ? { targetHash: '#/results', parentLabel: 'Results' }
      : { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  if (tab === 'panel') {
    return sub
      ? { targetHash: '#/panel', parentLabel: 'Panel' }
      : { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  if (tab === 'clinical') {
    return sub
      ? { targetHash: '#/clinical', parentLabel: 'Clinical' }
      : { targetHash: '#/twin', parentLabel: 'Twin' };
  }
  return { targetHash: '#/twin', parentLabel: 'Twin' };
}

function toRouteEntry(item: string | RouteEntry): RouteEntry {
  return typeof item === 'string' ? parsePortalHash(item) : item;
}

/**
 * Pure back-stack resolver: given a history stack (strings or RouteEntries) and
 * the current route, pops back to the nearest distinct screen while skipping
 * `#/welcome` from authenticated views, or falls back to `getLogicalParentHash`.
 */
export function resolveBackTarget(
  historyStack: Array<string | RouteEntry>,
  currentHash: string,
  fallbackOverride?: string
): { targetHash: string; backLabel: string; nextStack: RouteEntry[] } {
  const current = parsePortalHash(currentHash);
  const stackCopy = historyStack.map(toRouteEntry);

  while (stackCopy.length > 0) {
    const candidate = stackCopy.pop()!;
    if (candidate.pageKey === current.pageKey) {
      continue;
    }
    if (candidate.tab === 'welcome' && current.tab !== 'welcome') {
      continue;
    }
    const label = candidate.sub
      ? TAB_LABELS[candidate.tab] || 'Back'
      : TAB_LABELS[candidate.tab] || 'Back';
    return {
      targetHash: candidate.hash,
      backLabel: label,
      nextStack: stackCopy,
    };
  }

  if (fallbackOverride) {
    const parsedOverride = parsePortalHash(fallbackOverride);
    return {
      targetHash: parsedOverride.hash,
      backLabel: TAB_LABELS[parsedOverride.tab] || 'Back',
      nextStack: [],
    };
  }

  const fallback = getLogicalParentHash(currentHash);
  return {
    targetHash: fallback.targetHash,
    backLabel: fallback.parentLabel,
    nextStack: [],
  };
}

export function createInitialNavigationState(initialHash?: string): NavigationState {
  return {
    current: parsePortalHash(initialHash || '#/twin'),
    history: [],
  };
}

/**
 * Pure reducer driving React-state navigation history across the entire portal.
 */
export function navigationReducer(
  state: NavigationState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case 'NAVIGATE': {
      const next = parsePortalHash(action.rawHash);
      if (next.hash === state.current.hash) {
        return state;
      }

      // Same logical screen (e.g. switching segmented sub-tabs) or explicit replace:
      // update current route in place without growing the back stack.
      if (action.replace || next.pageKey === state.current.pageKey) {
        return {
          current: next,
          history: state.history,
        };
      }

      // Do not push pre-auth `#/welcome` onto the authenticated back stack
      const shouldRecordCurrent = state.current.tab !== 'welcome';
      const appended = shouldRecordCurrent
        ? [...state.history, state.current]
        : state.history;
      const trimmed =
        appended.length > MAX_HISTORY_ENTRIES
          ? appended.slice(appended.length - MAX_HISTORY_ENTRIES)
          : appended;

      return {
        current: next,
        history: trimmed,
      };
    }

    case 'GO_BACK': {
      const resolved = resolveBackTarget(
        state.history,
        state.current.hash,
        action.fallbackHash
      );
      return {
        current: parsePortalHash(resolved.targetHash),
        history: resolved.nextStack,
      };
    }

    case 'RESET': {
      return {
        current: parsePortalHash(action.rawHash || state.current.hash),
        history: [],
      };
    }

    default:
      return state;
  }
}

export function getNavigationBackTarget(state: NavigationState): {
  targetHash: string;
  backLabel: string;
  canGoBack: boolean;
} {
  const resolved = resolveBackTarget(state.history, state.current.hash);
  return {
    targetHash: resolved.targetHash,
    backLabel: resolved.backLabel,
    canGoBack: state.history.length > 0 || resolved.targetHash !== state.current.hash,
  };
}
