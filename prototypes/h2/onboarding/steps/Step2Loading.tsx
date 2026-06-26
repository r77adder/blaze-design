import { useEffect, useState } from 'react';
import { Heading, Text } from '@/components';
import Check2 from '@/icons/20/Check2';
import ArrowRight from '@/icons/20/ArrowRight';
import { useOnboarding } from '../onboarding-context';

const CHECKS = [
  { label: 'Type', value: 'Service-based, Consultant' },
  { label: 'Audience', value: 'Confident, Warm, Expert' },
  { label: 'Position', value: 'Trusted partner for growth' },
] as const;

export function Step2Loading() {
  const { next, websiteUrl } = useOnboarding();
  const [revealCount, setRevealCount] = useState(0);

  // Progressive reveal of the 3 brand-profile checks so the user sees the
  // system "learning" rather than a static placeholder. After the last
  // check appears, we hold ~600ms then advance.
  useEffect(() => {
    if (revealCount >= CHECKS.length) {
      const done = setTimeout(() => next(), 800);
      return () => clearTimeout(done);
    }
    const t = setTimeout(() => setRevealCount((c) => c + 1), 650);
    return () => clearTimeout(t);
  }, [revealCount, next]);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 900, textAlign: 'center' }}>
        <Text
          variant="metadata"
          style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 12, fontSize: 14 }}
        >
          In progress…
        </Text>
        <Heading level={1} style={{ marginBottom: 12, fontSize: 40, letterSpacing: '-0.5px' }}>
          Learning about your business
        </Heading>
        <Text
          variant="primary"
          style={{
            display: 'block',
            fontSize: 16,
            color: 'var(--dark-60)',
            marginBottom: 48,
          }}
        >
          We read your site and build your brand profile, like this:
        </Text>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 32,
            textAlign: 'left',
          }}
        >
          {/* MOCK BROWSER */}
          <div>
            <Text
              variant="metadata"
              style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 10, fontSize: 14 }}
            >
              Your website:
            </Text>
            <div
              style={{
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                background: 'var(--light-100)',
                overflow: 'hidden',
                boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--dark-8)',
                  background: '#fafbfc',
                }}
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={dot('#ff5f57')} />
                  <span style={dot('#febc2e')} />
                  <span style={dot('#28c840')} />
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '4px 10px',
                    background: 'var(--light-100)',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 6,
                    fontSize: 12,
                    color: 'var(--dark-60)',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {websiteUrl || 'yourbusiness.com'}
                </div>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ShimmerBlock style={{ height: 80 }} />
                <ShimmerBlock style={{ height: 10, width: '85%' }} />
                <ShimmerBlock style={{ height: 10, width: '70%' }} />
                <ShimmerBlock style={{ height: 32, width: 110, borderRadius: 6 }} />
              </div>
            </div>
          </div>

          {/* ARROW */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight size={20} color="var(--dark-60)" />
          </div>

          {/* BRAND PROFILE */}
          <div>
            <Text
              variant="metadata"
              style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 10, fontSize: 14 }}
            >
              Brand profile:
            </Text>
            <div
              style={{
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                background: 'var(--light-100)',
                padding: 20,
                boxShadow: '0 8px 28px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--dark-4)',
                    flexShrink: 0,
                  }}
                />
                <Text
                  variant="primary"
                  style={{ display: 'block', color: 'var(--dark-90)', fontSize: 16 }}
                >
                  Acme Studios (Example)
                </Text>
              </div>
              {CHECKS.map((c, i) => {
                const visible = i < revealCount;
                return (
                  <div
                    key={c.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr 20px',
                      alignItems: 'center',
                      gap: 10,
                      opacity: visible ? 1 : 0.25,
                      transform: visible ? 'translateY(0)' : 'translateY(4px)',
                      transition: 'opacity 320ms ease, transform 320ms ease',
                    }}
                  >
                    <Text
                      variant="smallList"
                      style={{ color: 'var(--dark-90)', fontWeight: 500 }}
                    >
                      {c.label}
                    </Text>
                    <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
                      {c.value}
                    </Text>
                    <span style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                      {visible && <Check2 size={16} color="#04af00" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function dot(color: string) {
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color,
    display: 'inline-block',
  } as const;
}

function ShimmerBlock({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--dark-4)',
        borderRadius: 4,
        height: 12,
        ...style,
      }}
    />
  );
}
