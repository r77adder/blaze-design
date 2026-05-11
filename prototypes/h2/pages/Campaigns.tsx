import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Button, Modal, ModalStack, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { useToast } from '@/staging';
import Plus from '@/icons/20/Plus';
import { H2Layout } from '../H2Layout';
import { CrosspostWarningModal } from '../CrosspostWarningModal';

/**
 * /h2/campaigns — deep port of Blaze H2 Features/campaigns.html.
 *
 * REPLACES the prior shallow card list with the full SVG Gantt chart that
 * the source actually uses as its main view. Adds the per-campaign detail
 * view, the Create-new chooser modal, and the new-campaign wizard
 * (strategy → optional context → loading → summary → done).
 *
 * State machine:
 *  - view: 'gantt' | 'detail'         (gantt is the main view)
 *  - wizard stage: 'pick' | 'context' | 'loading' | 'summary' | 'done'
 */

// ─── DATA ──────────────────────────────────────────────────────────

type CampaignStatus = 'posting' | 'approved' | 'review' | 'generating' | 'proposed';

type SectionId = 'organic' | 'influencer' | 'search' | 'meta' | 'landing' | 'aeo' | 'email' | 'reputation';

interface Campaign {
  id: string;
  name: string;
  type: string;
  thumb: string;
  start: string; // YYYY-MM-DD
  end: string;
  status: CampaignStatus;
  statusLabel: string;
  sections: SectionId[];
  proposed?: boolean;
  isNew?: boolean;
}

const PHOTO_A = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop';
const PHOTO_B = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&h=200&fit=crop';
const PHOTO_C = 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop';
const PHOTO_D = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&h=200&fit=crop';

const HERO_IMG: Record<string, string> = {
  fj: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=600&fit=crop',
  vpl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1600&h=600&fit=crop',
  ss: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=600&fit=crop',
  tt1: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&h=600&fit=crop',
  ss1: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&h=600&fit=crop',
  ss2: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1600&h=600&fit=crop',
  pu: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&h=600&fit=crop',
  tt2: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&h=600&fit=crop',
};

const SEED_CAMPAIGNS: Campaign[] = [
  { id: 'fj', name: 'Founder Journey Q1', type: 'Lifestyle Content', thumb: PHOTO_C, start: '2026-02-08', end: '2026-03-31', status: 'posting', statusLabel: 'Posting', sections: ['organic', 'influencer', 'landing', 'aeo'] },
  { id: 'vpl', name: 'Valentine Product Launch', type: 'Lifestyle Content', thumb: PHOTO_B, start: '2026-02-12', end: '2026-02-21', status: 'approved', statusLabel: 'Approved', sections: ['organic', 'meta', 'landing', 'email'] },
  { id: 'ss', name: 'Success Stories Q1', type: 'Lifestyle Content', thumb: PHOTO_D, start: '2026-02-14', end: '2026-03-28', status: 'approved', statusLabel: 'Approved', sections: ['organic', 'influencer', 'aeo'] },
  { id: 'tt1', name: 'Tips & Tricks March', type: 'Lifestyle Content', thumb: PHOTO_A, start: '2026-02-17', end: '2026-03-24', status: 'review', statusLabel: '15 posts to review', sections: ['organic', 'aeo'] },
  { id: 'ss1', name: 'Spring Sale 2026', type: 'Lifestyle Content', thumb: PHOTO_B, start: '2026-02-25', end: '2026-03-14', status: 'review', statusLabel: '2 posts to review', sections: ['organic', 'meta', 'search', 'landing'] },
  { id: 'ss2', name: 'Spring Sale — Wave 2', type: 'Lifestyle Content', thumb: PHOTO_C, start: '2026-03-01', end: '2026-03-28', status: 'generating', statusLabel: 'Generating in 3 days', sections: ['organic', 'meta', 'search'] },
  { id: 'pu', name: 'Product Updates Q1', type: 'Lifestyle Content', thumb: PHOTO_D, start: '2026-03-03', end: '2026-04-14', status: 'generating', statusLabel: 'Generating in 10 days', sections: ['organic', 'landing', 'aeo'] },
  { id: 'tt2', name: 'Tips & Tricks April', type: 'Lifestyle Content', thumb: PHOTO_A, start: '2026-03-03', end: '2026-04-04', status: 'generating', statusLabel: 'Generating on Apr 30', sections: ['organic', 'influencer'] },
  { id: 'pe', name: 'Easter Brunch Series', type: 'Seasonal · proposed', thumb: PHOTO_B, start: '2026-03-30', end: '2026-04-12', status: 'proposed', statusLabel: 'Proposed — review to accept', proposed: true, sections: ['organic', 'meta'] },
  { id: 'pmd', name: "Mother's Day Gift Guide", type: 'Seasonal · proposed', thumb: PHOTO_D, start: '2026-04-20', end: '2026-04-30', status: 'proposed', statusLabel: 'Proposed — review to accept', proposed: true, sections: ['organic', 'meta', 'email'] },
  { id: 'psl', name: 'Summer Pre-Launch Tease', type: 'Awareness · proposed', thumb: PHOTO_C, start: '2026-04-15', end: '2026-04-30', status: 'proposed', statusLabel: 'Proposed — review to accept', proposed: true, sections: ['organic', 'aeo', 'landing'] },
];

interface SectionMeta {
  title: string;
  desc: string;
  chips: string[];
  pill: string;
  pillKind: 'ok' | 'warn';
  icon: ReactNode;
}

const SECTION_META: Record<SectionId, SectionMeta> = {
  organic: {
    title: 'Organic Posts',
    desc: '12 posts across Instagram, Facebook, LinkedIn',
    chips: ['Instagram', 'Facebook', 'LinkedIn', 'X'],
    pill: '12 ready',
    pillKind: 'ok',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
      </svg>
    ),
  },
  influencer: {
    title: 'Influencer Content',
    desc: '4 creators briefed across micro and mid-tier',
    chips: ['TikTok', 'Instagram', 'YouTube'],
    pill: '1 needs review',
    pillKind: 'warn',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9.5" r="2.5" />
        <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
        <path d="M15 17.5c.4-2 2-3 4-3s3 1 3 3" />
      </svg>
    ),
  },
  search: {
    title: 'Paid Search',
    desc: '3 ad groups · 28 keywords · 6 ad variations',
    chips: ['Google Ads'],
    pill: 'Approved',
    pillKind: 'ok',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.3-4.3" />
      </svg>
    ),
  },
  meta: {
    title: 'Meta Ads',
    desc: '5 ad creatives · 2 audiences · $40/day',
    chips: ['Facebook', 'Instagram'],
    pill: '1 needs review',
    pillKind: 'warn',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="m4 16 5-5 4 4 3-3 4 4" />
      </svg>
    ),
  },
  landing: {
    title: 'Landing Page',
    desc: 'Hero, 3 feature sections, signup form',
    chips: ['radianthealth.com/spring'],
    pill: 'Approved',
    pillKind: 'ok',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4" width="17" height="16" rx="2" />
        <path d="M3.5 9h17" />
      </svg>
    ),
  },
  aeo: {
    title: 'AEO Content',
    desc: '8 Q&A pairs optimised for ChatGPT, Perplexity',
    chips: ['ChatGPT', 'Perplexity', 'Google AI'],
    pill: '8 ready',
    pillKind: 'ok',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" />
        <circle cx="12" cy="17" r=".8" fill="currentColor" />
      </svg>
    ),
  },
  email: {
    title: 'Post-Signup Emails',
    desc: '5-step welcome sequence over 14 days',
    chips: ['Email'],
    pill: '5 ready',
    pillKind: 'ok',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    ),
  },
  reputation: {
    title: 'Reputation',
    desc: 'Yelp + Google review amplification',
    chips: ['Yelp', 'Google'],
    pill: 'Pending',
    pillKind: 'warn',
    icon: (
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3 2.5 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.8 19.5l1.1-6L3.5 9.3l6-.8z" />
      </svg>
    ),
  },
};

// ─── DATE HELPERS ──────────────────────────────────────────────────

const TODAY = new Date(2026, 1, 11);
const RANGE_START = new Date(2026, 1, 1);
const RANGE_END = new Date(2026, 3, 30);
const DAY_W = 14;
const ROW_H = 72;

function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function fmtDay(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long' });
}
function isWeekend(d: Date): boolean {
  const w = d.getDay();
  return w === 0 || w === 6;
}
function fmtDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const TOTAL_DAYS = daysBetween(RANGE_START, RANGE_END) + 1;

// ─── PAGE TABS ─────────────────────────────────────────────────────

function PageTabs() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '0 28px',
        background: 'var(--light-100)',
        borderBottom: '1px solid var(--dark-8)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          padding: '11px 16px',
          fontSize: 13.5,
          fontWeight: 500,
          color: 'var(--dark-90)',
          borderBottom: '2px solid var(--dark-90)',
          marginBottom: -1,
        }}
      >
        Campaigns
      </span>
      <span
        style={{
          padding: '11px 16px',
          fontSize: 13.5,
          fontWeight: 400,
          color: 'var(--dark-60)',
          borderBottom: '2px solid transparent',
          marginBottom: -1,
          cursor: 'pointer',
        }}
      >
        Calendar
      </span>
    </div>
  );
}

// ─── GANTT VIEW ────────────────────────────────────────────────────

interface BarStyle {
  bg: string;
  border: string;
  edge: string;
  statusColor: string;
}

function barStyleFor(status: CampaignStatus): BarStyle {
  switch (status) {
    case 'posting':
      return { bg: 'rgba(0,131,226,0.10)', border: '1px solid rgba(0,131,226,0.18)', edge: '#0083E2', statusColor: '#0083E2' };
    case 'approved':
      return { bg: 'rgba(32,161,79,0.10)', border: 'none', edge: 'var(--status-approved)', statusColor: 'var(--status-approved)' };
    case 'review':
      return { bg: 'rgba(255,180,0,0.14)', border: 'none', edge: '#FFB400', statusColor: '#B57700' };
    case 'generating':
      return { bg: 'rgba(0,0,0,0.04)', border: '1px dashed rgba(0,0,0,0.18)', edge: '#7383A2', statusColor: 'var(--dark-60)' };
    case 'proposed':
      return { bg: 'rgba(106,0,255,0.04)', border: '1.5px dashed rgba(106,0,255,0.45)', edge: 'var(--purple)', statusColor: 'var(--purple)' };
  }
}

interface GanttViewProps {
  campaigns: Campaign[];
  onOpenDetail: (id: string) => void;
}

function GanttView({ campaigns, onOpenDetail }: GanttViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const totalW = TOTAL_DAYS * DAY_W;
  const rows = useMemo(() => [...campaigns].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()), [campaigns]);
  const totalH = rows.length * ROW_H;

  // months
  const months: { label: string; year: number; w: number }[] = [];
  {
    let cursor = startOfMonth(RANGE_START);
    while (cursor <= RANGE_END) {
      const monthEnd = endOfMonth(cursor) > RANGE_END ? RANGE_END : endOfMonth(cursor);
      const days = daysBetween(cursor < RANGE_START ? RANGE_START : cursor, monthEnd) + 1;
      months.push({ label: fmtMonth(cursor), year: cursor.getFullYear(), w: days * DAY_W });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  // weeks (Mondays)
  const weeks: { label: string; w: number }[] = [];
  {
    let w = new Date(RANGE_START);
    while (w.getDay() !== 1) w = addDays(w, 1);
    if (daysBetween(RANGE_START, w) > 0) {
      weeks.push({ label: '', w: daysBetween(RANGE_START, w) * DAY_W });
    }
    while (w <= RANGE_END) {
      const weekEnd = addDays(w, 6) > RANGE_END ? RANGE_END : addDays(w, 6);
      const days = daysBetween(w, weekEnd) + 1;
      weeks.push({ label: fmtDay(w), w: days * DAY_W });
      w = addDays(w, 7);
    }
  }

  // weekend stripes + week + month gridlines
  const weekendStripes: { x: number }[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    if (isWeekend(addDays(RANGE_START, i))) weekendStripes.push({ x: i * DAY_W });
  }
  const weekGridLines: number[] = [];
  {
    let mw = new Date(RANGE_START);
    while (mw.getDay() !== 1) mw = addDays(mw, 1);
    while (mw <= RANGE_END) {
      weekGridLines.push(daysBetween(RANGE_START, mw) * DAY_W);
      mw = addDays(mw, 7);
    }
  }
  const monthGridLines: number[] = [];
  {
    let mm = startOfMonth(RANGE_START);
    while (mm <= RANGE_END) {
      const x = daysBetween(RANGE_START, mm) * DAY_W;
      if (x > 0) monthGridLines.push(x);
      mm = new Date(mm.getFullYear(), mm.getMonth() + 1, 1);
    }
  }

  const todayLeft = daysBetween(RANGE_START, TODAY) * DAY_W + DAY_W / 2;

  // Auto-center on today on first render
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const target = todayLeft - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, target);
  }, [todayLeft]);

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--light-100)',
        position: 'relative',
      }}
    >
      <div style={{ minWidth: Math.max(1400, totalW) }}>
        {/* Header (sticky) */}
        <div
          style={{
            height: 60,
            position: 'sticky',
            top: 0,
            background: 'var(--light-100)',
            zIndex: 3,
            borderBottom: '1px solid var(--dark-8)',
            width: totalW,
          }}
        >
          <div style={{ display: 'flex', height: 28 }}>
            {months.map((m, i) => (
              <div
                key={i}
                style={{
                  width: m.w,
                  borderRight: '1px solid var(--dark-8)',
                  padding: '6px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--dark-90)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <span>{m.label}</span>
                <span style={{ color: 'var(--dark-40)', fontWeight: 400, fontSize: 12 }}>{m.year}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', height: 32, borderTop: '1px solid var(--dark-8)' }}>
            {weeks.map((w, i) => (
              <div
                key={i}
                style={{
                  width: w.w,
                  borderRight: '1px solid var(--dark-8)',
                  padding: '0 8px',
                  fontSize: 11,
                  color: 'var(--dark-60)',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                {w.label}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ position: 'relative', width: totalW, height: totalH }}>
          {/* Weekend stripes */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {weekendStripes.map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: s.x,
                  width: DAY_W,
                  background: 'rgba(0,0,0,0.018)',
                }}
              />
            ))}
            {weekGridLines.map((x, i) => (
              <div
                key={'w' + i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: x,
                  width: 1,
                  background: 'var(--dark-4)',
                }}
              />
            ))}
            {monthGridLines.map((x, i) => (
              <div
                key={'m' + i}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: x,
                  width: 1,
                  background: 'rgba(0,0,0,0.07)',
                }}
              />
            ))}
          </div>

          {/* Rows + bars */}
          {rows.map((c, rowIdx) => {
            const start = parseISO(c.start);
            const end = parseISO(c.end);
            const left = daysBetween(RANGE_START, start) * DAY_W;
            const width = (daysBetween(start, end) + 1) * DAY_W - 2;
            const top = rowIdx * ROW_H;
            const tight = width < 220;
            const veryTight = width < 80;
            const bs = barStyleFor(c.status);
            const showThumb = !c.proposed;
            return (
              <div
                key={c.id}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: ROW_H,
                  borderBottom: '1px solid var(--dark-4)',
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpenDetail(c.id)}
                  data-testid={`gantt-bar-${c.id}`}
                  style={{
                    position: 'absolute',
                    top: 10,
                    left,
                    width,
                    height: 52,
                    borderRadius: 10,
                    padding: veryTight ? '0 6px' : '0 12px 0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    minWidth: 28,
                    background: bs.bg,
                    border: bs.border,
                    boxShadow: c.isNew ? '0 0 0 2px var(--brand) inset, 0 4px 14px rgba(252,183,40,0.25)' : undefined,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: 4,
                      borderRadius: '10px 0 0 10px',
                      background: bs.edge,
                      opacity: c.proposed ? 0.6 : 1,
                    }}
                  />
                  {showThumb && (
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 7,
                        backgroundImage: `url(${c.thumb})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {c.proposed && (
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: 'rgba(106,0,255,0.12)',
                        color: 'var(--purple)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
                      </svg>
                    </span>
                  )}
                  {c.isNew && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 8,
                        background: 'var(--brand)',
                        color: '#1A1A1A',
                        fontSize: 9.5,
                        fontWeight: 500,
                        padding: '2px 7px',
                        borderRadius: 5,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        zIndex: 2,
                      }}
                    >
                      New
                    </span>
                  )}
                  {!veryTight && (
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: c.proposed ? 500 : 450,
                          color: c.proposed ? 'var(--purple)' : 'var(--dark-90)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.05px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        {c.status === 'posting' && (
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: '#0083E2',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {c.name}
                      </span>
                      {!tight && (
                        <span
                          style={{
                            fontSize: 11,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 450,
                            color: bs.statusColor,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              flexShrink: 0,
                              background: 'currentColor',
                            }}
                          />
                          {c.statusLabel}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Today line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              height: totalH,
              left: todayLeft,
              width: 2,
              background: 'var(--red-70)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -22,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.06em',
                color: '#fff',
                background: 'var(--red-70)',
                padding: '2px 6px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}
            >
              TODAY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL VIEW ───────────────────────────────────────────────────

interface DetailViewProps {
  campaign: Campaign;
  onBack: () => void;
  onSectionClick: (sid: SectionId) => void;
  onTurnOffCrosspost: () => void;
}

function DetailView({ campaign: c, onBack, onSectionClick, onTurnOffCrosspost }: DetailViewProps) {
  const start = parseISO(c.start);
  const end = parseISO(c.end);
  const days = daysBetween(start, end) + 1;
  const heroImg = HERO_IMG[c.id] || c.thumb;
  const statusLabel = c.proposed ? 'Proposed' : c.status === 'posting' ? 'Live · Posting' : c.statusLabel;
  const pillBg =
    c.status === 'posting' ? 'rgba(0,131,226,0.95)' :
    c.status === 'approved' ? 'rgba(32,161,79,0.95)' :
    c.status === 'review' ? 'rgba(255,180,0,0.95)' :
    c.proposed ? 'rgba(106,0,255,0.95)' : 'rgba(115,131,162,0.95)';
  const genStatus =
    c.status === 'generating' ? 'Generating…' :
    c.status === 'review' ? 'Needs review' :
    c.status === 'proposed' ? 'Proposed by AI' : 'Ready';
  const genText = c.proposed
    ? 'Blaze proposed this campaign based on seasonal signals and your past performance. Review the brief and accept to start production.'
    : c.status === 'generating'
      ? 'Blaze is producing content for this campaign. Sections will appear as they are ready for review.'
      : 'All sections are ready. Approve to schedule against the calendar.';

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--light-100)' }}>
      {/* Hero */}
      <div
        style={{
          position: 'relative',
          height: 280,
          backgroundImage: `url('${heroImg}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '24px 60px',
          color: '#fff',
        }}
      >
        <div
          style={{
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          data-testid="detail-back"
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--dark-90)',
            zIndex: 1,
          }}
        >
          <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 999,
              background: pillBg,
              color: '#fff',
              fontSize: 11.5,
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            {c.status === 'posting' && (
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
            )}
            {statusLabel}
          </span>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: '-0.4px',
              color: '#fff',
              margin: 0,
              maxWidth: 900,
            }}
          >
            {c.name}
          </h1>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 60,
            bottom: 24,
            display: 'flex',
            gap: 8,
            zIndex: 1,
          }}
        >
          <button type="button" aria-label="Settings" style={heroIconBtnStyle}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button type="button" aria-label="More" style={heroIconBtnStyle}>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
              <circle cx="6" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="18" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '28px 60px 80px' }}>
        {/* Gen banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: '#fafafa',
            border: '1px solid var(--dark-8)',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 12.5,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              color: 'var(--dark-80)',
              fontWeight: 500,
            }}
          >
            {genStatus}
          </span>
          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--dark-80)' }}>{genText}</span>
        </div>

        {/* Campaign details */}
        <section style={{ marginBottom: 36 }}>
          <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--dark-90)', margin: 0, flex: 1 }}>
              Campaign details
            </h3>
          </header>
          <DetailRow label="Schedule" first icon={
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          }>
            {fmtDay(start)} – {fmtDay(end)} <span style={{ color: 'var(--dark-40)' }}>· {days} days</span>
          </DetailRow>
          <DetailRow label="Brand" icon={
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-4z" />
            </svg>
          }>
            Radiant Health <span style={{ color: 'var(--dark-40)' }}>· from Brand Kit</span>
          </DetailRow>
          <DetailRow label="Audience" icon={
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          }>
            Wellness-curious adults 25–45 · US
          </DetailRow>
          <DetailRow label="Theme" icon={
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l5-5 4 4 8-9" />
              <path d="M14 7h6v6" />
            </svg>
          }>
            {c.type}
          </DetailRow>
          <DetailRow label="Crosspost" icon={<></>}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--dark-90)' }}>On — sharing across all connected accounts</span>
              <button
                type="button"
                onClick={onTurnOffCrosspost}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  color: 'var(--dark-60)',
                  fontSize: 13,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Turn off
              </button>
            </span>
          </DetailRow>
        </section>

        {/* What's in this */}
        <section style={{ marginBottom: 36 }}>
          <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.2px', color: 'var(--dark-90)', margin: 0, flex: 1 }}>
              What's in this campaign
            </h3>
            <span style={{ fontSize: 12.5, color: 'var(--dark-60)' }}>Click any section to review</span>
          </header>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {c.sections.map((sid) => {
              const meta = SECTION_META[sid];
              if (!meta) return null;
              const pillBgC = meta.pillKind === 'ok' ? 'rgba(32,161,79,0.10)' : 'rgba(255,180,0,0.14)';
              const pillFg = meta.pillKind === 'ok' ? 'var(--status-approved)' : '#B57700';
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => onSectionClick(sid)}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '18px 20px',
                    background: 'var(--light-100)',
                    border: '1px solid var(--dark-8)',
                    borderRadius: 14,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--dark-80)',
                      flexShrink: 0,
                    }}
                  >
                    {meta.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h4 style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: 'var(--dark-90)', margin: 0 }}>
                        {meta.title}
                      </h4>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 500,
                            background: pillBgC,
                            color: pillFg,
                          }}
                        >
                          {meta.pill}
                        </span>
                        <span style={{ color: 'var(--dark-40)' }}>
                          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </span>
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--dark-80)', marginBottom: 8 }}>{meta.desc}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {meta.chips.map((ch) => (
                        <span
                          key={ch}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: 'var(--dark-4)',
                            fontWeight: 450,
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

const heroIconBtnStyle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  background: 'rgba(255,255,255,0.85)',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--dark-90)',
};

function DetailRow({
  label,
  icon,
  children,
  first,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: 20,
        padding: '14px 0',
        borderTop: first ? 'none' : '1px solid var(--dark-4)',
        alignItems: 'start',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--dark-60)' }}>
        <span style={{ width: 18, height: 18, color: 'var(--dark-40)', display: 'inline-flex' }}>{icon}</span>
        {label}
      </span>
      <span style={{ fontSize: 13.5, color: 'var(--dark-90)', lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

// ─── CHOOSER MODAL ─────────────────────────────────────────────────

function ChooserCard({
  icon,
  label,
  description,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 20,
        gap: 10,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'border-color 0.12s, box-shadow 0.12s, transform 0.12s',
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: '#fafafa',
          border: '1px solid var(--dark-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dark-90)',
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.05px' }}>{label}</span>
      <span style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>{description}</span>
    </button>
  );
}

function CreateChooserModal({
  close,
  onPickCampaign,
  onPickPost,
}: StackModalProps & {
  onPickCampaign: () => void;
  onPickPost: () => void;
}) {
  return (
    <Modal.Root size="md" aria-labelledby="cmp-chooser-title" data-testid="cmp-create-chooser">
      <Modal.Header title="What do you want to create?" id="cmp-chooser-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
          Pick one — the agent takes it from there.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ChooserCard
            icon={
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 9h18M9 5v14" />
              </svg>
            }
            label="Campaign"
            description="A multi-channel marketing campaign — agent picks the strategy and channel mix."
            onClick={onPickCampaign}
          />
          <ChooserCard
            icon={
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="m3 16 5-5 4 4 3-3 6 6" />
                <circle cx="9" cy="9" r="1.5" />
              </svg>
            }
            label="Post"
            description="A single organic social post for Instagram, TikTok, LinkedIn, or X."
            onClick={onPickPost}
          />
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}

// ─── WIZARD ────────────────────────────────────────────────────────

interface Strategy {
  id: string;
  name: string;
  desc: string;
  icon: ReactNode;
  elements: SectionId[];
  context?: { q: string; placeholder: string; suggestions: string[] };
  themePrefix: string;
  durationDays: number;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'lifestyle',
    name: 'Lifestyle Content',
    desc: 'Show your brand woven into real moments — habits, rituals, daily routines that build cultural pull.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
      </svg>
    ),
    elements: ['organic', 'influencer', 'email'],
    themePrefix: 'A 4-week lifestyle push showing how Radiant fits into the morning routines, weekend rituals, and calm-evening moments of your audience.',
    durationDays: 28,
  },
  {
    id: 'educational',
    name: 'Educational Content',
    desc: 'Teach the why and how — drives trust, search visibility, and long-term consideration.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l9-4 9 4-9 4z" />
        <path d="M7 9.5V14c0 1.5 2.4 3 5 3s5-1.5 5-3V9.5" />
      </svg>
    ),
    elements: ['organic', 'aeo', 'email'],
    themePrefix: 'An evergreen education push — short organic explainers, deeper AEO/SEO pages, and a 3-step email primer that build trust before the buy.',
    durationDays: 28,
  },
  {
    id: 'offer',
    name: 'Offer & Promotion',
    desc: 'Time-bound discount, bundle, or seasonal offer — designed to convert.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7h13l4 5-4 5H3z" />
        <circle cx="8" cy="12" r="1.4" fill="currentColor" />
      </svg>
    ),
    elements: ['email', 'meta', 'search', 'landing', 'organic'],
    themePrefix: 'A 14-day offer push — Email + SMS pulse, paid Meta + Google Search creative, a dedicated landing page, and supporting organic posts.',
    durationDays: 14,
  },
  {
    id: 'problem',
    name: 'Problem / Solution',
    desc: 'Frame the pain point and how your product solves it — for buyers in research mode.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9.5a3 3 0 1 1 4 2.7c-.7.4-1 1-1 1.8" />
        <circle cx="12" cy="17" r=".7" fill="currentColor" />
      </svg>
    ),
    elements: ['aeo', 'landing', 'search', 'email'],
    themePrefix: 'A research-mode push aimed at buyers comparing options — high-intent SEO/AEO content, a comparison landing page, paid search anchored on solution queries, and a follow-up email primer.',
    durationDays: 21,
  },
  {
    id: 'launch',
    name: 'Product Launch',
    desc: 'Reveal a new product with a coordinated, multi-channel push.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3 4 5h-3v6h-2V8H8z" />
        <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
      </svg>
    ),
    elements: ['organic', 'influencer', 'email', 'meta', 'search', 'landing'],
    context: { q: 'Which product are you launching?', placeholder: 'e.g., Daily Wellness Bundle V2', suggestions: ['Daily Wellness Bundle V2', 'Sleep Stack', 'Calm Bundle', 'Energy + Focus Stack'] },
    themePrefix: 'A coordinated launch sequence — teaser → reveal → social proof → close — across organic, paid, influencer, and CRM. Anchored on',
    durationDays: 21,
  },
  {
    id: 'showcase',
    name: 'Product Showcase',
    desc: 'Spotlight an existing product — angles, formats, and creators that surface what makes it special.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M7 10h4M7 14h2" />
      </svg>
    ),
    elements: ['organic', 'influencer', 'meta'],
    context: { q: 'Which product do you want to showcase?', placeholder: 'e.g., The Sleep Stack', suggestions: ['The Sleep Stack', 'Daily Wellness Bundle', 'Calm Drops', 'Energy Stack'] },
    themePrefix: 'A 3-week showcase pushing fresh angles, formats, and creator perspectives on',
    durationDays: 21,
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    desc: 'Customer voices — real stories repurposed across organic, ads, and CRM.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8.5a3 3 0 1 1 6 0c0 2-3 3-3 5" />
        <circle cx="8" cy="17" r="0.8" fill="currentColor" />
        <path d="M14 8.5a3 3 0 1 1 6 0c0 2-3 3-3 5" />
        <circle cx="17" cy="17" r="0.8" fill="currentColor" />
      </svg>
    ),
    elements: ['organic', 'meta', 'email'],
    context: { q: 'Which customer story should we anchor on?', placeholder: 'e.g., Sarah K. — "Cleared my morning fog in 3 days"', suggestions: ['Sarah K. — morning fog', 'Marcus R. — energy crash', 'Priya N. — clean ingredients', 'Elena T. — sleep reset'] },
    themePrefix: 'A 2-week testimonial-led push — turning the story into organic shorts, retargeted Meta ads, a CRM nurture, and review-platform amplification. Anchored on',
    durationDays: 14,
  },
  {
    id: 'trending',
    name: 'Trending & Seasonal',
    desc: 'Ride a trend or seasonal moment with timely, relevant content.',
    icon: (
      <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l5-5 4 3 8-8" />
        <path d="M14 7h7v7" />
      </svg>
    ),
    elements: ['organic', 'meta', 'email', 'influencer'],
    context: { q: "What trend or seasonal moment are we tying into?", placeholder: 'e.g., New Year reset, Earth Day, Spring Equinox', suggestions: ['New Year reset', 'Earth Day', 'Spring Equinox', "Mother's Day", 'Wellness Week', 'Back to school'] },
    themePrefix: 'A timely 2-week push designed to land in-feed during the moment — paid Meta + organic + creator amplification + CRM follow-up. Tied to',
    durationDays: 14,
  },
];

const LOAD_TASKS = [
  'Reading your Brand Kit (voice, tone, color)',
  'Pulling top-performing themes from past campaigns',
  'Drafting copy and creative angles in your voice',
  'Picking the channel mix and posting cadence',
  'Generating campaign brief for review',
];

interface WizardState {
  stage: 'pick' | 'context' | 'loading' | 'summary' | 'done';
  strategyId: string | null;
  context: string;
  name: string;
  theme: string;
  startDate: Date;
  durationDays: number;
  loadStep: number;
  newCampaignId?: string;
}

const NEW_THUMBS = [PHOTO_A, PHOTO_B, PHOTO_C, PHOTO_D];

function buildName(strategy: Strategy, ctx: string): string {
  if (strategy.id === 'launch' && ctx) return `${ctx} — Launch`;
  if (strategy.id === 'showcase' && ctx) return `${ctx} — Showcase`;
  if (strategy.id === 'testimonial' && ctx) {
    const head = ctx.split('—')[0].trim().split('"')[0].trim();
    return `${head} — Testimonial`;
  }
  if (strategy.id === 'trending' && ctx) return `${ctx} — Moment`;
  return `${strategy.name} — ${TODAY.toLocaleDateString('en-US', { month: 'short' })}`;
}
function buildTheme(strategy: Strategy, ctx: string): string {
  if (strategy.context && ctx) return `${strategy.themePrefix} ${ctx}.`;
  return strategy.themePrefix;
}

function NewCampaignWizardModal({
  close,
  onApprove,
}: StackModalProps & {
  onApprove: (c: Campaign) => void;
}) {
  const [state, setState] = useState<WizardState>({
    stage: 'pick',
    strategyId: null,
    context: '',
    name: '',
    theme: '',
    startDate: addDays(TODAY, 1),
    durationDays: 28,
    loadStep: 0,
  });

  const strategy = STRATEGIES.find((s) => s.id === state.strategyId) ?? null;

  const pickStrategy = (id: string) => {
    const s = STRATEGIES.find((x) => x.id === id);
    if (!s) return;
    if (s.context) {
      setState((prev) => ({ ...prev, strategyId: id, context: '', stage: 'context' }));
    } else {
      setState((prev) => ({ ...prev, strategyId: id, context: '', stage: 'loading', loadStep: 0 }));
    }
  };

  // Loading animation
  useEffect(() => {
    if (state.stage !== 'loading' || !strategy) return;
    const iv = setInterval(() => {
      setState((prev) => {
        if (prev.stage !== 'loading') return prev;
        const next = prev.loadStep + 1;
        if (next > LOAD_TASKS.length) {
          clearInterval(iv);
          const s = STRATEGIES.find((x) => x.id === prev.strategyId)!;
          return {
            ...prev,
            stage: 'summary',
            name: prev.name || buildName(s, prev.context),
            theme: prev.theme || buildTheme(s, prev.context),
            durationDays: s.durationDays,
          };
        }
        return { ...prev, loadStep: next };
      });
    }, 700);
    return () => clearInterval(iv);
  }, [state.stage, strategy]);

  const goBackToPick = () => setState((prev) => ({ ...prev, stage: 'pick', context: '', loadStep: 0 }));

  const approve = () => {
    if (!strategy) return;
    const start = state.startDate;
    const end = addDays(start, state.durationDays - 1);
    const id = 'nc' + Date.now();
    const newCampaign: Campaign = {
      id,
      name: state.name,
      type: strategy.name,
      thumb: NEW_THUMBS[Math.floor(Math.random() * NEW_THUMBS.length)],
      start: fmtDateInput(start),
      end: fmtDateInput(end),
      status: 'review',
      statusLabel: 'New · awaiting your review',
      sections: strategy.elements.slice(),
      isNew: true,
    };
    onApprove(newCampaign);
    setState((prev) => ({ ...prev, stage: 'done', newCampaignId: id }));
  };

  // ─── Render per stage ───
  if (state.stage === 'pick') {
    return (
      <Modal.Root size="md" aria-labelledby="nc-pick-title" data-testid="cmp-wizard-pick">
        <Modal.Header
          title="What kind of campaign are we running?"
          id="nc-pick-title"
          onClose={close}
          compact={false}
        />
        <Modal.Content compact={false}>
          <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
            Pick a strategy. The agent picks the channel mix, drafts the brief, and stages everything for your review.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pickStrategy(s.id)}
                style={{
                  background: 'var(--light-100)',
                  border: '1px solid var(--dark-8)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr',
                  gap: 14,
                  alignItems: 'flex-start',
                  width: '100%',
                  color: 'inherit',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fafafa',
                    border: '1px solid var(--dark-8)',
                    color: 'var(--dark-90)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 500,
                      color: 'var(--dark-90)',
                      marginBottom: 3,
                      letterSpacing: '-0.05px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {s.name}
                    {s.context && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: 10,
                          fontWeight: 500,
                          padding: '2px 7px',
                          borderRadius: 5,
                          background: 'var(--dark-4)',
                          color: 'var(--dark-60)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Needs context
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--dark-60)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Modal.Content>
      </Modal.Root>
    );
  }

  if (state.stage === 'context' && strategy && strategy.context) {
    const ctx = strategy.context;
    const valid = state.context.trim().length > 0;
    return (
      <Modal.Root size="md" aria-labelledby="nc-ctx-title" data-testid="cmp-wizard-context">
        <Modal.Header title="One quick detail" id="nc-ctx-title" onBack={goBackToPick} onClose={close} compact={false} />
        <Modal.Content compact={false}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 8 }}>{ctx.q}</div>
          <input
            type="text"
            placeholder={ctx.placeholder}
            value={state.context}
            onChange={(e) => setState((prev) => ({ ...prev, context: e.target.value }))}
            style={{
              width: '100%',
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'var(--dark-90)',
              background: 'var(--light-100)',
              border: '1px solid var(--dark-15)',
              borderRadius: 10,
              padding: '12px 14px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {ctx.suggestions.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setState((prev) => ({ ...prev, context: v }))}
                style={{
                  background: '#fafafa',
                  border: '1px solid var(--dark-8)',
                  color: 'var(--dark-80)',
                  borderRadius: 99,
                  padding: '5px 10px',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={goBackToPick}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton
              variant="primary"
              isDisabled={!valid}
              onPress={() => setState((prev) => ({ ...prev, stage: 'loading', loadStep: 0 }))}
            >
              Generate campaign
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  if (state.stage === 'loading') {
    return (
      <Modal.Root size="md" aria-labelledby="nc-load-title" data-testid="cmp-wizard-loading">
        <Modal.Header title="Drafting your campaign" id="nc-load-title" onClose={close} compact={false} />
        <Modal.Content compact={false}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px' }}>
            <div style={{ width: 96, height: 96, marginBottom: 24, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle, rgba(252,183,40,0.4) 0%, rgba(252,183,40,0.1) 50%, transparent 70%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 24,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FACC15, #F4B41E)',
                  color: '#1B1B1A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(252,183,40,0.6)',
                }}
              >
                <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
                  <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--dark-60)', marginBottom: 24, textAlign: 'center', maxWidth: 480 }}>
              Pulling the right channels, tone, and cadence — this takes about 5 seconds.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 460 }}>
              {LOAD_TASKS.map((t, i) => {
                const isDone = i < state.loadStep;
                const isActive = i === state.loadStep;
                return (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      padding: '9px 13px',
                      background: 'var(--light-100)',
                      border: `1px solid ${isActive || isDone ? 'var(--dark-15)' : 'var(--dark-8)'}`,
                      borderRadius: 9,
                      opacity: isActive || isDone ? 1 : 0.45,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '1.5px solid var(--dark-15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                        background: isDone ? 'var(--status-approved)' : 'transparent',
                        borderColor: isDone ? 'var(--status-approved)' : 'var(--dark-15)',
                      }}
                    >
                      {isDone && (
                        <svg viewBox="0 0 24 24" width={9} height={9} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L20 7" />
                        </svg>
                      )}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--dark-90)' }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal.Content>
      </Modal.Root>
    );
  }

  if (state.stage === 'summary' && strategy) {
    const dateStr = `${state.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${addDays(state.startDate, state.durationDays - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    return (
      <Modal.Root size="md" aria-labelledby="nc-sum-title" data-testid="cmp-wizard-summary">
        <Modal.Header title={state.name} id="nc-sum-title" onClose={close} compact={false} />
        <Modal.Content compact={false}>
          <div
            style={{
              background: '#fafafa',
              border: '1px solid var(--dark-8)',
              borderLeft: '3px solid var(--dark-90)',
              borderRadius: 10,
              padding: '14px 18px',
              fontSize: 13.5,
              color: 'var(--dark-80)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {state.theme}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            <div
              style={{
                background: '#fafafa',
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                padding: '11px 14px',
              }}
            >
              <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>Strategy</div>
              <div style={{ fontSize: 13, fontWeight: 450, color: 'var(--dark-90)' }}>{strategy.name}</div>
            </div>
            <div
              style={{
                background: '#fafafa',
                border: '1px solid var(--dark-8)',
                borderRadius: 10,
                padding: '11px 14px',
              }}
            >
              <div style={{ fontSize: 10.5, color: 'var(--dark-40)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>Schedule</div>
              <div style={{ fontSize: 13, fontWeight: 450, color: 'var(--dark-90)' }}>{dateStr}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-60)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Campaign elements
          </div>
          <div style={{ background: '#fafafa', border: '1px solid var(--dark-8)', borderRadius: 12, padding: 6 }}>
            {strategy.elements.map((eid, idx) => {
              const meta = SECTION_META[eid];
              if (!meta) return null;
              return (
                <div
                  key={eid}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                    padding: '11px 13px',
                    borderRadius: 8,
                    borderTop: idx === 0 ? 'none' : '1px solid var(--dark-4)',
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--light-100)',
                      border: '1px solid var(--dark-8)',
                      color: 'var(--dark-90)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ display: 'inline-flex', width: 15, height: 15 }}>{meta.icon}</span>
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 450, color: 'var(--dark-90)' }}>{meta.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--dark-60)', marginTop: 1 }}>{meta.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={goBackToPick}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="primary" onPress={approve}>
              Launch campaign
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  if (state.stage === 'done') {
    return (
      <Modal.Root size="md" aria-labelledby="nc-done-title" data-testid="cmp-wizard-done">
        <Modal.Header title="Campaign added" id="nc-done-title" onClose={close} compact={false} />
        <Modal.Content compact={false}>
          <div style={{ textAlign: 'center', padding: '20px 12px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34D399, #22C55E)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}
            >
              <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.1px', marginBottom: 8 }}>
              {state.name} added to campaigns
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--dark-60)', maxWidth: 440, margin: '0 auto', lineHeight: 1.55 }}>
              The agent is staging the briefs and creative. We'll surface anything that needs your sign-off in your campaign view.
            </p>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={close}>
              Back to campaigns
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      </Modal.Root>
    );
  }

  return null;
}

// ─── ROUTE ─────────────────────────────────────────────────────────

export function CampaignsRoute() {
  return (
    <ModalStack>
      <CampaignsRouteInner />
    </ModalStack>
  );
}

function CampaignsRouteInner() {
  const { showToast } = useToast();
  const { openModal, closeModal } = useModals();
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [view, setView] = useState<{ kind: 'gantt' } | { kind: 'detail'; campaignId: string }>({ kind: 'gantt' });

  const openWizard = () => {
    openModal(NewCampaignWizardModal, {
      onApprove: (c) => {
        setCampaigns((prev) => [...prev, c]);
        showToast({ message: `${c.name} added to campaigns` });
      },
    });
  };

  const openChooser = () => {
    openModal(CreateChooserModal, {
      onPickCampaign: () => {
        closeModal();
        openWizard();
      },
      onPickPost: () => {
        closeModal();
        showToast({ message: 'Posts live on the Calendar tab (Organic Social)' });
      },
    });
  };

  const topbarRight =
    view.kind === 'gantt' ? (
      <Button variant="secondary" size="md" frontIcon={Plus} onPress={openChooser}>
        Create new
      </Button>
    ) : undefined;

  const detailCampaign =
    view.kind === 'detail' ? campaigns.find((c) => c.id === view.campaignId) ?? null : null;

  return (
    <H2Layout topbarRight={topbarRight}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {view.kind === 'gantt' && (
          <>
            <PageTabs />
            <GanttView campaigns={campaigns} onOpenDetail={(id) => setView({ kind: 'detail', campaignId: id })} />
          </>
        )}
        {view.kind === 'detail' && detailCampaign && (
          <DetailView
            campaign={detailCampaign}
            onBack={() => setView({ kind: 'gantt' })}
            onSectionClick={(sid) => showToast({ message: `Open ${SECTION_META[sid]?.title ?? sid}` })}
            onTurnOffCrosspost={() => {
              openModal(CrosspostWarningModal, {
                onConfirm: () => {
                  showToast({ message: 'Crosspost disabled · each account will publish individually' });
                },
              });
            }}
          />
        )}
      </div>
    </H2Layout>
  );
}
