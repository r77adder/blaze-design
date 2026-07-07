import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const MODULE_ID = 'virtual:prototype-meta';
const RESOLVED_ID = '\0' + MODULE_ID;

interface PrototypeMeta {
  lastModified: string;
  /** Display title from meta.json. Falls back to a title-cased slug in the UI
   *  when missing. */
  title?: string;
  /** One-sentence description from meta.json. */
  description?: string;
  /** When true, the gallery groups this prototype into an "Archived" section. */
  archived?: boolean;
}

function readMetaJson(dir: string): { title?: string; description?: string; archived?: boolean } {
  const metaPath = path.join(dir, 'meta.json');
  if (!fs.existsSync(metaPath)) return {};
  try {
    const raw = fs.readFileSync(metaPath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      description:
        typeof parsed.description === 'string' ? parsed.description : undefined,
      archived: typeof parsed.archived === 'boolean' ? parsed.archived : undefined,
    };
  } catch {
    return {};
  }
}

function lastGitCommitISO(dir: string, cwd: string): string | null {
  try {
    const rel = path.relative(cwd, dir);
    const out = execSync(`git log -1 --format=%cI -- ${JSON.stringify(rel)}`, {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function maxMtimeISO(dir: string): string {
  let max = 0;
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else {
        const m = fs.statSync(p).mtimeMs;
        if (m > max) max = m;
      }
    }
  };
  walk(dir);
  return new Date(max || Date.now()).toISOString();
}

export function prototypeMetaPlugin(): Plugin {
  // The dev server can run with process.cwd() ≠ the served project (e.g. a git
  // worktree served via the repo-root's vite binary). Scan Vite's resolved
  // root so worktree prototypes and their meta.json are picked up, not the
  // launching directory's.
  let projectRoot = process.cwd();
  return {
    name: 'prototype-meta',
    configResolved(config) {
      projectRoot = config.root;
    },
    resolveId(id) {
      if (id === MODULE_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id !== RESOLVED_ID) return;
      const meta: Record<string, PrototypeMeta> = {};
      // Scan both the web (prototypes/) and iOS (ios/prototypes/) galleries.
      for (const dirRoot of [path.resolve(projectRoot, 'prototypes'), path.resolve(projectRoot, 'ios/prototypes')]) {
        if (!fs.existsSync(dirRoot)) continue;
        const slugs = fs
          .readdirSync(dirRoot, { withFileTypes: true })
          .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
          .map((e) => e.name);
        for (const slug of slugs) {
          const dir = path.join(dirRoot, slug);
          const lastModified =
            lastGitCommitISO(dir, projectRoot) ?? maxMtimeISO(dir);
          const { title, description, archived } = readMetaJson(dir);
          meta[slug] = { lastModified, title, description, archived };
        }
      }
      return `export const PROTOTYPE_META = ${JSON.stringify(meta, null, 2)};`;
    },
  };
}
