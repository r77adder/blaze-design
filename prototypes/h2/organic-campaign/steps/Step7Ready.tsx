import { useMemo, useState } from 'react';
import { Heading, Text } from '@/components';

interface Campaign {
  id: string;
  title: string;
  description: string;
  range: string;
  status?: 'generating';
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function fmt(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function buildRanges(): string[] {
  const start = new Date();
  // Start on the upcoming Monday for a clean week boundary.
  const day = start.getDay();
  const offsetToMonday = (8 - day) % 7 || 7;
  start.setDate(start.getDate() + offsetToMonday);
  const ranges: string[] = [];
  for (let i = 0; i < 4; i++) {
    const from = new Date(start);
    from.setDate(start.getDate() + i * 7);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    ranges.push(`${fmt(from)} - ${fmt(to)}`);
  }
  return ranges;
}

const CAMPAIGNS_BASE: Omit<Campaign, 'range'>[] = [
  {
    id: 'c1',
    title: 'Building Trust Through Storytelling',
    description:
      'Earn trust by consistently sharing genuine stories that highlight true customer successes and reveal the authentic moments behind your brand.',
    status: 'generating',
  },
  {
    id: 'c2',
    title: 'Establishing Trust with Compelling Stories',
    description:
      'Foster trust by frequently sharing honest stories that feature real client achievements and candid behind-the-scenes glimpses that connect your brand to people.',
  },
  {
    id: 'c3',
    title: 'Trust Building via Storytelling',
    description:
      'Gain trust by regularly presenting sincere stories that display actual customer victories and behind-the-scenes insights that humanize your brand.',
  },
  {
    id: 'c4',
    title: 'Creating Confidence Through Storytelling',
    description:
      'Strengthen trust by sharing authentic narratives often, showcasing genuine client successes and the behind-the-scenes moments that make your brand.',
  },
];

/** Step 7 — Four campaigns ready. Card 1 shows a "Generating…" pill; Card 2
 *  starts in edit mode by default. Tweak any card to enter edit mode. */
export function Step7Ready() {
  const ranges = useMemo(buildRanges, []);
  const initial = useMemo<Campaign[]>(
    () => CAMPAIGNS_BASE.map((c, i) => ({ ...c, range: ranges[i] })),
    [ranges],
  );

  const [campaigns, setCampaigns] = useState<Campaign[]>(initial);
  const [editingId, setEditingId] = useState<string | null>('c2');

  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '24px auto 0' }}>
      <Heading level={2} style={{ marginBottom: 8, fontSize: 32 }}>
        Your first four campaigns are ready!
      </Heading>
      <Text variant="secondary">
        Tweak any of the themes or regenerate them before they generate their content
      </Text>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 28,
        }}
      >
        {campaigns.map((c, i) => {
          const isEditing = editingId === c.id;
          const isGenerating = c.status === 'generating';
          return (
            <div
              key={c.id}
              onClick={() => {
                if (!isGenerating) setEditingId(c.id);
              }}
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: 24,
                padding: 20,
                borderRadius: 12,
                border: isEditing
                  ? '1px solid var(--dark-90)'
                  : '1px solid var(--dark-8)',
                background: isGenerating
                  ? 'var(--dark-2)'
                  : 'var(--light-100)',
                cursor: isGenerating ? 'default' : 'text',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--dark-60)',
                    letterSpacing: '0.26px',
                  }}
                >
                  Campaign {i + 1}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--dark-60)',
                    letterSpacing: '0.26px',
                  }}
                >
                  {c.range}
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--dark-90)',
                    marginBottom: 6,
                  }}
                >
                  {c.title}
                </div>
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={c.description}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setCampaigns((prev) =>
                        prev.map((x) =>
                          x.id === c.id ? { ...x, description: e.target.value } : x,
                        ),
                      )
                    }
                    onBlur={() => setEditingId(null)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--dark-90)',
                      background: 'var(--light-100)',
                      fontFamily: "'Sohne', sans-serif",
                      fontSize: 14,
                      letterSpacing: '0.28px',
                      color: 'var(--dark-90)',
                      lineHeight: 1.55,
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 14,
                      color: 'var(--dark-60)',
                      lineHeight: 1.55,
                      letterSpacing: '0.28px',
                    }}
                  >
                    {c.description}
                  </div>
                )}
              </div>
              {isGenerating && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'var(--dark-4)',
                    color: 'var(--dark-60)',
                    fontSize: 12,
                    letterSpacing: '0.24px',
                    border: '1px solid var(--dark-8)',
                  }}
                >
                  Generating&hellip;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
