import { GlassIconButton } from '@ios/components';
import heroPreview from './hero-preview.png';
import barGroupIcon from '@ios/icons/bar-group-03.svg';
import lineChartIcon from '@ios/icons/line-chart-up-01.svg';
import refreshIcon from '@ios/icons/refresh.svg';
import chevronLeftIcon from '@ios/icons/chevron-left.svg';
import instagramIcon from '@ios/icons/instagram-brand.svg';
import twitterIcon from '@ios/icons/x-02.svg';
import facebookIcon from '@ios/icons/facebook-brand.svg';
import tiktokIcon from '@ios/icons/tiktok-brand.svg';
import googleIcon from '@ios/icons/google.svg';
import metaIcon from '@ios/icons/meta-brand.svg';

const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
  dark40: 'var(--ios-dark-40)',
  dark8:  'var(--ios-dark-8)',
  dark4:  'var(--ios-dark-4)',
  dark3:  'rgba(0,0,0,0.03)',
  green:  'var(--ios-green)',
  blue:   '#0083e2',
  purple: '#6a00ff',
  orange: '#ef6800',
};

// Tint any black SVG to an exact color via mask.
function TintedIcon({ src, size = 24, color }: { src: string; size?: number; color: string }) {
  return (
    <div style={{
      width: size, height: size, background: color,
      WebkitMaskImage: `url("${src}")`, maskImage: `url("${src}")`,
      WebkitMaskSize: 'contain', maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center', maskPosition: 'center',
    }} />
  );
}

// section: nav bar (glass back + centered title — matches LearningsScreen)
function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', position: 'relative', flexShrink: 0 }}>
      <GlassIconButton icon={chevronLeftIcon} label="Back" onClick={onBack} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, whiteSpace: 'nowrap' }}>
        Learning Loop
      </span>
      <div style={{ width: 44, height: 44 }} />
    </div>
  );
}

// section: hero (dark-3 card with mockup + headline)
function Hero() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 19, width: '100%' }}>
      <div style={{ background: T.dark3, borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <div style={{ height: 213, width: '100%', borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(152deg, rgba(0,131,226,0.15) 10%, rgba(0,131,226,0.3) 78%)' }}>
          <img src={heroPreview} alt="Learning Loop preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, margin: 0, lineHeight: 1.2 }}>
            Enable your marketing to get smarter every week
          </h2>
          <p style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, margin: 0, lineHeight: 1.4, letterSpacing: '0.14px' }}>
            Learning Loop tracks what's working across your content, paid ads, organic and SEO – then tells you exactly what to do next. Connect your accounts and Blaze starts learning from day one.
          </p>
        </div>
      </div>
      {/* social proof */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%' }}>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {['#45164a', '#597ba1', '#3d9f73'].map(bg => (
            <div key={bg} style={{ width: 24, height: 24, borderRadius: 6, background: bg }} />
          ))}
        </div>
        <p style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, margin: 0, lineHeight: 1.4, letterSpacing: '0.14px' }}>
          Brands like yours see <span style={{ color: T.dark90 }}>+12% engagement</span> lift in the first 30 days
        </p>
      </div>
    </div>
  );
}

// section: how it works
const STEPS = [
  { n: 1, title: 'Connect Your Channels',    body: 'Link your social, ads, and SEO accounts. Blaze pulls in your data automatically.' },
  { n: 2, title: 'Blaze Analyzes Your Data', body: 'Learning Loop benchmarks your performance against 200+ accounts in your industry' },
  { n: 3, title: 'Get Your Action Plan',     body: "See exactly what's working, what's falling flat and what to do more of in plain English." },
  { n: 4, title: 'Apply with One Click',     body: 'Blaze applies optimizations automatically or surfaces them for your approval.' },
];

function HowItWorks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      <h2 style={{ fontFamily: T.font, fontSize: 22, fontWeight: 400, color: T.dark90, margin: 0, lineHeight: 1.2 }}>How Learning Loop works</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, width: '100%' }}>
        {STEPS.map(s => (
          <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: 99, background: T.dark4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: T.font, fontSize: 14, color: T.dark90, letterSpacing: '0.14px' }}>{s.n}</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4 }}>{s.title}</div>
              <div style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, lineHeight: 1.4, letterSpacing: '0.14px' }}>{s.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// section: feature cards
const FEATURES = [
  { icon: barGroupIcon,  cardBg: 'rgba(0,131,226,0.05)',  circleBg: 'rgba(0,131,226,0.1)',  color: '#0083e2', title: 'Benchmarks not vanity metrics', body: 'See how your engagement rate, save rate, and follower growth stack up against similar businesses – not the industry average.' },
  { icon: lineChartIcon, cardBg: 'rgba(106,0,255,0.03)', circleBg: 'rgba(106,0,255,0.1)', color: '#6a00ff', title: 'Actions, not just insights',    body: "Learning Loop doesn't just show you the data - it tells you what to do next and applies changes automatically so nothing slips through." },
  { icon: refreshIcon,   cardBg: 'rgba(239,104,0,0.07)', circleBg: 'rgba(239,104,0,0.1)', color: '#ef6800', title: 'Gets smarter over time',        body: 'Every post, every campaign, every keyword Blaze builds a performance model unique to your business that compounds with every week of data.' },
];

const SOCIAL_ICONS = [instagramIcon, twitterIcon, facebookIcon, tiktokIcon, metaIcon, googleIcon];

function FeatureCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
      {FEATURES.map(f => (
        <div key={f.title} style={{ background: f.cardBg, border: `1px solid ${T.dark4}`, borderRadius: 24, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: f.circleBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TintedIcon src={f.icon} size={24} color={f.color} />
          </div>
          <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4 }}>{f.title}</div>
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, lineHeight: 1.4, letterSpacing: '0.14px' }}>{f.body}</div>
        </div>
      ))}
      {/* connect channels card */}
      <div style={{ background: T.light, border: `1px solid ${T.dark4}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          {SOCIAL_ICONS.map((icon, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: T.dark3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={icon} alt="" style={{ width: 18, height: 18 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 400, color: T.dark90, lineHeight: 1.4 }}>Connect your Channels to Unlock Learning Loop</div>
          <div style={{ fontFamily: T.font, fontSize: 14, color: T.dark60, lineHeight: 1.4, letterSpacing: '0.14px' }}>
            Works with all popular platforms. Instagram, LinkedIn, X, YouTube, Google Ads, Meta Ads, Google Analytics and more
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: T.light, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <NavBar onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 40, padding: '4px 20px 0' }}>
        <Hero />
        <HowItWorks />
        <FeatureCards />
        {/* spacer so the sticky Connect footer doesn't cover content */}
        <div style={{ height: 120 }} />
      </div>
    </div>
  );
}
