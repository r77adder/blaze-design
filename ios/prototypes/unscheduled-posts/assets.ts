// Unsplash coffee photos — durable placeholders for missing Figma assets.
const latte    = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80';
const beans    = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80';
const cafe     = 'https://images.unsplash.com/photo-1504124365819-84e2b5b17f3f?w=600&auto=format&fit=crop&q=80';
const pourOver = 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80';
const cupTop   = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80';
const logo = 'https://ui-avatars.com/api/?name=Radiant+Health&background=45164a&color=fff&bold=true&size=200&font-size=0.4';

export const ASSETS = {
  workspaceAvatar: logo,
  stillImage:      latte,
  videoPreview:    cafe,
  carouselImg:     beans,
  blogCover:       pourOver,
  emailPreview:    cupTop,
} as const;
