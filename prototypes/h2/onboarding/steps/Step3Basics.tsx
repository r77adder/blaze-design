import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button, Heading, Text } from '@/components';
import Upload from '@/icons/20/Upload';
import Edit1 from '@/icons/20/Edit1';
import Instagram from '@/icons/20/Instagram';
import Facebook from '@/icons/20/Facebook';
import TikTok from '@/icons/20/TikTok';
import LinkedIn from '@/icons/20/LinkedIn';
import Google from '@/icons/20/Google';
import Star from '@/icons/20/Star';
import { useOnboarding } from '../onboarding-context';

/**
 * V1 "basics" step — condensed. Brand (logo + name) leads, then connected
 * profiles, then the brand-context text. Each section is read-only with a
 * tertiary Edit toggle that reveals inline inputs.
 */

export function Step3Basics() {
  const { profile, updateProfile, next, back } = useOnboarding();
  const [segments, setSegments] = useState(
    'Homeowners 35–65 planning an interior or exterior project, property managers & HOAs with recurring repaints, and past customers ripe for referrals.',
  );
  const [services, setServices] = useState(
    'Interior & exterior painting, cabinet refinishing, and commercial coatings — concierge service from color consult to cleanup.',
  );
  const [goal, setGoal] = useState(
    'Drive 25+ qualified estimate requests a month from paid channels within 90 days — a predictable pipeline at a lower cost per lead.',
  );

  return (
    <div style={{ padding: '64px 24px 120px', maxWidth: 760, margin: '0 auto' }}>
      <Heading level={1} style={{ fontSize: 32, letterSpacing: '-0.4px', lineHeight: 1.2, marginBottom: 8 }}>
        First, let's confirm some basics about your business
      </Heading>
      <Text variant="primary" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 16, marginBottom: 8 }}>
        Pulled from your website — edit anything that's off.
      </Text>

      {/* 1 · Brand (logo + name) — leads the page */}
      <Section title="Brand" first>
        {(editing) => (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <LogoBox />
            <div style={{ flex: 1, minWidth: 220 }}>
              {editing ? (
                <>
                  <FieldLabel>Business name</FieldLabel>
                  <TextInput value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
                  <div style={{ marginTop: 12 }}>
                    <UploadButton />
                  </div>
                </>
              ) : (
                <Heading level={4} style={{ margin: 0 }}>
                  {profile.name}
                </Heading>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* 2 · Connected profiles */}
      <ProfilesSection />

      {/* 3 · About (elevator pitch + positioning) */}
      <Section title="About your business">
        {(editing) =>
          editing ? (
            <>
              <FieldLabel>Elevator pitch</FieldLabel>
              <Textarea value={profile.elevatorPitch} onChange={(v) => updateProfile({ elevatorPitch: v })} minHeight={120} />
              <div style={{ marginTop: 16 }}>
                <FieldLabel>Positioning</FieldLabel>
                <PositionEdit label="Primary" value={profile.positioningPrimary} onChange={(v) => updateProfile({ positioningPrimary: v })} />
              </div>
            </>
          ) : (
            <>
              <Text variant="primary" style={{ display: 'block', color: 'var(--dark-80)', lineHeight: 1.55, fontSize: 14, marginBottom: 14 }}>
                {profile.elevatorPitch}
              </Text>
              <PositionLine label="Positioning" text={profile.positioningPrimary} last />
            </>
          )
        }
      </Section>

      {/* 4 · Marketing goal */}
      <Section title="Marketing goal">
        {(editing) => (editing ? <Textarea value={goal} onChange={setGoal} minHeight={100} /> : <Markdownish text={goal} />)}
      </Section>

      {/* 5 · Customer segments */}
      <Section title="Customer segments">
        {(editing) => (editing ? <Textarea value={segments} onChange={setSegments} minHeight={140} /> : <Markdownish text={segments} />)}
      </Section>

      {/* 6 · Services & products */}
      <Section title="Services & products">
        {(editing) => (editing ? <Textarea value={services} onChange={setServices} minHeight={120} /> : <Markdownish text={services} />)}
      </Section>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 4,
        }}
      >
        <button type="button" onClick={back} style={{ background: 'transparent', border: 'none', fontFamily: 'inherit', fontSize: 14, color: 'var(--dark-90)', cursor: 'pointer', padding: '8px 12px' }}>
          Back
        </button>
        <Button variant="primary" size="lg" onPress={next}>
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── Section wrapper (H3 header + tertiary Edit toggle) ───────────────────────

function Section({ title, first, children }: { title: string; first?: boolean; children: (editing: boolean) => ReactNode }) {
  const [editing, setEditing] = useState(false);
  return (
    <section style={{ padding: '20px 0', borderTop: first ? 'none' : '1px solid var(--dark-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, minHeight: 32 }}>
        <Heading level={3} style={{ margin: 0, fontSize: 18 }}>
          {title}
        </Heading>
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" size="sm" frontIcon={Edit1} onPress={() => setEditing((e) => !e)}>
            {editing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>
      {children(editing)}
    </section>
  );
}

/** Renders a brand-context value with **bold** + `- ` bullets as read-only. */
function Markdownish({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => {
        const bullet = line.trim().startsWith('- ');
        const body = (bullet ? line.trim().slice(2) : line.trim()).replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:500;color:var(--dark-90)">$1</strong>');
        return (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {bullet && <span aria-hidden style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--dark-40)', marginTop: 9, flexShrink: 0 }} />}
            <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--dark-80)' }} dangerouslySetInnerHTML={{ __html: body }} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Connected profiles (GBP, socials, reviews — all icon-prefixed) ──────────

const SOCIALS = [
  { key: 'ig', icon: Instagram, placeholder: 'Instagram', initial: '@certapro_austin' },
  { key: 'fb', icon: Facebook, placeholder: 'Facebook', initial: 'CertaProAustin' },
  { key: 'tt', icon: TikTok, placeholder: 'TikTok', initial: '' },
  { key: 'li', icon: LinkedIn, placeholder: 'LinkedIn', initial: 'certapro-painters-austin' },
] as const;

function ProfilesSection() {
  const [gbp, setGbp] = useState('CertaPro Painters of Austin — Austin, TX');
  const [handles, setHandles] = useState<Record<string, string>>(() => Object.fromEntries(SOCIALS.map((s) => [s.key, s.initial])));
  const [gReviews, setGReviews] = useState('auto-detect from GBP');
  const [oReviews, setOReviews] = useState('Yelp, Angi, HomeAdvisor');
  const set = (key: string, v: string) => setHandles((h) => ({ ...h, [key]: v }));

  return (
    <Section title="Connected profiles">
      {(editing) =>
        editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <FieldLabel>Google Business Profile</FieldLabel>
              <IconInput icon={Google} value={gbp} onChange={setGbp} />
            </div>
            <div>
              <FieldLabel>Social handles</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {SOCIALS.map((s) => (
                  <IconInput key={s.key} icon={s.icon} placeholder={s.placeholder} value={handles[s.key]} onChange={(v) => set(s.key, v)} />
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Review profiles</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <IconInput icon={Google} placeholder="Google reviews" value={gReviews} onChange={setGReviews} />
                <IconInput icon={Star} placeholder="Yelp / Angi / vertical" value={oReviews} onChange={setOReviews} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Inline icon={Google}>{gbp}</Inline>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {SOCIALS.map((s) => (
                <Inline key={s.key} icon={s.icon} muted={!handles[s.key]}>
                  {handles[s.key] || `Add ${s.placeholder}`}
                </Inline>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Inline icon={Google}>{gReviews}</Inline>
              <Inline icon={Star}>{oReviews}</Inline>
            </div>
          </div>
        )
      }
    </Section>
  );
}

function Inline({ icon: Icon, children, muted }: { icon: typeof Instagram; children: ReactNode; muted?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: muted ? 'var(--dark-40)' : 'var(--dark-80)', fontSize: 14 }}>
      <Icon size={18} color="var(--dark-60)" />
      {children}
    </span>
  );
}

function IconInput({ icon: Icon, placeholder, value, onChange }: { icon: typeof Instagram; placeholder?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', pointerEvents: 'none' }}>
        <Icon size={18} color="var(--dark-60)" />
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...profileInputStyle, paddingLeft: 38 }} />
    </div>
  );
}

// ─── Small building blocks ────────────────────────────────────────────────────

function LogoBox() {
  return (
    <div
      style={{
        width: 200,
        height: 88,
        border: '1px solid var(--dark-8)',
        borderRadius: 10,
        background: 'var(--light-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Times New Roman", Georgia, serif',
        fontSize: 24,
        letterSpacing: '0.06em',
        color: 'var(--dark-90)',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      CertaPro
    </div>
  );
}

function UploadButton() {
  return (
    <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: 'var(--dark-90)', cursor: 'pointer' }}>
      <Upload size={14} color="var(--dark-90)" />
      Upload Logo kit
    </button>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Text variant="smallList" style={{ display: 'block', color: 'var(--dark-90)', fontWeight: 500, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

const profileInputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  letterSpacing: '0.28px',
  fontFamily: 'inherit',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 10,
  color: 'var(--dark-90)',
  outline: 'none',
  boxSizing: 'border-box',
};

function TextInput({ value, onChange, style }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; style?: CSSProperties }) {
  return <input type="text" value={value} onChange={onChange} style={{ ...profileInputStyle, fontSize: 16, letterSpacing: '0.32px', ...style }} />;
}

function Textarea({ value, onChange, minHeight = 120 }: { value: string; onChange: (v: string) => void; minHeight?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ ...profileInputStyle, minHeight, lineHeight: 1.55, resize: 'vertical' }} />;
}

function PositionLine({ label, text, last }: { label: string; text: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '3px 0', marginBottom: last ? 0 : 6 }}>
      <span aria-hidden style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--dark-90)', marginTop: 9, flexShrink: 0 }} />
      <Text variant="primary" style={{ color: 'var(--dark-90)', lineHeight: 1.55, fontSize: 14 }}>
        <strong style={{ fontWeight: 500 }}>{label}:</strong> {text}
      </Text>
    </div>
  );
}

function PositionEdit({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Text variant="metadata" style={{ display: 'block', color: 'var(--dark-60)', fontSize: 12, marginBottom: 4 }}>
        {label}
      </Text>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={profileInputStyle} />
    </div>
  );
}
