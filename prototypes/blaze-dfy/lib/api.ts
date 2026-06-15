/**
 * The backend seam.
 *
 * v0 ships no backend. Reads go through `apiFetch` (mock mode returns from an
 * in-session store seeded by fixtures; live mode hits VITE_API_BASE_URL).
 * Writes (createAccount) mutate the in-session store so a freshly created
 * workspace is immediately navigable - state resets on reload, which is fine
 * for a prototype. Components only ever call the typed functions here.
 */

import { accounts as seed } from './fixtures/accounts';
import type { Account, AccountManager, PhaseId, PhaseProgress, BrandColor, BrandFont } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

/** Mutable in-session store. Seeded once from fixtures. */
let store: Account[] = [...seed];

export class ApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, mock: () => T): Promise<T> {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 180));
    return mock();
  }
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new ApiError(res.status);
  return (await res.json()) as T;
}

export function getAccounts(): Promise<Account[]> {
  return apiFetch('/accounts', () => store);
}

export function getAccount(id: string): Promise<Account | undefined> {
  return apiFetch(`/accounts/${id}`, () => store.find((a) => a.id === id));
}

/** Persist brand-kit edits to the in-session store so they carry through
 *  from Registration → Strategy → Brand Kit. */
export function updateAccountBrand(id: string, brand: Partial<Account['brand']>): void {
  store = store.map((a) => (a.id === id ? { ...a, brand: { ...a.brand, ...brand } } : a));
}

export const ACCOUNT_MANAGERS: AccountManager[] = [
  { name: 'Dana Whitfield', initials: 'DW' },
  { name: 'Marcus Lee', initials: 'ML' },
  { name: 'Priya Shah', initials: 'PS' },
];

export const ACCENT_SWATCHES = ['#664eff', '#0E9AA7', '#C8553D', '#2EB872', '#E8568A', '#1F3A5F'];

export interface NewWorkspaceInput {
  name: string;
  website: string;
  poc: { name: string; email: string; phone: string; role?: string };
  am: AccountManager;
  accent: string;
  industry?: string;
  location?: string;
  /** Brand kit captured during the new-workspace brand scan. */
  colors?: BrandColor[];
  fonts?: BrandFont[];
}

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'workspace';
  let id = base;
  let n = 2;
  while (store.some((a) => a.id === id)) id = `${base}-${n++}`;
  return id;
}

function freshPhases(): PhaseProgress[] {
  const names: Record<PhaseId, string> = { 1: 'Registration', 2: 'Strategy', 3: 'Creative Review' };
  return ([1, 2, 3] as PhaseId[]).map((id) => ({ id, name: names[id], status: id === 1 ? 'in_progress' : 'not_started' }));
}

/** Create a workspace for a newly-paying customer and return it. */
export function createAccount(input: NewWorkspaceInput): Promise<Account> {
  const domain = input.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const account: Account = {
    id: slugify(input.name),
    name: input.name.trim(),
    industry: input.industry?.trim() || 'Local services',
    location: input.location?.trim() || '',
    website: domain,
    domain,
    accent: input.accent,
    poc: input.poc,
    am: input.am,
    status: 'onboarding',
    invitedDaysAgo: 0,
    invitedDate: new Date().toISOString().slice(0, 10),
    phase: 1,
    stepLabel: 'Registration, Client details',
    progressPct: 2,
    aiNextStep: `Kick off Phase 1 - confirm details and scan ${domain || 'the website'} for brand assets.`,
    phases: freshPhases(),
    brand: { website: domain, logos: [], fonts: input.fonts ?? [], colors: input.colors ?? [], docs: [
      { id: 'guidelines', label: 'Brand guidelines', kind: 'Brand guidelines', status: 'empty' },
      { id: 'tone', label: 'Tone of voice', kind: 'Tone of voice', status: 'empty' },
      { id: 'avoid', label: 'Words / phrases to avoid', kind: 'Words to avoid', status: 'empty' },
      { id: 'photos', label: 'Photos', kind: 'Photos', status: 'empty' },
      { id: 'audiences', label: 'Target audiences', kind: 'Target audiences', status: 'empty' },
    ] },
  };
  store = [account, ...store];
  return Promise.resolve(account);
}

export type { Account } from './types';
