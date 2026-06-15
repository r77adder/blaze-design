/**
 * Self-contained hash router for the Blaze idea.
 *
 * nextco's outer router matches `/blaze` exactly and won't pass through
 * sub-paths, so internal navigation rides on the URL hash. This gives each
 * screen a distinct, shareable URL without touching eng-protected infra:
 *
 *   #/                       → AM account directory (the landing)
 *   #/<accountId>/am         → AM workspace (onboarding + tools)
 *   #/<accountId>/am/<sec>   → a section within the AM workspace
 *   #/<accountId>/client     → client portal
 *
 * Mirrors the product's intended real URLs: blaze.ai/dfy/<workspace>/am|client.
 */

import { useSyncExternalStore, useCallback } from 'react';

export type Side = 'am' | 'client';

export type Route =
  | { name: 'directory' }
  | { name: 'create' }
  | { name: 'workspace'; accountId: string; side: Side; section: string };

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function getHash(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^\//, '').split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'directory' };
  if (parts[0] === 'new') return { name: 'create' };
  const [accountId, side, ...rest] = parts;
  const resolvedSide: Side = side === 'client' ? 'client' : 'am';
  return {
    name: 'workspace',
    accountId,
    side: resolvedSide,
    section: rest.join('/') || 'overview',
  };
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash, () => '/');
  return parseRoute(hash);
}

export function useNavigate() {
  return useCallback((to: string) => {
    const target = to.startsWith('#') ? to : `#${to.startsWith('/') ? '' : '/'}${to}`;
    if (window.location.hash === target) return;
    window.location.hash = target;
    document.querySelector('[data-blaze-scroll]')?.scrollTo({ top: 0 });
  }, []);
}

export function hrefFor(route: Route): string {
  if (route.name === 'directory') return '#/';
  if (route.name === 'create') return '#/new';
  const { accountId, side, section } = route;
  const tail = section && section !== 'overview' ? `/${section}` : '';
  return `#/${accountId}/${side}${tail}`;
}

/** The display URL shown in the topbar - the product's intended real path. */
export function displayPath(route: Route): string {
  if (route.name === 'directory') return 'blaze.ai/dfy';
  if (route.name === 'create') return 'blaze.ai/dfy/new';
  const tail = route.section && route.section !== 'overview' ? `/${route.section}` : '';
  return `blaze.ai/dfy/${route.accountId}/${route.side}${tail}`;
}

export function Link({
  to,
  className,
  children,
  ...rest
}: { to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const navigate = useNavigate();
  return (
    <a
      href={to.startsWith('#') ? to : `#${to}`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        navigate(to);
        rest.onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
