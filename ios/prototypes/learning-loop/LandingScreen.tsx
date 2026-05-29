import { GlassIconButton } from '@ios/components';
import heroPreview from './hero-preview.png';
import chevronLeftIcon from '@ios/icons/chevron-left.svg';

const T = {
  font:   'var(--ios-font)',
  light:  'var(--ios-light-100)',
  dark90: 'var(--ios-dark-90)',
  dark60: 'var(--ios-dark-60)',
};

// section: nav bar — matches LearningsScreen
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

export function LandingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ background: T.light, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <NavBar onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: '4px 20px 0' }}>
        {/* Hero mockup with blue background */}
        <div style={{ height: 213, width: '100%', borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(152deg, rgba(0,131,226,0.15) 10%, rgba(0,131,226,0.3) 78%)' }}>
          <img src={heroPreview} alt="Learning Loop preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* Headline + body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 400, color: T.dark90, margin: 0, lineHeight: 1.15, textAlign: 'center' }}>
            Connect an account to start your Learning Loop
          </h1>
          <p style={{ fontFamily: T.font, fontSize: 16, color: T.dark60, margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
            We'll watch your content, ads, and SEO across every channel — then send you clear recommendations each week, starting 7 days after you connect.
          </p>
        </div>
        {/* spacer so the sticky footer doesn't cover the content */}
        <div style={{ height: 140 }} />
      </div>
    </div>
  );
}
