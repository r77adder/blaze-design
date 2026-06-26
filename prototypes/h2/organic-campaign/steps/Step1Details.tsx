import { Heading, Text } from '@/components';
import { useFirstCampaign } from '../first-campaign-context';
import Refresh01 from '@/icons/20/Refresh01';

/** Step 1 — Campaign details form. */
export function Step1Details() {
  const { data, setData } = useFirstCampaign();
  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '24px auto 0' }}>
      <Heading level={2} style={{ marginBottom: 8, fontSize: 32 }}>
        Here&rsquo;s your first campaign details
      </Heading>
      <Text variant="secondary">
        You can think of these as what directs the main subject and target of the
        content Blaze generates.
      </Text>

      <div
        style={{
          height: 1,
          background: 'var(--dark-8)',
          margin: '28px 0',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Campaign Name">
          <input
            type="text"
            value={data.name}
            onChange={(e) =>
              setData((p) => ({ ...p, name: e.target.value }))
            }
            style={inputStyle}
          />
        </Field>

        <Field label="Theme">
          <textarea
            value={data.theme}
            onChange={(e) =>
              setData((p) => ({ ...p, theme: e.target.value }))
            }
            rows={4}
            style={{
              ...inputStyle,
              minHeight: 110,
              padding: 14,
              resize: 'vertical',
              lineHeight: 1.55,
            }}
          />
          <button
            type="button"
            onClick={() =>
              setData((p) => ({
                ...p,
                theme:
                  'Sharing the texture of doing the work — sketches, drafts, false-starts, lessons-learned. Building a brand around creative transparency, not just polished final results.',
              }))
            }
            style={tryDirectionStyle}
          >
            <Refresh01 size={14} />
            <span>Try a different direction</span>
          </button>
        </Field>

        <Field
          label={
            <>
              Call-to-Action{' '}
              <span style={{ color: 'var(--dark-60)' }}>(optional)</span>
            </>
          }
        >
          <input
            type="text"
            value={data.cta}
            placeholder="e.g. Book a free consultation"
            onChange={(e) => setData((p) => ({ ...p, cta: e.target.value }))}
            style={inputStyle}
          />
        </Field>

        <Field
          label={
            <>
              Target Link{' '}
              <span style={{ color: 'var(--dark-60)' }}>(optional)</span>
            </>
          }
        >
          <input
            type="text"
            value={data.link}
            placeholder="https://"
            onChange={(e) => setData((p) => ({ ...p, link: e.target.value }))}
            style={inputStyle}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          letterSpacing: '0.24px',
          color: 'var(--dark-90)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 8,
  fontFamily: "'Sohne', sans-serif",
  fontSize: 14,
  letterSpacing: '0.28px',
  color: 'var(--dark-90)',
  outline: 'none',
};

const tryDirectionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'flex-start',
  background: 'transparent',
  border: 'none',
  padding: '4px 0',
  marginTop: 4,
  color: 'var(--dark-60)',
  fontFamily: 'inherit',
  fontSize: 14,
  cursor: 'pointer',
};
