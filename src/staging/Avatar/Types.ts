import type { HTMLAttributes } from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// Round image with initials fallback. `fallback` is required so we don't
// try to derive initials from a name string — callers know what to display.
// `src` is optional; if present we render an <img>, otherwise the fallback.
// See CONVENTIONS.md.
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** Image URL. If absent, the `fallback` initials are shown. */
  src?: string;
  /** Initials to show when `src` is missing. */
  fallback: string;
  /**
   * Diameter. Named presets: sm=24px, md=32px, lg=40px, xl=56px, xxl=72px.
   * Or pass a number for an arbitrary pixel size. Default 'md'.
   */
  size?: AvatarSize | number;
  /** Alt text for the image when `src` is provided. */
  alt?: string;
}
