import { type ReactNode } from 'react';
import { Section, Callout, Prose, NumberedList } from '../../h2/insights/shared';
import { FONT } from './charts';

/**
 * Editable narrative wrappers for the client-authored channel dashboards. In
 * read-only mode (the default the client sees) they render the H2 `Callout` /
 * `NumberedList` verbatim. In AM-edit mode (toggled from the Insights topbar)
 * they swap to plain textareas so an account manager can rewrite what the
 * client will see read-only. State lives in the parent Insights component.
 *
 * H2's `insights/shared.tsx` is intentionally left untouched — this is a
 * client-side wrapper around its primitives.
 */

const editBox = (extra?: object): React.CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: FONT,
  fontSize: 16,
  lineHeight: 1.55,
  color: 'var(--dark-90)',
  border: '1px solid var(--purple)',
  borderRadius: 10,
  padding: '12px 14px',
  outline: 'none',
  resize: 'vertical',
  background: 'var(--light-100)',
  ...extra,
});

function EditLabel({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', color: 'var(--purple)' }}>{children}</span>
    </span>
  );
}

/** "Account health" — headline + body. Editable as two fields. */
export function AccountHealth({
  editing,
  headline,
  body,
  onHeadline,
  onBody,
}: {
  editing: boolean;
  headline: string;
  body: string;
  onHeadline: (v: string) => void;
  onBody: (v: string) => void;
}) {
  return (
    <Section title="Business Health">
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '18px 20px', background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 12 }}>
          <div>
            <EditLabel>Headline</EditLabel>
            <textarea value={headline} onChange={(e) => onHeadline(e.target.value)} rows={2} style={editBox({ fontSize: 18, fontWeight: 500 })} />
          </div>
          <div>
            <EditLabel>Summary</EditLabel>
            <textarea value={body} onChange={(e) => onBody(e.target.value)} rows={4} style={editBox()} />
          </div>
        </div>
      ) : (
        <Callout headline={headline}>
          <Prose lead>
            <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>The story this week:</strong> {body}
          </Prose>
        </Callout>
      )}
    </Section>
  );
}

/** "What we're doing next" — an ordered list. Editable as one line per item. */
export function NextSteps({
  editing,
  items,
  onItems,
}: {
  editing: boolean;
  items: string[];
  onItems: (v: string[]) => void;
}) {
  return (
    <Section title="What we’re doing next">
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <EditLabel>One step per line</EditLabel>
          <textarea
            value={items.join('\n')}
            onChange={(e) => onItems(e.target.value.split('\n'))}
            rows={Math.max(items.length + 1, 3)}
            style={editBox()}
          />
        </div>
      ) : (
        <NumberedList items={items.filter((i) => i.trim())} />
      )}
    </Section>
  );
}
