import { useMemo, type ReactNode } from 'react';
import { Heading, Text, Button } from '@/components';
import { Card, StatusPill } from '@/staging';
import type { Account, ScoreStatus } from './lib/types';
import * as S from './lib/strategy';
import { useReview, reviewSections, type Phase, type ItemStatus } from './lib/review';
import type { Go } from './nav';
import { TextArea, gradientFor } from './ui';

const PHASE_TITLE: Record<Phase, string> = { strategy: 'strategy', creative: 'creative' };

/* ─── Client side: per-phase guided review (mirrors the AM setup) ────────── */
export function ClientReview({ account, phase }: { account: Account; phase: Phase }) {
  const { packet, feedback, setItem, submit } = useReview();
  const status = packet(phase);
  const fb = feedback(phase);
  const sections = reviewSections(phase);
  const reviewed = sections.filter((s) => fb[s.id] && fb[s.id].status !== 'pending').length;

  if (status === 'draft') {
    return <Empty title="This review isn't ready yet" body={`${account.am.name} is still putting the ${PHASE_TITLE[phase]} together. You'll get a link as soon as it's ready.`} />;
  }
  if (status === 'submitted') {
    const changes = sections.filter((s) => fb[s.id]?.status === 'changes').length;
    return <Empty tone="positive" title="Thanks — feedback sent" body={changes > 0 ? `We shared ${changes} change request${changes === 1 ? '' : 's'} with the team. ${account.am.name} will follow up with the next version.` : `Everything's approved and sent to ${account.am.name}.`} />;
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <Heading level={2} style={{ marginTop: 0 }}>{phase === 'strategy' ? 'Review your strategy' : 'Review your first creative'}</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '6px 0 20px', lineHeight: 1.6 }}>
        {account.am.name} put this together for {account.name}. Approve what looks right, or request changes with a note — it goes straight back to the team.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((sec) => {
          const f = fb[sec.id] ?? { status: 'pending' as ItemStatus, comment: '' };
          return (
            <Card key={sec.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{sec.title}</Text>
                  <Text variant="secondary" color="var(--dark-60)">{sec.blurb}</Text>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Pick on={f.status === 'approved'} tone="positive" onClick={() => setItem(phase, sec.id, { status: f.status === 'approved' ? 'pending' : 'approved' })}>✓ Approve</Pick>
                  <Pick on={f.status === 'changes'} tone="negative" onClick={() => setItem(phase, sec.id, { status: f.status === 'changes' ? 'pending' : 'changes' })}>✎ Request changes</Pick>
                </div>
              </div>
              <SectionContent account={account} id={sec.id} />
              {f.status === 'changes' && (
                <TextArea autoFocus value={f.comment} placeholder="What would you like changed?" onChange={(e) => setItem(phase, sec.id, { comment: e.target.value })} style={{ marginTop: 12, minHeight: 60 }} />
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ position: 'sticky', bottom: 0, marginTop: 32, padding: '16px 0', borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', boxShadow: '0 -6px 14px -10px rgba(15,23,42,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Text variant="secondary" color="var(--dark-60)">{reviewed} of {sections.length} reviewed</Text>
        <Button size="lg" onPress={() => submit(phase)}>Submit feedback</Button>
      </div>
    </div>
  );
}

/* Read-only renderings of the AM setup, one per review section. */
function SectionContent({ account, id }: { account: Account; id: string }) {
  if (id === 'brand') return <BrandRead account={account} />;
  if (id === 'guidelines') return <GuidelinesRead account={account} />;
  if (id === 'scorecard') return <ScorecardRead account={account} />;
  if (id === 'goals') return <GoalsRead account={account} />;
  if (id === 'storyboard') return <StoryboardRead account={account} />;
  if (id === 'calendar') return <CalendarRead account={account} />;
  return null;
}

function BrandRead({ account }: { account: Account }) {
  const g = S.creativeGuidelines(account);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {account.brand.colors.map((c, i) => (
          <div key={i} style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, borderRadius: 8, background: c.hex, border: '1px solid var(--dark-8)' }} /><Text variant="metadata" color="var(--dark-60)" style={{ display: 'block', marginTop: 4 }}>{c.name}</Text></div>
        ))}
      </div>
      <Text variant="secondary" color="var(--dark-80)"><strong>Fonts:</strong> {account.brand.fonts.map((f) => f.family).filter(Boolean).join(', ') || '—'}</Text>
      <Text variant="secondary" color="var(--dark-80)"><strong>Voice:</strong> {g.toneSummary}</Text>
    </div>
  );
}

function GuidelinesRead({ account }: { account: Account }) {
  const g = S.creativeGuidelines(account);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{g.taglines.map((t, i) => <span key={i} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--dark-3)', fontSize: 14, color: 'var(--dark-90)' }}>{t}</span>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>{g.toneExamples.map((e, i) => <Text key={i} style={{ display: 'block', marginBottom: 4, color: 'var(--dark-90)' }}><span style={{ color: 'var(--positive-60)', fontWeight: 700 }}>✓</span> {e.do}</Text>)}</div>
        <div>{g.toneExamples.map((e, i) => <Text key={i} style={{ display: 'block', marginBottom: 4, color: 'var(--dark-90)' }}><span style={{ color: 'var(--negative-60)', fontWeight: 700 }}>✕</span> {e.dont}</Text>)}</div>
      </div>
    </div>
  );
}

function statusColor(s: ScoreStatus) { return s === 'bad' ? 'var(--red-70)' : s === 'warn' ? 'var(--status-review)' : 'var(--status-approved)'; }
function ScorecardRead({ account }: { account: Account }) {
  const data = S.scorecard(account);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
      {data.areas.map((a) => (
        <div key={a.number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--dark-2)', border: '1px solid var(--dark-6)' }}>
          <span style={{ width: 36, height: 36, borderRadius: 99, border: `3px solid ${statusColor(a.status)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{a.score}</span>
          <div style={{ flex: 1 }}><Text variant="smallList" color="var(--dark-90)" style={{ display: 'block' }}>{a.eyebrow}</Text><Text variant="metadata" color="var(--dark-60)">{a.score}/{a.maxScore}</Text></div>
        </div>
      ))}
    </div>
  );
}

function GoalsRead({ account }: { account: Account }) {
  const g = S.goals(account);
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {([['First 30 days', g.thirty], ['By 60 days', g.sixty], ['By 90 days', g.ninety]] as const).map(([label, v]) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}><Text variant="largeList" color="var(--dark-90)">{label}</Text><Text color="var(--dark-80)">{v}</Text></div>
      ))}
      <div style={{ marginTop: 4, padding: 12, borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-8)' }}>
        <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block' }}>First campaign</Text>
        <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{theme.title}</Text>
        <Text variant="secondary" color="var(--dark-60)">{theme.angle}</Text>
      </div>
    </div>
  );
}

function StoryboardRead({ account }: { account: Account }) {
  const theme = (S.campaignThemes(account).find((t) => t.recommended) ?? S.campaignThemes(account)[0]).title;
  const assets = useMemo(() => S.generatedAssets(account, theme).slice(0, 6), [account, theme]);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
      {assets.map((a) => {
        const textOnly = a.type === 'Blog Post' || a.type === 'Email';
        return (
          <div key={a.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--dark-6)' }}>
            <div style={{ height: 96, background: textOnly ? 'var(--dark-3)' : gradientFor(a.seed), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}><Text style={{ color: textOnly ? 'var(--dark-40)' : 'var(--light-100)', fontWeight: 600, fontSize: 12, textAlign: 'center' }}>{textOnly ? a.type : a.overlay}</Text></div>
            <div style={{ padding: 8 }}><Text variant="metadata" color="var(--dark-80)" lineClamp={2}>{a.caption}</Text></div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarRead({ account }: { account: Account }) {
  const themes = useMemo(() => S.seasonalThemes(account).slice(0, 5), [account]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {themes.map((w, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <Text variant="metadata" color="var(--dark-60)" style={{ width: 64, flexShrink: 0 }}>Wk {w.week}</Text>
          <Text variant="largeList" color="var(--dark-90)">{w.title}</Text>
          <StatusPill tone="neutral">{w.season}</StatusPill>
        </div>
      ))}
    </div>
  );
}

function Pick({ on, tone, onClick, children }: { on: boolean; tone: 'positive' | 'negative'; onClick: () => void; children: ReactNode }) {
  const c = tone === 'positive' ? 'var(--positive-60)' : 'var(--negative-60)';
  const bg = tone === 'positive' ? 'var(--positive-10)' : 'var(--negative-10)';
  return <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', background: on ? bg : 'var(--light-100)', color: on ? c : 'var(--dark-60)', border: on ? 'none' : '1px solid var(--dark-8)' }}>{children}</button>;
}

function Empty({ title, body, tone }: { title: string; body: string; tone?: 'positive' }) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
      <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 99, background: tone ? 'var(--positive-10)' : 'var(--dark-3)', color: tone ? 'var(--positive-60)' : 'var(--dark-40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{tone ? '✓' : '⏳'}</div>
      <Heading level={3} style={{ marginTop: 0 }}>{title}</Heading>
      <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', lineHeight: 1.6 }}>{body}</Text>
    </div>
  );
}

/* ─── AM side: per-phase share + feedback, embedded in the phase done screen ─ */
export function AmReviewPanel({ account, phase, go }: { account: Account; phase: Phase; go: Go }) {
  const { packet, share, reset, feedback, resolve } = useReview();
  const status = packet(phase);
  const fb = feedback(phase);
  const sections = reviewSections(phase);
  const approved = sections.filter((s) => fb[s.id]?.status === 'approved');
  const changes = sections.filter((s) => fb[s.id]?.status === 'changes');
  const link = `blaze.ai/r/${account.id}-${phase}`;
  const clientSection = phase === 'strategy' ? 'review-strategy' : 'review-creative';

  return (
    <Card style={{ textAlign: 'left' }}>
      {status === 'draft' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>Share this {PHASE_TITLE[phase]} with the client</Text>
            <Text variant="metadata" color="var(--dark-60)">Send {account.poc.name} a link to approve or request changes.</Text>
          </div>
          <Button size="lg" onPress={() => share(phase)}>Share for review</Button>
        </div>
      )}
      {status === 'shared' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <StatusPill tone="warning">Awaiting client</StatusPill>
            <Text variant="largeList" color="var(--dark-90)" style={{ display: 'block', marginTop: 6 }}>Link sent to {account.poc.email}</Text>
            <code style={{ fontSize: 13, color: 'var(--action-50)' }}>{link}</code>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="secondary" onPress={() => go(`/${account.id}/client/${clientSection}`)}>Preview as client</Button>
            <Button size="sm" variant="ghost" onPress={() => reset(phase)}>Unshare</Button>
          </div>
        </div>
      )}
      {status === 'submitted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <StatusPill tone="success">{approved.length} approved</StatusPill>
            <StatusPill tone={changes.length ? 'danger' : 'neutral'}>{changes.length} changes requested</StatusPill>
            <div style={{ flex: 1 }} />
            <Button size="sm" variant="ghost" onPress={() => reset(phase)}>Reset</Button>
          </div>
          {changes.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 10, background: 'var(--light-100)', border: '1px solid var(--dark-6)' }}>
              <div style={{ flex: 1 }}><Text variant="largeList" color="var(--dark-90)" style={{ display: 'block' }}>{s.title}</Text><Text variant="secondary" color="var(--dark-60)">💬 {fb[s.id]?.comment || 'Requested changes'}</Text></div>
              <Button size="sm" variant="secondary" onPress={() => resolve(phase, s.id)}>Mark resolved</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
