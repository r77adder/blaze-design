import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Shared "saved cards" set. Wraps the whole prototype so the bookmark icon
 * on a feed card on /competitor-tracking persists to the /meta-ads and
 * /google-ads pages too (and to the "Saved" filter chip).
 *
 * Used by the source HTML's toggleSaveCard() + saved-chip-count behavior.
 */
interface SavedCardsContextValue {
  saved: ReadonlySet<string>;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
}

const Ctx = createContext<SavedCardsContextValue | null>(null);

export function SavedCardsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  const value = useMemo(() => ({ saved, isSaved, toggleSaved }), [saved, isSaved, toggleSaved]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSavedCards(): SavedCardsContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSavedCards must be used inside <SavedCardsProvider>');
  return ctx;
}
