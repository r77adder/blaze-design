/// <reference types="vite/client" />
import type { ComponentType } from 'react';

const modules = import.meta.glob<{ default: ComponentType }>('/prototypes/*/index.tsx', {
  eager: true,
});

export interface PrototypeRoute {
  slug: string;
  Component: ComponentType;
}

export const prototypeRoutes: PrototypeRoute[] = Object.entries(modules)
  .map(([path, mod]) => {
    const match = path.match(/\/prototypes\/([^/]+)\/index\.tsx$/);
    if (!match) return null;
    return { slug: match[1]!, Component: mod.default };
  })
  .filter((r): r is PrototypeRoute => r !== null)
  .sort((a, b) => a.slug.localeCompare(b.slug));
