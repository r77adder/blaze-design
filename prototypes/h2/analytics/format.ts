import type { AssetType } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-06-03" → "Jun 3". UTC so it matches the anchored mock dates exactly. */
export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "2026-06-03" → "Jun 3, 2026". */
export function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  ad: 'Ad',
  social_post: 'Social',
  blog_article: 'Blog',
  email_campaign: 'Email',
  landing_page: 'Landing page',
};

export function assetTypeLabel(type: AssetType): string {
  return ASSET_TYPE_LABEL[type];
}

const PLATFORM_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  google: 'Google',
  sendgrid: 'Email',
  blog: 'Blog',
};

/** Friendly platform name from a UTM source — for showing the actual ad/post
 *  instead of raw UTM strings. */
export function platformLabel(utmSource: string): string {
  return PLATFORM_LABEL[utmSource] ?? utmSource;
}

/** Human-readable campaign name from a utm_campaign slug.
 *  "spring_refresh_2026" → "Spring Refresh 2026". */
export function campaignName(slug: string): string {
  return slug
    .split(/[_-]/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Sohne body tracking by font size (see CLAUDE.md / blaze-sohne-letter-spacing). */
export function tracking(fontSize: number): string {
  return `${(fontSize * 0.02).toFixed(2)}px`;
}

export const FONT = "'Sohne', sans-serif";
