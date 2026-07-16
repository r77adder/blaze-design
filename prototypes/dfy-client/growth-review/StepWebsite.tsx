import { useEffect, useState, type CSSProperties } from 'react';
import { Heading, Text, Button } from '@/components';
import ArrowRight from '@/icons/20/ArrowRight';
import { WEBSITE_HEADLINE, WEBSITE_SUBHEAD, WEBSITE_URL, websiteHero } from './data';

const F = "'Sohne', sans-serif";

/** Step 3: the new website: big headline, one button, and the top of the
 *  real site peeking from the bottom of the viewport. On load the headline
 *  sweeps a color gradient before settling to dark, and the site + phone
 *  fade up into view. */
export function StepWebsite() {
  const [mounted, setMounted] = useState(false);
  const [gradientDone, setGradientDone] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    const t = setTimeout(() => setGradientDone(true), 1300);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const headlineStyle: CSSProperties = gradientDone
    ? { margin: 0 }
    : {
        margin: 0,
        // Blue → red → yellow band for a dynamic multi-color pass.
        background: 'linear-gradient(90deg, var(--dark-90) 0%, var(--status-posting) 18%, var(--red-70) 34%, var(--brand) 50%, var(--status-posting) 66%, var(--dark-90) 84%)',
        backgroundSize: '230% 100%',
        WebkitBackgroundClip: 'text', backgroundClip: 'text',
        WebkitTextFillColor: 'transparent', color: 'transparent',
        // One quick pass, no repeat.
        animation: 'gdfHeadlineSweep 1.2s ease-out',
      };

  const reveal: CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 800ms ease, transform 800ms ease',
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 32px' }}>
      <style>{'@keyframes gdfHeadlineSweep { from { background-position: 130% 0; } to { background-position: -30% 0; } }'}</style>
      {/* section: hero copy */}
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '72px 0 40px', flexShrink: 0 }}>
        <Heading level={1} style={headlineStyle}>{WEBSITE_HEADLINE}</Heading>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '14px 0 28px', fontSize: 17, lineHeight: 1.65 }}>
          {WEBSITE_SUBHEAD}
        </Text>
        <Button size="xl" endIcon={ArrowRight} onPress={() => window.open(WEBSITE_URL, '_blank', 'noopener,noreferrer')}>
          Visit Your New Website
        </Button>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginTop: 12 }}>
          Opens in a new tab. Click around, it's yours.
        </Text>
      </div>

      {/* section: website peeking from the fold (fades up on load) */}
      <div style={{ flex: 1, minHeight: 240, maxWidth: 1040, width: '100%', margin: '0 auto', position: 'relative', ...reveal }}>
        <div
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: '100%',
            borderRadius: '16px 16px 0 0',
            border: '1px solid var(--dark-8)',
            borderBottom: 'none',
            overflow: 'hidden',
            background: 'var(--light-100)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.10)',
          }}
        >
          {/* browser tab strip */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '8px 14px 0', background: 'var(--dark-4)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--dark-15)' }} />
              <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--dark-15)' }} />
              <span style={{ width: 10, height: 10, borderRadius: 99, background: 'var(--dark-15)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderBottom: 'none', borderRadius: '10px 10px 0 0', padding: '8px 12px', maxWidth: 240 }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--dark-90)', color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: F, flexShrink: 0 }}>G</span>
              <Text style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: 'var(--dark-80)', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Grain Design Flooring</Text>
              <span style={{ fontSize: 14, color: 'var(--dark-40)', lineHeight: 1, flexShrink: 0 }}>×</span>
            </div>
          </div>
          {/* address bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', borderBottom: '1px solid var(--dark-8)', background: 'var(--light-100)' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dark-4)', borderRadius: 99, padding: '7px 14px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><rect x="5" y="11" width="14" height="9" rx="2" stroke="var(--dark-40)" strokeWidth="2" /><path d="M8 11V8a4 4 0 018 0v3" stroke="var(--dark-40)" strokeWidth="2" /></svg>
              <Text style={{ fontSize: 13, color: 'var(--dark-60)', fontFamily: F }}>graindesignflooring.com</Text>
            </div>
            <span style={{ width: 18, height: 18, borderRadius: 99, background: 'var(--dark-4)', flexShrink: 0 }} />
          </div>
          {/* page body: hero inset with rounded corners like a real tab */}
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer" style={{ display: 'block', cursor: 'pointer', padding: '20px 20px 0' }} aria-label="Open your new website">
            <img
              src={websiteHero}
              alt="The top of the new Grain Design Flooring website"
              style={{ width: '100%', display: 'block', borderRadius: 12, border: '1px solid var(--dark-8)' }}
            />
          </a>
        </div>

        {/* Google Business Profile preview on a phone, sitting to the left. */}
        <GbpPhone />
      </div>
    </div>
  );
}

/** A compact Google Business Profile card on a phone mockup, floated over the
 *  bottom-left of the website preview. */
function GbpPhone() {
  const actions: { label: string; icon: React.ReactNode }[] = [
    { label: 'Call', icon: <path d="M6 3h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z" stroke="#1a73e8" strokeWidth="1.6" strokeLinejoin="round" /> },
    { label: 'Route', icon: <path d="M12 3l9 9-9 9-9-9 9-9zm0 6v3h4" stroke="#1a73e8" strokeWidth="1.6" strokeLinejoin="round" /> },
    { label: 'Website', icon: <><circle cx="12" cy="12" r="8.5" stroke="#1a73e8" strokeWidth="1.6" /><path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14 0 17M12 3.5c-2.5 2.5-2.5 14 0 17" stroke="#1a73e8" strokeWidth="1.4" /></> },
  ];
  return (
    <div style={{ position: 'absolute', left: -76, bottom: 0, width: 218, zIndex: 3, transform: 'scale(1.16)', transformOrigin: 'bottom left', filter: 'drop-shadow(0 18px 44px rgba(0,0,0,0.28))' }}>
      <div style={{ background: '#0f0f10', borderRadius: '30px 30px 0 0', padding: 7, paddingBottom: 0 }}>
        <div style={{ background: 'var(--light-100)', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
          <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--dark-80)', fontFamily: F }}>9:41</span>
            <span style={{ fontSize: 9, color: 'var(--dark-40)', letterSpacing: '1px', fontFamily: F }}>●●● ▮</span>
          </div>
          <div style={{ padding: '0 12px 8px' }}>
            <div style={{ height: 28, borderRadius: 99, border: '1px solid var(--dark-8)', display: 'flex', alignItems: 'center', gap: 7, padding: '0 11px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="var(--dark-40)" strokeWidth="2" /><path d="M20 20l-4.5-4.5" stroke="var(--dark-40)" strokeWidth="2" strokeLinecap="round" /></svg>
              <span style={{ fontSize: 10.5, color: 'var(--dark-60)', fontFamily: F }}>grain design flooring</span>
            </div>
          </div>
          <img src={websiteHero} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} />
          <div style={{ padding: '12px 14px 18px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--dark-90)', fontFamily: F, lineHeight: 1.25 }}>Grain Design Flooring</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--dark-90)', fontFamily: F }}>4.9</span>
              <span style={{ fontSize: 11, color: '#f5b400', letterSpacing: '1px' }}>★★★★★</span>
              <span style={{ fontSize: 11, color: 'var(--dark-60)', fontFamily: F }}>(118)</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--dark-60)', fontFamily: F, marginTop: 3 }}>Flooring contractor</div>
            <div style={{ fontSize: 11, color: 'var(--dark-60)', fontFamily: F, marginTop: 2 }}>
              <span style={{ color: '#04af00', fontWeight: 500 }}>Open</span> · Closes 6 PM · Florence
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {actions.map((a) => (
                <div key={a.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 99, border: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">{a.icon}</svg>
                  </div>
                  <span style={{ fontSize: 9.5, color: '#1a73e8', fontFamily: F }}>{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
