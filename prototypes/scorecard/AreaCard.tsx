import type { ComponentType } from 'react';
import type { IconProps } from '@/icons/Types';
import { Text, Heading } from '@/components';
import { Pill } from '@/staging';
import Check2 from '@/icons/20/Check2';
import AlertTriangle from '@/icons/20/AlertTriangle';
import XSquareContained from '@/icons/24/XSquareContained';
import InstagramBrand from '@/icons/24/InstagramBrand';
import Facebook from '@/icons/20/Facebook';
import LinkedIn from '@/icons/20/LinkedIn';
import Google from '@/icons/20/Google';
import MetaBrand from '@/icons/20/MetaBrand';
import TikTok from '@/icons/20/TikTok';
import TwitterBrand from '@/icons/20/TwitterBrand';
import Browser from '@/icons/20/Browser';
import { GaugeRing } from './GaugeRing';
import { statusColor, statusDisk, statusTrack, type Status } from './tokens';

// Map a platform label to a brand logo. Falls back to a first-letter
// monogram on var(--dark-90) for anything without a lib icon (e.g. Yelp,
// Angi, Lead forms). Matches the SourceLogo pattern in
// prototypes/h2/pages/Reputation.tsx.
const PLATFORM_ICONS: Record<string, ComponentType<IconProps>> = {
  ig: InstagramBrand,
  instagram: InstagramBrand,
  fb: Facebook,
  facebook: Facebook,
  linkedin: LinkedIn,
  google: Google,
  meta: MetaBrand,
  tiktok: TikTok,
  twitter: TwitterBrand,
  x: TwitterBrand,
  website: Browser,
};

// Brand colors for monogram fallbacks. Picked from each brand's official
// color guidelines so the small letter chips still read as the right logo
// even without a vector SVG.
const BRAND_COLORS: Record<string, string> = {
  yelp: '#D32323',
  angi: '#FF6153',
};

// Some icons render edge-to-edge in their viewBox (e.g. Browser) and need
// to render smaller so their visual size matches the brand-glyph icons,
// which have built-in padding inside their viewBox.
const ICON_SIZE_OVERRIDE: Record<string, number> = {
  website: 12,
};

function PlatformIcon({ label, size = 14 }: { label: string; size?: number }) {
  const key = label.toLowerCase();
  const Icon = PLATFORM_ICONS[key];
  if (Icon) {
    const s = ICON_SIZE_OVERRIDE[key] ?? size;
    return <Icon size={s} />;
  }
  const letter = label.trim().charAt(0).toUpperCase();
  const bg = BRAND_COLORS[key] ?? 'var(--dark-90)';
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        background: bg,
        color: 'var(--light-100)',
        fontSize: Math.round(size * 0.65),
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {letter}
    </span>
  );
}

function PlatformPill({ label }: { label: string }) {
  // Tighten left padding so the icon hugs the rounded edge — Pill default
  // is 4px 8px; we drop the left side to 4px while keeping the right at 8px
  // for breathing room around the label.
  return (
    <Pill style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
      <PlatformIcon label={label} size={14} />
      {label}
    </Pill>
  );
}

export interface Check {
  status: Status;
  title: string;
  pts: string;
  desc: string;
}

export interface AreaCardProps {
  number: number;
  eyebrow: string;
  title: string;
  platforms: string[];
  score: number;
  maxScore: number;
  status: Status;
  checks: Check[];
}

// Stand-alone icon glyphs — no tinted frame, no border, no fill. The icon
// shape itself carries the signal. Colors map to the section's status
// palette so the row's intent reads at a glance.
function CheckIcon({ status }: { status: Status }) {
  const color =
    status === 'good' ? 'var(--dark-90)' :
    status === 'warn' ? 'var(--yellow-90)' :
    'var(--red-70)';
  return (
    <span
      style={{
        width: 22,
        height: 22,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        lineHeight: 0,
        color,
      }}
    >
      {status === 'good' && <Check2 size={20} />}
      {status === 'warn' && <AlertTriangle size={20} />}
      {status === 'bad' && <XSquareContained size={20} />}
    </span>
  );
}

export function AreaCard({ eyebrow, title, platforms, score, maxScore, status, checks }: AreaCardProps) {
  return (
    <section style={{ marginBottom: 36 }}>
      {/* Header above card — score ring + section name + platform pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <GaugeRing
            score={score}
            max={maxScore}
            color={statusColor(status)}
            trackColor={statusTrack(status)}
            diskColor={statusDisk(status)}
            size={48}
            strokeWidth={4}
            animate
          >
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '0.3px' }}>
              {score}
            </span>
          </GaugeRing>
          <Heading level={3} style={{ margin: 0 }}>{eyebrow}</Heading>
        </div>
        {platforms.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            {platforms.map(p => (
              <PlatformPill key={p} label={p} />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Heading level={4}>{title}</Heading>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {checks.map((check, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: i === checks.length - 1 ? '12px 4px 0' : '12px 4px',
                borderTop: i === 0 ? '1px solid var(--dark-4)' : 'none',
                borderBottom: i < checks.length - 1 ? '1px solid var(--dark-4)' : 'none',
              }}
            >
              <CheckIcon status={check.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{check.title}</span>
                <Text variant="secondary" color="var(--dark-60)" style={{ fontSize: 13, lineHeight: 1.5, display: 'block', marginTop: 2 }}>
                  {check.desc}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// All area data lives here so ResultsView stays clean
export const AREAS: AreaCardProps[] = [
  {
    number: 1,
    eyebrow: 'Presence & Awareness',
    title: 'Show up where your customers already are',
    platforms: ['IG', 'FB', 'LinkedIn', 'TikTok'],
    score: 9, maxScore: 25, status: 'bad',
    checks: [
      { status: 'bad',  title: 'Instagram posting cadence',  pts: '0 / 4 pts', desc: 'Last post 41 days ago. Healthy painting accounts post 8–12 before/afters a month.' },
      { status: 'bad',  title: 'Facebook posting cadence',   pts: '1 / 4 pts', desc: '2 posts in last 30 days. Paper Moon Painting posts 16×/month with 4× the engagement.' },
      { status: 'warn', title: 'Cross-platform coverage',    pts: '2 / 4 pts', desc: 'Active on Instagram and Facebook. Missing LinkedIn for commercial leads and TikTok, where cabinet transformations are getting huge reach.' },
      { status: 'warn', title: 'Content variety',            pts: '2 / 4 pts', desc: '88% of your posts are static finished-room photos. Before/after carousels and crew videos drive 3× the reach for painting contractors.' },
      { status: 'bad',  title: 'Branded search ranking',     pts: '1 / 5 pts', desc: 'Yelp outranks certapro.com/austin for "certapro austin." A competitor is also running a paid ad against your name.' },
      { status: 'warn', title: 'Profile completeness',       pts: '3 / 4 pts', desc: 'Instagram bio missing service area; Facebook hours don\'t mention Saturday availability. Both affect local SEO ranking.' },
    ],
  },
  {
    number: 2,
    eyebrow: 'Paid Ads',
    title: 'Pour fuel on what\'s already working',
    platforms: ['Google', 'Meta'],
    score: 4, maxScore: 25, status: 'bad',
    checks: [
      { status: 'bad',  title: 'Active Google Search ads',    pts: '0 / 6 pts', desc: 'No campaigns detected in Google Ads Transparency Center. 5 painting competitors are running active campaigns in the Austin metro right now.' },
      { status: 'bad',  title: 'Active Meta ads',             pts: '0 / 5 pts', desc: 'Zero campaigns in Meta Ad Library (90-day lookback). 3 of your competitors run consistent local Meta campaigns featuring before/after reels.' },
      { status: 'bad',  title: 'Branded keyword defense',     pts: '0 / 5 pts', desc: '"Five Star Painting" is bidding on your business name — they\'re stealing customers who searched for you specifically. Conservative estimate: $1,100/mo of branded traffic lost.' },
      { status: 'bad',  title: 'Geographic coverage',         pts: '0 / 4 pts', desc: 'No active campaigns, so Austin metro ZIPs (Cedar Park, Round Rock, Lakeway, Westlake) are uncovered in the highest-intent customer moments.' },
      { status: 'warn', title: 'Conversion tracking',         pts: '4 / 5 pts', desc: 'GA4 installed correctly, but no conversion events firing yet. Means you couldn\'t measure paid ROI on estimate requests even if you launched today.' },
    ],
  },
  {
    number: 3,
    eyebrow: 'Conversion',
    title: 'Turn more of the visitors you already have',
    platforms: ['Website', 'Lead forms'],
    score: 17, maxScore: 25, status: 'warn',
    checks: [
      { status: 'good', title: 'Phone number above the fold', pts: '4 / 4 pts', desc: 'Click-to-call (512) 323-9502 visible in header on every page. Great — phone is still ~42% of painting leads.' },
      { status: 'warn', title: 'Hero CTA strength',           pts: '2 / 5 pts', desc: '"Contact Us" is vague. "Get a Free Estimate" or "Book a Color Consultation" converts 30–60% better for painting contractors.' },
      { status: 'good', title: 'Mobile responsive',           pts: '4 / 4 pts', desc: 'Site renders cleanly on mobile. 71% of your traffic is mobile, so this matters.' },
      { status: 'bad',  title: 'Page speed (mobile)',         pts: '1 / 5 pts', desc: 'LCP 4.4s vs. Google\'s 2.5s threshold. ~32% of mobile visitors bounce before the hero loads. Worth ~$700/mo in lost estimate requests.' },
      { status: 'warn', title: 'Lead form length',            pts: '3 / 4 pts', desc: '9 fields on the estimate form. Completion drops ~15% per field past 5. Trim to name, phone, ZIP, project type.' },
      { status: 'good', title: 'Trust signals',               pts: '3 / 3 pts', desc: 'BBB badge, PCA certification, and "fully insured" all visible on the footer. Solid.' },
    ],
  },
  {
    number: 4,
    eyebrow: 'Reputation Management',
    title: 'Make every customer your loudest salesperson',
    platforms: ['Google', 'Yelp', 'Facebook'],
    score: 17, maxScore: 25, status: 'warn',
    checks: [
      { status: 'good', title: 'Average rating',              pts: '6 / 6 pts', desc: '4.7 ★ across all platforms. Strong — this is the foundation everything else builds on.' },
      { status: 'warn', title: 'Review volume',               pts: '3 / 5 pts', desc: '187 total reviews (Google 152, Yelp 24, Facebook 11). Top 3 Austin painting competitors average 340. Volume is a ranking signal.' },
      { status: 'bad',  title: 'Review velocity',             pts: '1 / 5 pts', desc: '1.2 new reviews/month. Local benchmark for painters: 4+/month. A post-project ask flow could 3× this in 60 days.' },
      { status: 'bad',  title: 'Owner response rate',         pts: '1 / 5 pts', desc: '18% — you reply to fewer than 1 in 5. Owner replies are a public trust signal and lift conversion ~11%.' },
      { status: 'warn', title: 'Cross-platform presence',     pts: '2 / 4 pts', desc: 'On Google + Yelp + Facebook. Missing BBB and Houzz — Houzz drives a surprising amount of Austin interior painting leads.' },
    ],
  },
];
