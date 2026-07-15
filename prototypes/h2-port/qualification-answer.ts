import type { Lead } from './sdr-data';

/**
 * Per-lead answers to the configured qualification questions — shared by the
 * lead-detail sidebar and the CSV export columns/filters. The underlying lead
 * data has no zip/service, so those are derived stably per lead.
 */

export const localPhone = (phone: string) => phone.replace(/^\+1\s*/, '');

export const SAMPLE_ZIPS = ['78701', '78702', '78703', '78704', '78705', '78610', '78613', '78620', '78641', '78660', '78664', '78681'];
export const FLOORING_SERVICES = ['Hardwood floor', 'Laminate floor', 'Vinyl floor', 'Carpet'];

export function seedIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

export const leadZip = (lead: Lead) => SAMPLE_ZIPS[seedIndex(lead.id, SAMPLE_ZIPS.length)];
export const leadService = (lead: Lead) => FLOORING_SERVICES[seedIndex(`${lead.id}·svc`, FLOORING_SERVICES.length)];

export function qualificationAnswer(lead: Lead, id: string): string | undefined {
  switch (id) {
    case 'q-name': return lead.prospect.name;
    case 'q-phone': return localPhone(lead.prospect.phone);
    case 'q-zip': return leadZip(lead);
    case 'q-budget': return lead.scorecard.budget;
    case 'q-service': return leadService(lead);
    default: return undefined;
  }
}
