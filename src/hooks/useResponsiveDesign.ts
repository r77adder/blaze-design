import { useEffect, useState } from 'react';

/**
 * Mobile-vs-desktop detection via `matchMedia`.
 *
 * Slimmed down from prod's `apps/blaze/src/hooks/useResponsiveDesign.ts`,
 * which returns ~10 boolean flags + viewport width. Modal sub-components
 * only consume `isMobile`, so the rest are skipped — extend this hook (and
 * the breakpoint variables in `src/tokens/breakpoints.scss`) as new lib
 * components demand more granular flags.
 *
 * Threshold mirrors the prod `$phoneMaxWidth = 720px` token.
 */

const PHONE_MAX_WIDTH_PX = 720;
const QUERY = `(max-width: ${PHONE_MAX_WIDTH_PX}px)`;

export interface ResponsiveDesignFlags {
  isMobile: boolean;
}

const initialFlags = (): ResponsiveDesignFlags => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return { isMobile: false };
  }
  return { isMobile: window.matchMedia(QUERY).matches };
};

export function useResponsiveDesign(): ResponsiveDesignFlags {
  const [flags, setFlags] = useState<ResponsiveDesignFlags>(initialFlags);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setFlags({ isMobile: e.matches });
    setFlags({ isMobile: mq.matches });
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return flags;
}

export default useResponsiveDesign;
