/**
 * Brand Kit flow — data for the 3 setup steps. Lifted out of the React
 * components so the option lists are easy to scan/edit and the step
 * components stay focused on layout.
 */

// ── Step 1: Visual style ─────────────────────────────────────────────────────

export type StyleId =
  | 'gauzy-portrait'
  | 'dramatic-luxe'
  | 'sun-drenched'
  | 'deep-contrast'
  | 'soft-pastel'
  | 'mono-editorial';

export interface StyleOption {
  id: StyleId;
  name: string;
  description: string;
  /** Whether this style is in the "Recommended for your brand" section. */
  recommended: boolean;
  /** Three metadata pills shown under each card: lighting, color tone, contrast. */
  pills: { lighting: string; color: string; contrast: string };
  /** Thumbnail image (small portrait shown next to the name). */
  thumbnail: string;
  /** Full preview image shown in the right column when this style is selected. */
  previewImage: string;
  /** CSS filter string applied to the "after" half of the preview. */
  afterFilter: string;
}

export const STYLES: StyleOption[] = [
  {
    id: 'gauzy-portrait',
    name: 'Gauzy Portrait',
    description: 'Intimate portrait isolation with extreme bokeh and soft, flattering light.',
    recommended: true,
    pills: { lighting: 'Hard directional', color: 'Punchy neutral', contrast: 'High' },
    thumbnail: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'saturate(1.15) contrast(1.1) brightness(1.05)',
  },
  {
    id: 'dramatic-luxe',
    name: 'Dramatic Luxe',
    description:
      'Cinematic lifestyle where hard shadows simplify the frame and bold colors command attention.',
    recommended: true,
    pills: { lighting: 'Selective moody', color: 'Dark atmospheric', contrast: 'Medium-high' },
    thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'saturate(1.25) contrast(1.3) brightness(0.92)',
  },
  {
    id: 'sun-drenched',
    name: 'Sun Drenched',
    description:
      'Dreamy golden filter over bright photography — cream highlights, lifted shadows, nostalgic warmth.',
    recommended: true,
    pills: { lighting: 'Bright backlit', color: 'Golden wash', contrast: 'Very low' },
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'sepia(0.18) saturate(1.1) brightness(1.08) contrast(0.95)',
  },
  {
    id: 'deep-contrast',
    name: 'Deep Contrast',
    description:
      'Editorial high-contrast look with crushed blacks and clean whites — print-magazine energy.',
    recommended: false,
    pills: { lighting: 'Hard directional', color: 'Muted neutral', contrast: 'Very high' },
    thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'contrast(1.45) saturate(0.9) brightness(0.96)',
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    description:
      'Airy, washed pastels with gentle highlights — soft and approachable for wellness audiences.',
    recommended: false,
    pills: { lighting: 'Diffused soft', color: 'Pastel wash', contrast: 'Low' },
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'saturate(0.85) brightness(1.12) contrast(0.92) hue-rotate(-4deg)',
  },
  {
    id: 'mono-editorial',
    name: 'Mono Editorial',
    description:
      'Refined black-and-white look with subtle grain — gravitas and timelessness in one frame.',
    recommended: false,
    pills: { lighting: 'Hard directional', color: 'Monochrome', contrast: 'Medium' },
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
    previewImage:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&q=85',
    afterFilter: 'grayscale(1) contrast(1.15) brightness(1)',
  },
];

// ── Step 2: Typeface ─────────────────────────────────────────────────────────

export type TypefaceId = 'bricolage' | 'teodor' | 'futura';

export interface TypefaceOption {
  id: TypefaceId;
  /** Large display name rendered IN the typeface itself. */
  displayName: string;
  /** Smaller supporting label (the actual font name for catalog reference). */
  supportingName: string;
  /** Google Fonts family name used in the live preview + injected via <link>. */
  cssFamily: string;
  /** Google Fonts query slug (used to build the stylesheet URL). */
  googleFontsParam: string;
  /** Default weight for the display name in the card. */
  displayWeight: number;
  /** Letter-spacing tweak so each font renders close to its identity. */
  letterSpacing?: string;
}

export const TYPEFACES: TypefaceOption[] = [
  {
    id: 'bricolage',
    displayName: 'Bricolage Grotesque',
    supportingName: 'Lexend Sans',
    cssFamily: 'Bricolage Grotesque',
    googleFontsParam: 'Bricolage+Grotesque:wght@400;500;700;800',
    displayWeight: 700,
    letterSpacing: '-0.02em',
  },
  {
    id: 'teodor',
    displayName: 'Teodor Display',
    supportingName: 'Alegreya',
    // Teodor isn't on Google Fonts; the closest editorial serif is Cormorant
    // Garamond which carries the same elegant high-contrast feel.
    cssFamily: 'Cormorant Garamond',
    googleFontsParam: 'Cormorant+Garamond:wght@400;500;600;700',
    displayWeight: 500,
    letterSpacing: '-0.005em',
  },
  {
    id: 'futura',
    displayName: 'FUTURA NOW',
    supportingName: 'Sofia Sans',
    // Futura isn't on Google Fonts; Archivo Black is the closest geometric
    // grotesque available there.
    cssFamily: 'Archivo Black',
    googleFontsParam: 'Archivo+Black',
    displayWeight: 900,
    letterSpacing: '0.04em',
  },
];

// ── Step 3: Photo freedom ────────────────────────────────────────────────────

export type FreedomId = 'full' | 'balanced' | 'minimal' | 'strict';

export interface FreedomOption {
  id: FreedomId;
  name: string;
  description: string;
  iconKey: 'sparkle' | 'layers' | 'diamond' | 'lock';
  /** Tint background color for the icon square. */
  iconTint: string;
  /** Foreground color for the icon. */
  iconColor: string;
}

export const FREEDOMS: FreedomOption[] = [
  {
    id: 'full',
    name: 'Full Freedom',
    description: 'Blaze can significantly transform your photos for the best possible result.',
    iconKey: 'sparkle',
    iconTint: 'rgba(124, 92, 252, 0.14)',
    iconColor: 'var(--purple)',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Blaze makes thoughtful edits but keeps your photos recognizable.',
    iconKey: 'layers',
    iconTint: 'rgba(33, 121, 207, 0.14)',
    iconColor: '#0179cf',
  },
  {
    id: 'minimal',
    name: 'Minimal changes',
    description: 'Blaze only adjusts lighting and minor details. Your originals stay mostly as-is.',
    iconKey: 'diamond',
    iconTint: 'rgba(4, 175, 0, 0.12)',
    iconColor: '#04af00',
  },
  {
    id: 'strict',
    name: 'Strict brand control',
    description: 'Uses only your Brand Kit assets without modifications or stock content.',
    iconKey: 'lock',
    iconTint: 'rgba(0, 0, 0, 0.06)',
    iconColor: 'var(--dark-90)',
  },
];

export const DEFAULT_STYLE: StyleId = 'gauzy-portrait';
export const DEFAULT_TYPEFACE: TypefaceId = 'bricolage';
export const DEFAULT_FREEDOM: FreedomId = 'full';
