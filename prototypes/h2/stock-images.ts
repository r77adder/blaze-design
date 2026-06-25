/**
 * Stock imagery for the H2 prototypes.
 *
 * We used to point <img> at picsum.photos, but its 302-redirect to a CDN trips
 * Chrome's Opaque Response Blocking (net::ERR_BLOCKED_BY_ORB), so the images
 * render blank. Unsplash's image CDN serves a proper image content-type with
 * no redirect, so it isn't blocked — it's the same source the brand-kit
 * prototype already uses. `stockImage` picks a photo deterministically from a
 * seed so a given asset always shows the same image.
 */

const STOCK_IDS = [
  'photo-1521791136064-7986c2920216', // team / handshake
  'photo-1497366216548-37526070297c', // office interior
  'photo-1453614512568-c4024d13c247', // interior
  'photo-1503602642458-232111445657', // workspace
  'photo-1531427186611-ecfd6d936c79', // office desk
  'photo-1542435503-956c469947f6', // workshop
  'photo-1544723795-3fb6469f5b39', // portrait
  'photo-1556909114-f6e7ad7d3136', // detail shot
  'photo-1507003211169-0a1dd7228f2d', // portrait
  'photo-1500648767791-00dcc994a43e', // portrait
  'photo-1521017432531-fbd92d768814', // home exterior
  'photo-1547592180-85f173990554', // food / lifestyle
];

export function stockImage(seed: string, w = 640, h = 800): string {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const id = STOCK_IDS[n % STOCK_IDS.length];
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&crop=entropy&q=60`;
}
