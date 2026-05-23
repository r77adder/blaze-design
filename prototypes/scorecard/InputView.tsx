import { Button, Heading, Paragraph, Text } from '@/components';

interface InputViewProps {
  onRun: () => void;
}

// section: field — reusable labeled row
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <Text variant="metadata" color="var(--dark-60)">{label}</Text>
        {hint && (
          <Text variant="metadata" color="var(--dark-40)" style={{ textTransform: 'none', letterSpacing: 0 }}>
            {hint}
          </Text>
        )}
      </div>
      {children}
    </div>
  );
}

// Inline input — no lib Input component yet; logged in GAPS.md
function Input({ placeholder, defaultValue, type = 'text' }: { placeholder?: string; defaultValue?: string; type?: string }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 14px',
        border: '1px solid var(--dark-15)',
        borderRadius: 8,
        background: 'var(--light-100)',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}

export function InputView({ onRun }: InputViewProps) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>

      {/* section: eyebrow */}
      <Text
        variant="metadata"
        color="var(--purple)"
        style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 16 }}
      >
        Free in 60 seconds · No login required
      </Text>

      {/* section: hero */}
      <Heading level={1} style={{ fontSize: 44, letterSpacing: '-0.02em', lineHeight: 1.05, margin: '0 0 16px' }}>
        See exactly where your marketing is leaving money on the table.
      </Heading>
      <Paragraph style={{ fontSize: 17, color: 'var(--dark-60)', margin: '0 0 36px', maxWidth: 560 }}>
        Blaze scans your website, social, ads, and reviews — then scores how you stack up against your local competitors. A real marketing strategist reviews every result.
      </Paragraph>

      {/* section: form */}
      <div style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: 28,
      }}>
        <Field label="Your website" hint="(required)">
          <Input defaultValue="https://certapro.com/austin/" />
        </Field>

        <Field label="Google Business Profile" hint="(business name + city works)">
          <Input defaultValue="CertaPro Painters of Austin — Austin, TX" />
        </Field>

        <Field label="Social handles" hint="(any platforms you use)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <Input placeholder="Instagram" defaultValue="@certapro_austin" />
            <Input placeholder="Facebook" defaultValue="CertaProPaintersAustin" />
            <Input placeholder="TikTok" />
            <Input placeholder="LinkedIn" defaultValue="certapro-austin" />
          </div>
        </Field>

        <Field label="Review profiles" hint="(URLs or platform names)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input placeholder="Google reviews URL" defaultValue="auto-detect from GBP" />
            <Input placeholder="Yelp / BBB / vertical-specific" defaultValue="Yelp, BBB" />
          </div>
        </Field>

        <div style={{ marginTop: 28, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button variant="primary" size="lg" onPress={onRun}>Run my scorecard →</Button>
          <Text variant="label" color="var(--dark-40)">
            Takes ~45 seconds. Your data isn't stored unless you save it.
          </Text>
        </div>
      </div>
    </div>
  );
}
