// section: local asset imports (ios/src/assets/)
import _str1 from '@ios/src/assets/str_1.png';
import _str2 from '@ios/src/assets/str_2.png';
import _str3 from '@ios/src/assets/str_3.png';
import _stillImage from '@ios/src/assets/still_image.png';
import _carousel from '@ios/src/assets/carousel.png';
import _feedVideo from '@ios/src/assets/feed_video_post.png';
import _shortForm from '@ios/src/assets/short_form_video.png';
import _stories from '@ios/src/assets/stories.png';
import _newsletter from '@ios/src/assets/newsletter.png';

// Unsplash coffee photos — durable placeholders for missing Figma assets.
const U = {
  // cups + lattes
  latte:       'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
  latteArt:    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=80',
  espresso:    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
  cupTop:      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80',
  cupSide:     'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
  cappuccino:  'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&auto=format&fit=crop&q=80',
  // beans + pour
  beans:       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
  pourOver:    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80',
  beansBg:     'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80',
  beanBag:     'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&auto=format&fit=crop&q=80',
  // cafe scenes
  cafe:        'https://images.unsplash.com/photo-1504124365819-84e2b5b17f3f?w=600&auto=format&fit=crop&q=80',
  cafeTable:   'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80',
  // people / portrait avatars
  portraitA:   'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  portraitB:   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  portraitC:   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
};

export const ASSETS = {
  // ─── avatars / logos ────────────────────────────────────────────────────
  // Brand/workspace avatars use ui-avatars (initials on a colored tile) so
  // they read as a logo, not a person. Personal avatars stay as portraits.
  workspaceAvatar:    'https://ui-avatars.com/api/?name=Radiant+Health&background=45164a&color=fff&bold=true&size=200&font-size=0.4',
  brandAvatar:        'https://ui-avatars.com/api/?name=Radiant+Health&background=45164a&color=fff&bold=true&size=200&font-size=0.4',
  brandProfileAvatar: 'https://ui-avatars.com/api/?name=Radiant+Health&background=45164a&color=fff&bold=true&size=200&font-size=0.4',
  nikeAvatar:         'https://ui-avatars.com/api/?name=Nike&background=000&color=fff&bold=true&size=200&font-size=0.5',
  userAvatar:         U.portraitA,
  adamAvatar:         U.portraitB,

  // ─── icons (no longer used after the merge — kept for back-compat) ─────
  // These were photo-icons in the Figma source. Point them at the latte
  // image so any stray <img> doesn't render as a broken-image glyph.
  creditsIcon:        U.latte,
  calGradIcon:        U.latte,
  approvalsIcon:      U.latte,
  starsIcon:          U.latte,
  homeVideoIcon:      U.latte,
  brandFileBlazeIcon: U.beans,

  // ─── brand media (Brand Kit) ───────────────────────────────────────────
  brandMedia1:      U.latteArt,
  brandMedia2:      U.cafe,
  brandMediaThumb1: U.latteArt,
  brandMediaThumb2: U.beans,
  brandMediaThumb3: U.cupTop,

  // ─── Campaigns screen — coffee campaign thumbnails ─────────────────────
  coffeeBg:        U.beansBg,
  savorOrigins:    U.beans,
  signatureBlends: U.latteArt,
  brewBold:        U.espresso,
  brewedForYou:    U.cappuccino,
  mothersDay:      U.cupTop,
  productQ1:       U.pourOver,

  // ─── Calendar screen — content thumbnails ──────────────────────────────
  calStillImage:   U.latte,
  calVideoPreview: U.cafe,
  calCarouselImg:  U.beans,
  calBlogCover:    U.pourOver,
  calEmailPreview: U.cupTop,

  // ─── Home screen v2 — Upcoming posts content cards ─────────────────────
  homeUpcomingBlog:    U.latte,
  homeUpcomingProduct: U.beans,
  homeUpcomingPhoto:   U.cappuccino,

  // ─── Home screen v2 — Campaign row thumbnails ──────────────────────────
  homeCampaignSuccess: U.beans,
  homeCampaignTips:    U.cafe,
  homeCampaignKona:    U.beansBg,

  // ─── Home screen (legacy refs) ─────────────────────────────────────────
  homeBlogPost:      U.pourOver,
  homeCarouselPhoto: U.latteArt,
  homeFeedImg:       U.cappuccino,
  homeCampaignImg:   U.beans,

  // ─── Add strategies — active strategy bg ───────────────────────────────
  activeStrategyBg:  U.beansBg,

  // ─── Add strategies — strategy row thumbnails (local PNGs) ─────────────
  stratThumbThoughtLead: _str1 as string,
  stratThumbEducational: _str2 as string,
  stratThumbOffer:       _str3 as string,

  // ─── Set default content — content type thumbnails (local PNGs) ────────
  contentThumbStillImage: _stillImage as string,
  contentThumbCarousel:   _carousel as string,
  contentThumbFeedVideo:  _feedVideo as string,
  contentThumbShortForm:  _shortForm as string,
  contentThumbStories:    _stories as string,
  contentThumbEmail:      _newsletter as string,

  // ─── Campaigns screen — per-row thumbnails ─────────────────────────────
  campThumb1: U.latteArt,
  campThumb2: U.cafe,
  campThumb3: U.beans,
  campThumb4: U.pourOver,
  campThumb5: U.cappuccino,
  campThumb6: U.cupTop,
} as const;
