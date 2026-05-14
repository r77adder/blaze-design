/// <reference types="vite/client" />
import type { ComponentType } from 'react';
import { PROTOTYPE_META } from 'virtual:prototype-meta';

const modules = import.meta.glob<{ default: ComponentType }>('/prototypes/*/index.tsx', {
  eager: true,
});

const iosModules = import.meta.glob<{ default: ComponentType }>('/ios/prototypes/*/index.tsx', {
  eager: true,
});

/** Static thumbnail images committed to the repo (one per prototype, by the
 *  `generate-thumbnails` workflow on every push to main). When absent, the
 *  card falls back to a live iframe preview. */
const thumbnailUrls = import.meta.glob<string>(
  '/prototypes/*/thumbnail.png',
  { eager: true, query: '?url', import: 'default' },
);

export interface PrototypeRoute {
  slug: string;
  Component: ComponentType;
  /** ISO timestamp of the most recent git commit touching this prototype
   *  (or filesystem mtime fallback when not in a git checkout). */
  lastModified: string | null;
  /** Display title from meta.json, falls back to title-cased slug. */
  title: string | null;
  /** One-sentence description from meta.json. */
  description: string | null;
  /** Resolved URL of the static thumbnail PNG, or null when none exists. */
  thumbnailUrl: string | null;
}

export const prototypeRoutes: PrototypeRoute[] = Object.entries(modules)
  .map(([path, mod]) => {
    const match = path.match(/\/prototypes\/([^/]+)\/index\.tsx$/);
    if (!match) return null;
    const slug = match[1]!;
    const meta = PROTOTYPE_META[slug];
    return {
      slug,
      Component: mod.default,
      lastModified: meta?.lastModified ?? null,
      title: meta?.title ?? null,
      description: meta?.description ?? null,
      thumbnailUrl: thumbnailUrls[`/prototypes/${slug}/thumbnail.png`] ?? null,
    };
  })
  .filter((r): r is PrototypeRoute => r !== null)
  .sort((a, b) => {
    // Most recently updated first; fall back to alphabetical when missing.
    const am = a.lastModified ?? '';
    const bm = b.lastModified ?? '';
    if (am && bm) return bm.localeCompare(am);
    return a.slug.localeCompare(b.slug);
  });

export const iosPrototypeRoutes: PrototypeRoute[] = Object.entries(iosModules)
  .map(([path, mod]) => {
    const match = path.match(/\/ios\/prototypes\/([^/]+)\/index\.tsx$/);
    if (!match) return null;
    const slug = match[1]!;
    return {
      slug,
      Component: mod.default,
      lastModified: null,
      title: null,
      description: null,
      thumbnailUrl: null,
    };
  })
  .filter((r): r is PrototypeRoute => r !== null)
  .sort((a, b) => a.slug.localeCompare(b.slug));
