/// <reference types="vite/client" />
import type { ComponentType } from 'react';

export interface PrototypeRoute {
  slug: string;
  Component: ComponentType;
}

function buildRoutes(
  modules: Record<string, { default: ComponentType }>,
  pattern: RegExp,
): PrototypeRoute[] {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const match = path.match(pattern);
      if (!match) return null;
      return { slug: match[1]!, Component: mod.default };
    })
    .filter((r): r is PrototypeRoute => r !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const webModules = import.meta.glob<{ default: ComponentType }>('/prototypes/*/index.tsx', {
  eager: true,
});

const iosModules = import.meta.glob<{ default: ComponentType }>('/ios/prototypes/*/index.tsx', {
  eager: true,
});

export const prototypeRoutes = buildRoutes(webModules, /\/prototypes\/([^/]+)\/index\.tsx$/);
export const iosPrototypeRoutes = buildRoutes(iosModules, /\/ios\/prototypes\/([^/]+)\/index\.tsx$/);
