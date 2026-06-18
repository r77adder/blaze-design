/**
 * Billing catalog + helpers — shared by the New Workspace billing step and the
 * Billing settings tab so both speak the same package model.
 *
 * Packages, durations and prices are normally pulled from the signed contract
 * in Dropbox Sign; the prototype lets the AM import them or edit by hand.
 */

export type Duration = 'monthly' | 'one-off';
export type ContractTerm = 3 | 6 | 12;

export interface PackageDef {
  key: string;
  label: string;
  /** Default monthly (or one-off) price in USD. */
  price: number;
  /** Catalog price label shown in the dropdown. */
  priceLabel: string;
  /** Durations the package can be sold on. */
  durations: Duration[];
}

export const PACKAGES: PackageDef[] = [
  { key: 'organic',    label: 'Organic Growth',          price: 899, priceLabel: '$899/mo',         durations: ['monthly'] },
  { key: 'paid-ads',   label: 'Paid Ads',                price: 899, priceLabel: '$899/mo',         durations: ['monthly'] },
  { key: 'web',        label: 'Website & Landing Pages', price: 899, priceLabel: '$899/mo',         durations: ['monthly'] },
  { key: 'ai-sdr',     label: 'AI SDR',                  price: 899, priceLabel: '$899/mo',         durations: ['monthly'] },
  { key: 'reputation', label: 'Reputation Management',   price: 899, priceLabel: '$899/mo',         durations: ['monthly'] },
  { key: 'video',      label: 'Video Editing',           price: 400, priceLabel: '$400/mo or one-off', durations: ['monthly', 'one-off'] },
  { key: 'ad-creative',label: 'Ad Creative',             price: 400, priceLabel: '$400/mo or one-off', durations: ['monthly', 'one-off'] },
  { key: 'ugc',        label: 'UGC',                     price: 900, priceLabel: '$700–1,200/pack',  durations: ['monthly', 'one-off'] },
];

export const packageByKey = (key: string): PackageDef | undefined => PACKAGES.find((p) => p.key === key);

export interface SelectedPackage {
  key: string;
  duration: Duration;
  price: number;
}

export interface BillingInfo {
  packages: SelectedPackage[];
  term: ContractTerm;
  /** ISO yyyy-mm-dd — when the contract starts (drives renewal dates). */
  startDate: string;
}

export const CONTRACT_TERMS: ContractTerm[] = [3, 6, 12];

export const monthlyTotal = (pkgs: SelectedPackage[]): number =>
  pkgs.filter((p) => p.duration === 'monthly').reduce((s, p) => s + p.price, 0);
export const oneOffTotal = (pkgs: SelectedPackage[]): number =>
  pkgs.filter((p) => p.duration === 'one-off').reduce((s, p) => s + p.price, 0);

export const usd = (n: number): string => `$${n.toLocaleString('en-US')}`;

function shiftMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}
function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Contract end + the renewal-reminder milestones (45 days out to flag the AM,
 *  30 days out for a renew/cancel decision). */
export function contractDates(startDate: string, term: ContractTerm) {
  const end = shiftMonths(startDate, term);
  return { end, remindAt: shiftDays(end, -45), decideBy: shiftDays(end, -30) };
}

export const fmtDate = (iso: string): string =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** Whole days from today until an ISO date. Negative if the date is past. */
export function daysUntil(iso: string): number {
  const ms = 86400000;
  const today = new Date();
  const startOfToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const target = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.round((target - startOfToday) / ms);
}
