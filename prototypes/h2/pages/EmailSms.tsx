import { useToast } from '@/staging';

/**
 * /h2/email-sms — port of Blaze H2 Features/email&sms.html (program hub).
 *
 * Source has a hub with 4 tiles + sections (Active / Drafts / Agent-suggested
 * / Coming soon) of program cards, plus a per-program detail view with a
 * sequence builder and activity feed.
 *
 * NOT yet wired (TODO follow-ups):
 *  - "Agent-suggested" + "Coming soon" sections
 *  - Per-program detail view
 *  - New-program modal
 */

interface Program {
  status: 'live' | 'draft';
  channels: ('email' | 'sms')[];
  stage: string;
  name: string;
  desc: string;
  attention: string;
  stats: { k: string; v: string }[];
}

const ACTIVE: Program[] = [
  {
    status: 'live', channels: ['email', 'sms'],
    stage: 'Acquisition → First purchase',
    name: 'Welcome Stack',
    desc: 'Post-signup nurture — turn a fresh email signup into a confirmed first order across email and SMS.',
    attention: '✦ 3 agent proposals waiting',
    stats: [
      { k: 'Recipients · 28d', v: '1,356' },
      { k: 'First orders', v: '184' },
      { k: 'Conversion', v: '13.6%' },
      { k: 'Active tests', v: '2' },
    ],
  },
];

const DRAFTS: Program[] = [
  {
    status: 'draft', channels: ['email', 'sms'],
    stage: 'Order → 24h after',
    name: 'Order Confirmation',
    desc: 'The first 24 hours after an order is placed — confirmation, shipping ETA, what to expect on delivery day.',
    attention: 'Approve to activate',
    stats: [
      { k: 'Drafted steps', v: '4' },
      { k: 'Estimated reach', v: '~480/wk' },
      { k: 'Strategy', v: 'Ready' },
      { k: 'Approval', v: 'Awaiting' },
    ],
  },
  {
    status: 'draft', channels: ['email', 'sms'],
    stage: '3 days before refill',
    name: 'Refill Reminder',
    desc: "Three days before a customer's bottle runs out — a friendly nudge with one-tap reorder, plus stock + auto-renewal toggles.",
    attention: 'Approve to activate',
    stats: [
      { k: 'Drafted steps', v: '3' },
      { k: 'Estimated reach', v: '~210/wk' },
      { k: 'Strategy', v: 'Ready' },
      { k: 'Approval', v: 'Awaiting' },
    ],
  },
];

const STATUS_PILL = {
  live: { bg: 'rgba(32,161,79,0.12)', color: '#0E6B33' },
  draft: { bg: 'rgba(0,0,0,0.05)', color: 'var(--dark-60)' },
};

function ChannelIcon({ kind }: { kind: 'email' | 'sms' }) {
  if (kind === 'email') {
    return (
      <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 5, background: '#E0EAFD', color: '#1A56C8', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="m3 8 9 6 9-6" />
        </svg>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', width: 22, height: 22, borderRadius: 5, background: '#FCE7F3', color: '#9D174D', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12c0 4-4 7-9 7-1.4 0-2.7-.2-3.9-.7L3 20l1.5-4.3A6.6 6.6 0 0 1 3 12c0-4 4-7 9-7s9 3 9 7z" />
      </svg>
    </span>
  );
}

function ProgramCard({ p, onOpen }: { p: Program; onOpen: () => void }) {
  const sp = STATUS_PILL[p.status];
  return (
    <div
      onClick={onOpen}
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 14,
        padding: '18px 20px',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 5,
                fontSize: 11.5,
                fontWeight: 500,
                background: sp.bg,
                color: sp.color,
                textTransform: 'capitalize',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
              {p.status}
            </span>
            {p.channels.map((c) => <ChannelIcon key={c} kind={c} />)}
            <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{p.stage}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6 }}>{p.name}</div>
          <div style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.5, marginBottom: 10 }}>{p.desc}</div>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: 5,
              fontSize: 11.5,
              background: '#FFE9A8',
              color: '#7B5B00',
            }}
          >
            {p.attention}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--dark-60)', fontSize: 12 }}>
          Open ›
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--dark-8)',
        }}
      >
        {p.stats.map((s) => (
          <div key={s.k}>
            <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 4 }}>{s.k}</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)' }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmailSms() {
  const { showToast } = useToast();
  return (
    <div style={{ padding: '20px 28px 60px', maxWidth: 1180, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 500, color: 'var(--dark-90)', margin: '0 0 8px', lineHeight: 1.3 }}>
        Every moment in the customer journey, owned by the agent.
      </h2>

      {/* Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, margin: '20px 0' }}>
        {[
          { label: 'Live programs', value: '1', sub: 'Welcome Stack' },
          { label: 'In draft', value: '2', sub: 'Awaiting your review' },
          { label: 'Agent-suggested', value: '3', sub: 'Based on your data' },
          { label: 'Customers reached · 28d', value: '1,356', sub: 'across all programs', dark: true },
        ].map((t, i) => (
          <div
            key={i}
            style={{
              background: t.dark ? 'var(--dark-90)' : 'var(--light-100)',
              color: t.dark ? 'var(--light-100)' : 'var(--dark-90)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>{t.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>{t.value}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{t.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Active</h3>
        <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>Running right now</div>
      </div>
      {ACTIVE.map((p) => (
        <ProgramCard key={p.name} p={p} onOpen={() => showToast({ message: `Open ${p.name}` })} />
      ))}

      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>Drafts · awaiting your review</h3>
        <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>Strategy is written. Approve to activate.</div>
      </div>
      {DRAFTS.map((p) => (
        <ProgramCard key={p.name} p={p} onOpen={() => showToast({ message: `Open ${p.name}` })} />
      ))}
    </div>
  );
}
