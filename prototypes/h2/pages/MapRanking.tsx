import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Heading, IconButton, Text } from '@/components';
import { useToast } from '@/staging';
import ArrowRightSm from '@/icons/16/ArrowRightSm';
import Check from '@/icons/16/Check';
import X02 from '@/icons/16/X02';
import Camera1 from '@/icons/20/Camera1';
import Clock1 from '@/icons/20/Clock1';
import Document from '@/icons/20/Document';
import EyeOpen from '@/icons/20/EyeOpen';
import Lightning from '@/icons/20/Lightning';
import List from '@/icons/20/List';
import Marker03 from '@/icons/20/Marker03';
import MessageChat01 from '@/icons/20/MessageChat01';
import Send1 from '@/icons/20/Send1';
import ShieldChecked from '@/icons/20/ShieldChecked';
import Star from '@/icons/20/Star';
import Stars from '@/icons/20/Stars';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';
import type { Icon } from '@/components';

/**
 * /h2/map-ranking — deep port of `~/dev/Blaze H2 Features/map-ranking.html`.
 *
 * Five views gated on a localStorage flag:
 *   1. audit   — connected pill, business card, animated SVG score ring,
 *                gap list, sell-strip, "Fix these for me" CTA.
 *   2. loading — orb + sequenced step list (700ms apart) auto-advances.
 *   3. review  — 3 grouped summary blocks + trust strip + "Confirm & go live".
 *   4. live    — congrats screen, auto-advances to home (1.7s).
 *   5. home    — steady state: metric cards, dismissable action card,
 *                competitor ladder, recent activity, profile strength,
 *                month-at-a-glance.
 *
 * On mount: if localStorage[STORAGE_KEY] is set, jumps straight to 'home'.
 * Otherwise renders 'audit'. Designers can replay the setup via the
 * `?reset=1` query param OR the "Reset setup" pill in the bottom-right.
 *
 * Topbar action:
 *   - 'home' view → "View on Google" (toast).
 *   - Setup views (audit/loading/review/live) → no topbar action.
 */

const STORAGE_KEY = 'h2-map-ranking:setup-complete';

type View = 'audit' | 'loading' | 'review' | 'live' | 'home';

// ─── DATA ─────────────────────────────────────────────────────────────

const AUDIT_GAPS: { icon: Icon; t: string; s: string }[] = [
  { icon: Camera1, t: 'Add 5+ recent job photos', s: 'Profiles with photos see 35% more views in the Map Pack.' },
  { icon: List, t: 'List your services', s: "Customers can't find you for searches like 'roof repair near me' yet." },
  { icon: Marker03, t: 'Define your service area', s: "We'll add the cities you actually drive to." },
  { icon: Clock1, t: 'Confirm hours of operation', s: "Currently showing 'closed' on weekends." },
];

const LOADING_STEPS: { icon: Icon; t: string }[] = [
  { icon: List, t: 'Reading your current profile' },
  { icon: EyeOpen, t: 'Scanning the top 5 competitors in Austin' },
  { icon: Stars, t: 'Drafting services, hours and description' },
  { icon: Send1, t: 'Planning your first month of Google Posts' },
  { icon: ShieldChecked, t: 'Running compliance checks for residential contractors' },
];

const SUMMARY_BLOCKS: { section: string; items: { icon: Icon; t: string; s: string }[] }[] = [
  {
    section: 'Profile',
    items: [
      { icon: List, t: 'Services list rewritten', s: '5 most-searched services surfaced first — Roof Repair, Storm Damage, Insurance Claims, Roof Replacement, Inspections.' },
      { icon: Document, t: 'Description drafted', s: '138 words, professional tone. Highlights your 25-year workmanship warranty and Austin focus.' },
      { icon: Clock1, t: 'Hours confirmed', s: 'Mon–Fri 7 AM–6 PM · Sat 8 AM–1 PM. Memorial Day flagged for review.' },
      { icon: Marker03, t: 'Service area expanded', s: 'Austin, Round Rock, Cedar Park, 78704, 78745.' },
    ],
  },
  {
    section: 'Content',
    items: [
      { icon: Send1, t: 'First 4 Google Posts drafted', s: 'Storm prep checklist, behind-the-scenes tear-off, customer story, material spotlight — one a week.' },
      { icon: Camera1, t: 'Brand colors + logo applied', s: "We'll use your green & gold on posts until you upload real job photos." },
    ],
  },
  {
    section: 'Ongoing',
    items: [
      { icon: Star, t: 'Review monitoring on', s: "We'll draft replies to every new review and notify you for approval." },
      { icon: MessageChat01, t: 'Q&A drafts ready', s: '3 common customer questions answered, waiting for your sign-off.' },
      { icon: ShieldChecked, t: 'Compliance guardrails', s: "Phrases like 'guaranteed' and 'best price' are auto-flagged for residential contractors." },
    ],
  },
];

const COMPETITORS = [
  { rank: 1, name: 'Texas Star Roofing', reviews: 144, recent: '+4 this month', you: false },
  { rank: 2, name: 'Apex Roofing (you)', reviews: 31, recent: '+5 this month', you: true },
  { rank: 3, name: 'Lone Star Roofing Pro', reviews: 99, recent: '+1 this month', you: false },
  { rank: 4, name: 'Hill Country Roofs', reviews: 68, recent: '+1 this month', you: false },
];

const ACTIVITY: { icon: Icon; kind: 'success' | 'info' | ''; t: string; s: string; time: string }[] = [
  { icon: Star, kind: 'success', t: 'New 5-star review from Daniel K.', s: '"Crew was on time and cleaned up perfectly. Highly recommend."', time: '2h ago' },
  { icon: Send1, kind: 'info', t: 'Post published to Google', s: 'Storm prep checklist · 47 views in the first hour', time: 'Yesterday' },
  { icon: MessageChat01, kind: 'info', t: 'Replied to a 4-star review', s: 'Drafted by Blaze · Approved by you · Published', time: 'Yesterday' },
  { icon: Clock1, kind: '', t: 'Profile update: hours confirmed', s: 'Saturday hours updated to 8 AM – 1 PM', time: 'Sat' },
  { icon: Star, kind: 'success', t: 'New 5-star review from Janelle B.', s: '"They handled the insurance claim end to end. Stress-free."', time: 'Apr 18' },
  { icon: Send1, kind: 'info', t: 'Post published to Google', s: 'Behind the scenes — South Austin tear-off', time: 'Apr 16' },
];

const IMPROVE_LIST: { icon: Icon; t: string; s: string; toast: string }[] = [
  { icon: Camera1, t: 'Add 5+ recent job photos', s: 'Biggest single boost · +12% to score', toast: 'Photo upload opened' },
  { icon: MessageChat01, t: 'Answer 3 customer questions', s: 'Drafts ready · 1-min review', toast: 'Q&A drafted — tap to review' },
  { icon: Clock1, t: 'Add holiday hours for Memorial Day', s: 'Coming up in 4 weeks', toast: 'Holiday hours added' },
];

// Mini ring used in the home "Profile strength" card (no animation).
function MiniRing({ score, size = 72, stroke = 6 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const ringColor =
    score < 50 ? '#EF6800' : score < 80 ? 'var(--dark-90)' : 'var(--status-approved)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--dark-6)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 500,
          color: 'var(--dark-90)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {score}
      </div>
    </div>
  );
}

// ─── SETUP STEPS ──────────────────────────────────────────────────────

function AuditStep({ onNext }: { onNext: () => void }) {
  const completeness = 36;
  const fixesPending = AUDIT_GAPS.length;
  return (
    <>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 28px 140px' }}>
        {/* section: header — business + inline progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background:
                "center/cover url('https://images.unsplash.com/photo-1605045174877-cf9d8c1b69cd?w=200&q=70'), #2A3F2C",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <Heading level={2} style={{ marginBottom: 2 }}>
              Apex Roofing &amp; Restoration
            </Heading>
            <Text variant="secondary">Roofing contractor · Austin, TX · 23 reviews</Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Text variant="primary" style={{ fontWeight: 500 }}>
            {completeness}% complete
          </Text>
          <Text variant="secondary">·</Text>
          <Text variant="secondary">
            {fixesPending} {fixesPending === 1 ? 'fix' : 'fixes'} pending
          </Text>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: 'var(--dark-8)',
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: `${completeness}%`,
              height: '100%',
              background: 'var(--dark-90)',
              borderRadius: 999,
            }}
          />
        </div>

        {/* section: recommended fixes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingBottom: 12,
            borderBottom: '1px solid var(--dark-8)',
            marginBottom: 4,
          }}
        >
          <Heading level={3}>Recommended fixes</Heading>
          <Text variant="metadata">Drafted by the agent</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {AUDIT_GAPS.map((g, i) => {
            const Ic = g.icon;
            return (
              <div
                key={g.t}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '16px 0',
                  borderBottom: i < AUDIT_GAPS.length - 1 ? '1px solid var(--dark-4)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--dark-4)',
                    color: 'var(--dark-80)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Ic size={16} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Heading level={3} style={{ marginBottom: 4 }}>
                    {g.t}
                  </Heading>
                  <Text variant="secondary">{g.s}</Text>
                </div>
              </div>
            );
          })}
        </div>

        {/* section: outcome strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px 20px',
            padding: '16px 0',
            marginTop: 12,
            borderTop: '1px solid var(--dark-8)',
            borderBottom: '1px solid var(--dark-8)',
          }}
        >
          {[
            { num: '+38%', label: 'map visibility' },
            { num: '~5 min', label: 'to confirm' },
            { num: '$0', label: 'extra ad spend' },
          ].map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
                <Text variant="primary" style={{ fontWeight: 500 }}>
                  {s.num}
                </Text>
                <Text variant="secondary">{s.label}</Text>
              </div>
              {i < 2 && (
                <span
                  style={{ width: 1, height: 14, background: 'var(--dark-8)', display: 'inline-block' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* sticky primary CTA */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 238,
          right: 0,
          background: 'var(--light-100)',
          borderTop: '1px solid var(--dark-8)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
          zIndex: 10,
        }}
      >
        <Text variant="secondary">Auto-replies + Google Posts handled · nothing goes live without your approval</Text>
        <Button variant="primary" size="lg" endIcon={ArrowRightSm} onPress={onNext}>
          Let&apos;s fix this — about 5 min
        </Button>
      </div>
    </>
  );
}

function LoadingStep({ onAdvance }: { onAdvance: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [done, setDone] = useState<boolean[]>(() => LOADING_STEPS.map(() => false));

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setDone((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          if (i + 1 < LOADING_STEPS.length) setActiveIdx(i + 1);
        }, 700 + i * 700),
      );
    });
    timers.push(setTimeout(onAdvance, 700 + LOADING_STEPS.length * 700 + 600));
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [onAdvance]);

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '60px auto',
        padding: '0 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 32 }}>
        <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%' }}>
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="80 600"
            style={{ transformOrigin: 'center', animation: 'mr-spin 6s linear infinite' }}
          />
          <circle
            cx="120"
            cy="120"
            r="86"
            fill="none"
            stroke="rgba(252,183,40,0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 400"
            style={{ transformOrigin: 'center', animation: 'mr-spin 4s linear infinite reverse' }}
          />
          <circle
            cx="120"
            cy="120"
            r="62"
            fill="none"
            stroke="rgba(0,0,0,0.18)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="40 280"
            style={{ transformOrigin: 'center', animation: 'mr-spin 3s linear infinite' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#B06000',
          }}
        >
          <span style={{ animation: 'mr-pulse 2.4s ease-in-out infinite', display: 'inline-flex' }}>
            <Stars size={28} />
          </span>
        </div>
      </div>

      <style>{`
        @keyframes mr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mr-pulse { 0%,100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.15); opacity: 1; } }
        @keyframes mr-spin-check { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--dark-60)',
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        Working on it
      </div>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.4px',
          color: 'var(--dark-90)',
          marginBottom: 12,
        }}
      >
        The agent is fixing your profile.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--dark-60)', lineHeight: 1.55, margin: '0 auto 24px' }}>
        This usually takes about 10 seconds. Hold tight — nothing is published yet.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, textAlign: 'left', width: '100%' }}>
        {LOADING_STEPS.map((step, i) => {
          const isDone = done[i];
          const isActive = !isDone && i === activeIdx;
          const Ic = step.icon;
          return (
            <div
              key={step.t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'var(--light-100)',
                border: `1px solid ${isDone || isActive ? 'var(--dark-15)' : 'var(--dark-8)'}`,
                borderRadius: 10,
                transition: 'opacity 0.2s, border-color 0.2s',
                opacity: isDone || isActive ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: isDone
                    ? '1.5px solid var(--status-approved)'
                    : isActive
                      ? '1.5px solid #B06000'
                      : '1.5px solid var(--dark-15)',
                  borderTopColor: isActive ? 'transparent' : undefined,
                  background: isDone ? 'var(--status-approved)' : 'transparent',
                  color: 'var(--light-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: isActive ? 'mr-spin-check 0.8s linear infinite' : undefined,
                }}
              >
                {isDone && <Check size={10} />}
              </div>
              <span style={{ color: 'var(--dark-60)', display: 'inline-flex' }}>
                <Ic size={14} />
              </span>
              <span style={{ fontSize: 13, color: 'var(--dark-90)', flex: 1 }}>{step.t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { showToast } = useToast();

  const totalChanges = SUMMARY_BLOCKS.reduce((sum, b) => sum + b.items.length, 0);

  return (
    <>
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '36px 28px 140px' }}>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--dark-60)',
          fontWeight: 500,
          marginBottom: 8,
        }}
      >
        Review &amp; confirm
      </div>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.4px',
          color: 'var(--dark-90)',
          marginBottom: 12,
        }}
      >
        Here&apos;s what we set up for you.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--dark-60)', lineHeight: 1.55, maxWidth: 560, marginBottom: 28 }}>
        Nothing is live yet. Glance through the changes — when you confirm, we&apos;ll publish your profile and queue
        your posts.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SUMMARY_BLOCKS.map((b) => (
          <div
            key={b.section}
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid var(--dark-4)',
                background: 'var(--dark-2)',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {b.section}
              </div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>
                {b.items.length} {b.items.length === 1 ? 'change' : 'changes'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {b.items.map((it, i) => {
                const Ic = it.icon;
                return (
                  <div
                    key={it.t}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: '14px 18px',
                      borderBottom: i < b.items.length - 1 ? '1px solid var(--dark-4)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--dark-4)',
                        color: 'var(--dark-80)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Ic size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: 'var(--dark-90)',
                          marginBottom: 2,
                          letterSpacing: '0.05px',
                        }}
                      >
                        {it.t}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.45 }}>{it.s}</div>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11.5,
                        color: 'var(--status-approved)',
                        fontWeight: 500,
                        background: 'var(--green-10)',
                        borderRadius: 6,
                        padding: '4px 8px',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'var(--status-approved)',
                        }}
                      />
                      Ready
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-8)',
          borderRadius: 12,
          padding: '14px 16px',
          marginTop: 16,
          fontSize: 13,
          color: 'var(--dark-80)',
          lineHeight: 1.55,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--light-100)',
            border: '1px solid var(--dark-8)',
            color: 'var(--dark-80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldChecked size={14} />
        </div>
        <div>
          <strong style={{ color: 'var(--dark-90)', fontWeight: 500 }}>
            Approving publishes everything above to Google.
          </strong>
          <span> You can still edit, pause, or roll back any item from your dashboard.</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 32,
          paddingTop: 20,
          borderTop: '1px solid var(--dark-4)',
        }}
      >
        <Button variant="tertiary" size="md" onPress={onBack}>
          Back
        </Button>
        <Button variant="secondary" size="md" onPress={() => showToast({ message: 'Edit step (out of scope here)' })}>
          Edit changes
        </Button>
      </div>
    </div>

    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 238,
        right: 0,
        background: 'var(--light-100)',
        borderTop: '1px solid var(--dark-8)',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        zIndex: 10,
      }}
    >
      <Text variant="secondary">
        {totalChanges} changes across {SUMMARY_BLOCKS.length} areas · nothing live yet
      </Text>
      <Button variant="primary" size="lg" frontIcon={Lightning} onPress={onNext}>
        Confirm &amp; go live
      </Button>
    </div>
    </>
  );
}

function LiveStep() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '0 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'var(--green-10)',
          border: '2px solid var(--status-approved)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          animation: 'mr-launch-pop 0.6s cubic-bezier(0.2,0,0,1) backwards',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--status-approved)',
            color: 'var(--light-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check size={36} />
        </div>
      </div>
      <style>{`
        @keyframes mr-launch-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <h1
        style={{
          fontSize: 32,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: '-0.4px',
          color: 'var(--dark-90)',
          marginBottom: 12,
        }}
      >
        You&apos;re live.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--dark-60)', lineHeight: 1.55, margin: '0 auto 8px' }}>
        Your profile is published. Loading your overview…
      </p>
    </div>
  );
}

// ─── HOME (steady state) ──────────────────────────────────────────────

function HomeView({ onReset }: { onReset: () => void }) {
  const { showToast } = useToast();
  const [actionDismissed, setActionDismissed] = useState(false);
  return (
    <div style={{ padding: '24px 28px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
      {!actionDismissed && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFAF0 0%, #FFF4DC 100%)',
            border: '1px solid rgba(252,183,40,0.32)',
            borderRadius: 14,
            padding: '18px 22px',
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                color: '#B06000',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
              }}
            >
              Action needed
            </div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 500,
                color: 'var(--dark-90)',
                letterSpacing: '0.05px',
                margin: '4px 0',
              }}
            >
              Reply to 3 new reviews from Maria H. and 2 others.
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--dark-80)', lineHeight: 1.5, maxWidth: 540, margin: 0 }}>
              The agent drafted replies. Approve to publish, or tap to edit. Most homeowners read responses before
              booking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            <Button variant="ghost" size="sm" onPress={() => setActionDismissed(true)}>
              Skip for now
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => {
                setActionDismissed(true);
                showToast({ message: 'Replies queued — review in your inbox' });
              }}
            >
              Review &amp; reply
            </Button>
            <IconButton
              icon={X02}
              size="sm"
              variant="ghost"
              aria-label="Dismiss"
              onPress={() => setActionDismissed(true)}
            />
          </div>
        </div>
      )}

      {/* Metric strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        <MetricCard
          icon={Marker03}
          label="Map Pack rank"
          value="#2"
          delta="↑ 2"
          deltaKind="up"
          foot={'"roof repair austin" · last month'}
        />
        <MetricCard
          icon={EyeOpen}
          label="Profile views"
          value="1,284"
          delta="+12.3%"
          deltaKind="up"
          foot="vs last month"
        />
        <MetricCard
          icon={Star}
          label="New reviews"
          value="5"
          unit="★ 4.8"
          foot="2 responded today"
        />
        <MetricCard
          icon={Send1}
          label="Posts published"
          value="4"
          delta="On schedule"
          deltaKind="flat"
          foot="Next: Friday at 10 AM"
        />
      </div>

      {/* Nudge + competitor ladder */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: 28,
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 14,
          padding: '22px 24px',
          marginBottom: 26,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--status-approved)',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            <span
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--status-approved)' }}
            />
            <span>You&apos;re climbing</span>
          </div>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 500,
              color: 'var(--dark-90)',
              letterSpacing: '-0.05px',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            Up 2 spots this week — let&apos;s keep the momentum going.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.55, marginBottom: 16, maxWidth: 480 }}>
            You moved from #4 → #2 for &quot;roof repair austin.&quot; The Texas Star team is still adding reviews
            fast. One more push and you could take #1 by month-end.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              variant="primary"
              size="md"
              endIcon={ArrowRightSm}
              onPress={() => showToast({ message: 'Review request sent to your last 5 customers' })}
            >
              Send review request
            </Button>
            <Button
              variant="tertiary"
              size="md"
              onPress={() => showToast({ message: 'Insights view (out of scope here)' })}
            >
              See full insight
            </Button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 14 }}>
            Rather have us handle this?{' '}
            <a style={{ color: 'var(--purple)', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
              Upgrade to Done-for-You →
            </a>
          </div>
        </div>
        <div
          style={{
            background: 'var(--dark-2)',
            border: '1px solid var(--dark-4)',
            borderRadius: 10,
            padding: '12px 6px',
            alignSelf: 'start',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--dark-40)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 500,
              padding: '0 12px 6px',
              marginBottom: 6,
              borderBottom: '1px solid var(--dark-4)',
            }}
          >
            &quot;Roof repair austin&quot; — top 5
          </div>
          {COMPETITORS.map((c) => (
            <div
              key={c.rank}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto',
                gap: 8,
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                background: c.you ? 'var(--light-100)' : undefined,
                boxShadow: c.you ? '0 0 0 1px var(--dark-8)' : undefined,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: c.you ? 'var(--dark-90)' : 'var(--dark-40)',
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                #{c.rank}
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: 'var(--dark-90)', fontWeight: c.you ? 500 : 400 }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>{c.recent}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--dark-60)' }}>★ {c.reviews}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-up: activity + side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--dark-90)',
              margin: '0 0 12px',
              letterSpacing: '0.05px',
            }}
          >
            Recent activity
          </h3>
          <div
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {ACTIVITY.map((a, i) => {
              const Ic = a.icon;
              const iconBg =
                a.kind === 'success' ? 'var(--green-10)' : a.kind === 'info' ? 'var(--info-10, rgba(0,131,226,0.10))' : 'var(--dark-4)';
              const iconColor =
                a.kind === 'success' ? 'var(--status-approved)' : a.kind === 'info' ? 'rgb(0,131,226)' : 'var(--dark-80)';
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr auto',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '12px 16px',
                    borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--dark-4)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: iconBg,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ic size={14} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--dark-90)',
                        letterSpacing: '0.05px',
                        marginBottom: 2,
                      }}
                    >
                      {a.t}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.45 }}>{a.s}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--dark-40)', flexShrink: 0, paddingTop: 4 }}>
                    {a.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--dark-90)',
              margin: '0 0 12px',
              letterSpacing: '0.05px',
            }}
          >
            Profile strength
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <MiniRing score={78} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>78% complete</div>
              <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2, lineHeight: 1.4 }}>
                Almost fully optimized
              </div>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {IMPROVE_LIST.map((it) => {
              const Ic = it.icon;
              return (
                <li
                  key={it.t}
                  onClick={() => showToast({ message: it.toast })}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 16px',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 0',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--dark-4)',
                      color: 'var(--dark-80)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ic size={16} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--dark-90)' }}>{it.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 2 }}>{it.s}</div>
                  </div>
                  <span style={{ color: 'var(--dark-40)', display: 'inline-flex' }}>
                    <ArrowRightSm size={14} />
                  </span>
                </li>
              );
            })}
          </ul>
          <div
            style={{
              fontSize: 12,
              color: 'var(--dark-60)',
              lineHeight: 1.5,
            }}
          >
            Want to handle these in 30 seconds? Our team can take care of profile maintenance for you.{' '}
            <a style={{ color: 'var(--purple)', fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}>
              Learn more →
            </a>
          </div>
        </div>
      </div>

      {/* Reset affordance — fixed bottom-right so designers can replay setup. */}
      <button
        type="button"
        onClick={onReset}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '6px 10px',
          background: 'var(--light-100)',
          border: '1px solid var(--dark-15)',
          borderRadius: 999,
          fontFamily: 'inherit',
          fontSize: 11,
          color: 'var(--dark-60)',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          zIndex: 50,
        }}
      >
        Reset setup
      </button>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────

interface MetricCardProps {
  icon: Icon;
  label: string;
  value: string;
  delta?: string;
  deltaKind?: 'up' | 'down' | 'flat';
  unit?: string;
  foot: string;
}

function MetricCard({ icon: Ic, label, value, delta, deltaKind, unit, foot }: MetricCardProps) {
  const deltaStyle: Record<NonNullable<MetricCardProps['deltaKind']>, { bg: string; color: string }> = {
    up: { bg: 'var(--green-10)', color: 'var(--status-approved)' },
    down: { bg: 'var(--red-10)', color: 'var(--red-70)' },
    flat: { bg: 'var(--dark-4)', color: 'var(--dark-60)' },
  };
  return (
    <div
      style={{
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--dark-60)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginBottom: 8,
          letterSpacing: '0.02em',
        }}
      >
        <Ic size={12} />
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 500,
          color: 'var(--dark-90)',
          letterSpacing: '-0.4px',
          fontVariantNumeric: 'tabular-nums',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        {value}
        {delta && deltaKind && (
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 7px',
              borderRadius: 5,
              lineHeight: 1,
              background: deltaStyle[deltaKind].bg,
              color: deltaStyle[deltaKind].color,
            }}
          >
            {delta}
          </span>
        )}
        {unit && <span style={{ fontSize: 13, color: 'var(--dark-60)', fontWeight: 400 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 11, color: 'var(--dark-40)', marginTop: 4 }}>{foot}</div>
    </div>
  );
}

// ─── ROUTE ────────────────────────────────────────────────────────────

export function MapRankingRoute() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, setState: setDevState } = useDevState();
  const devState = getState('/h2/map-ranking');
  // Initial view derives from localStorage on first render. The `?reset=1`
  // query param wipes that flag and forces 'audit'.
  const [view, setView] = useState<View>(() => {
    if (typeof window === 'undefined') return 'audit';
    if (searchParams.get('reset') === '1') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore quota / private-mode errors */
      }
      return 'audit';
    }
    try {
      return window.localStorage.getItem(STORAGE_KEY) === '1' ? 'home' : 'audit';
    } catch {
      return 'audit';
    }
  });

  // Sync dev-state toggle → view. Cold lands on 'audit'; steady on 'home'.
  useEffect(() => {
    setView((prev) => {
      if (devState === 'cold') return 'audit';
      // For 'steady', skip the intermediate setup steps and go straight to home.
      if (prev === 'audit' || prev === 'loading' || prev === 'review') return 'home';
      return prev;
    });
  }, [devState]);

  // Strip `?reset=1` after consuming it so refresh doesn't re-reset on every load.
  useEffect(() => {
    if (searchParams.get('reset') === '1') {
      const next = new URLSearchParams(searchParams);
      next.delete('reset');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // The "live" congrats view auto-advances to home after 1.7s and persists
  // the setup-complete flag.
  useEffect(() => {
    if (view !== 'live') return;
    const id = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      setView('home');
      setDevState('/h2/map-ranking', 'steady');
    }, 1700);
    return () => clearTimeout(id);
  }, [view, setDevState]);

  const handleReset = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setView('audit');
    setDevState('/h2/map-ranking', 'cold');
    showToast({ message: 'Setup reset — starting from the audit' });
  };

  const topbarRight =
    view === 'home' ? (
      <Button
        variant="secondary"
        size="md"
        onPress={() => showToast({ message: 'Open Google Business Profile' })}
      >
        View on Google
      </Button>
    ) : undefined;

  return (
    <H2Layout topbarRight={topbarRight}>
      {view === 'audit' && <AuditStep onNext={() => setView('loading')} />}
      {view === 'loading' && <LoadingStep onAdvance={() => setView('review')} />}
      {view === 'review' && (
        <ReviewStep onBack={() => setView('audit')} onNext={() => setView('live')} />
      )}
      {view === 'live' && <LiveStep />}
      {view === 'home' && <HomeView onReset={handleReset} />}
    </H2Layout>
  );
}
