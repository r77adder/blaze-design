import { ASSET_ORDER, generatedAssets, type AssetType } from '../cold-flows/creative-data';
import { THEME } from '../cold-flows/CreativeReviewFlow';
import { stockImage } from '../stock-images';

/**
 * V2 chat-onboarding mock data — competitors the agent "found" and the first
 * wave of creative it generated. Hardcoded for the CertaPro demo.
 */

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  note: string;
  /** Logo-chip background (brand-ish color per competitor). */
  color: string;
}

export const COMPETITORS: Competitor[] = [
  { id: 'app', name: 'Austin Pro Painters', handle: '@austinpropainters', note: 'Always-on Meta lead ads + a dedicated estimate landing page.', color: '#1E3A8A' },
  { id: 'lsp', name: 'Lone Star Painting Co.', handle: 'lonestarpainting.com', note: 'Owns "painters near me Austin" on Google with sitelinks + call extensions.', color: '#B45309' },
  { id: 'hcf', name: 'Hill Country Finishes', handle: '@hillcountryfinishes', note: 'Cabinet refinish time-lapses over-indexing on TikTok / Reels.', color: '#15803D' },
  { id: 'fsp', name: 'Five Star Painting', handle: 'fivestarpainting.com', note: 'YouTube pre-roll for brand awareness across the metro.', color: '#B91C1C' },
  { id: 'wow', name: 'WOW 1 Day Painting', handle: 'wow1day.com', note: 'Retargeting display banners after a site visit.', color: '#7C3AED' },
];

/** Preview aspect ratio per format, matched to the channel it represents. */
export const GALLERY_ASPECT: Partial<Record<AssetType, string>> = {
  'Meta Ad': '4 / 5',
  'Search Ad': '4 / 5',
  'Still Image': '4 / 5',
  Carousel: '4 / 5',
  Story: '9 / 16',
  Video: '9 / 16',
};

export interface GalleryItem {
  id: string;
  type: AssetType;
  overlay: string;
  caption: string;
  aspect: string;
  img: string;
}

/** A representative slice of the generated wave — first 2 of each visual format. */
export function galleryItems(): GalleryItem[] {
  const all = generatedAssets(THEME);
  const visual: AssetType[] = ['Meta Ad', 'Still Image', 'Carousel', 'Story', 'Video', 'Search Ad'];
  const out: GalleryItem[] = [];
  for (const t of ASSET_ORDER) {
    if (!visual.includes(t)) continue;
    const ofType = all.filter((a) => a.type === t).slice(0, 2);
    ofType.forEach((a, i) =>
      out.push({
        id: a.id,
        type: a.type,
        overlay: a.overlay,
        caption: a.caption,
        aspect: GALLERY_ASPECT[t] ?? '4 / 5',
        img: stockImage(`${a.id}-${i}`, 640, 800),
      }),
    );
  }
  return out;
}
