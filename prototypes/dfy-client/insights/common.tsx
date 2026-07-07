import { type ReactNode } from 'react';
import { Heading, Text } from '@/components';

/** Default weeks (weekly cadence) shared by every client report. */
export const WEEKS = [
  { value: 'w0', label: 'Jun 1–7, 2026' },
  { value: 'w1', label: 'May 25–31, 2026' },
  { value: 'w2', label: 'May 18–24, 2026' },
  { value: 'w3', label: 'May 11–17, 2026' },
];

/** Weekday tick labels for the daily trend charts. */
export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Narrative content the AM can edit, per channel. */
export interface Narrative {
  headline: string;
  body: string;
  next: string[];
}

/** Props every bespoke channel report receives. */
export interface ChannelProps {
  editing: boolean;
  narrative: Narrative;
  onNarrative: (patch: Partial<Narrative>) => void;
}

/** A titled block inside a report (mirrors H2's Section but lets us put any
 *  chart layout in the body without the report shell). */
export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <Heading level={3} style={{ margin: '0 0 14px' }}>{title}</Heading>
      {children}
    </section>
  );
}

/** Two-up responsive grid for side-by-side charts. */
export function Grid2({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {children}
    </div>
  );
}

/** Caption row under a stat / chart. */
export function Caption({ children }: { children: ReactNode }) {
  return <Text variant="metadata" style={{ display: 'block', marginTop: 8, color: 'var(--dark-60)', lineHeight: 1.5 }}>{children}</Text>;
}
