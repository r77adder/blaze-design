import { useState } from 'react';
import { Button, Heading, IconButton, Text } from '@/components';
import { Avatar, Card, Pill, useToast } from '@/staging';
import Trash2 from '@/icons/20/Trash2';
import { H2Layout } from '../../H2Layout';
import { CompetitorTabs } from '../CompetitorTabs';
import { DIFF_CARDS, LANDSCAPE_CATEGORIES, type LandscapeCompetitor } from '../data';
import { AddCompetitorButton } from '../AddCompetitorButton';

// Tokenized accent colors. These greens / reds / purple tints don't map
// cleanly to existing tokens, so we name them locally to keep raw hex out
// of JSX.
const STRENGTH_BG = '#ECFDF5';
const STRENGTH_BORDER = '#A7F3D0';
const RISK_BG = '#FEF2F2';
const RISK_BORDER = '#FCA5A5';
const PURPLE_TINT_BG = '#F5F3FF';
const PURPLE_TINT_BORDER = '#DDD6FE';
const PURPLE_DEEP = '#5B21B6';

/**
 * /competitor-tracking/landscape — Competitive Landscape page.
 *
 * Sections:
 *   1. Hero summary (tight headline + body — no Card chrome).
 *   2. The competitive map — 3 vertical category lists (no boxed columns).
 *   3. How to win vs each rival — 4 diff cards with bulleted plays + CTA.
 *   4. Recommended positioning — featured headline + body + messaging themes.
 *   5. Strengths & risks — 2-up tonal columns with action buttons per item.
 *   6. Sources cited — H3 title outside, link list inside Card.
 */
export function LandscapePage() {
  const { showToast } = useToast();

  return (
    <H2Layout topbarCenter={<CompetitorTabs />} topbarRight={<AddCompetitorButton />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, padding: 28, maxWidth: 1280, margin: '0 auto' }}>
        {/* Hero summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Heading level={1}>"Same-crew, full-scope Austin painter"</Heading>
          <Text variant="primary" style={{ color: 'var(--dark-80)' }}>
            You sit between national painting franchises and one-truck local crews. Compete on crew consistency, scope breadth, and review depth — not price.
          </Text>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'var(--dark-60)', marginTop: 4 }}>
            <Text variant="metadata">11 competitors mapped</Text>
            <Text variant="metadata">·</Text>
            <Text variant="metadata">3 strategic categories</Text>
            <Text variant="metadata">·</Text>
            <Text variant="metadata">Updated Apr 17 · 3 days ago</Text>
            <Text variant="metadata">·</Text>
            <Text variant="metadata">Sources cited</Text>
          </div>
        </div>

        {/* The competitive map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {LANDSCAPE_CATEGORIES.map((cat) => (
            <div key={cat.title} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Heading level={3}>{cat.title}</Heading>
                <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>{cat.sub}</Text>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {cat.items.map((it) => (
                  <CategoryItem key={it.name} item={it} onRemove={() => showToast({ message: `Removed ${it.name} from landscape`, variant: 'success' })} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Diff cards */}
        <Section title="How to win vs each rival" sub="Tailored playbooks per competitor" subVariant="secondary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {DIFF_CARDS.map((d) => (
              <Card key={d.competitorName} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar fallback={d.initials} size="md" style={{ background: d.color, color: 'var(--light-100)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <Pill size="xs">Vs.</Pill>
                    <Heading level={5}>{d.competitorName}</Heading>
                  </div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.bullets.map((b) => (
                    <li key={b} style={{ color: 'var(--dark-80)' }}>
                      <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>{b}</Text>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onPress={() => showToast({ message: `Creating strategy vs ${d.competitorName}…`, variant: 'success' })}
                  >
                    Create Strategy
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Recommended positioning */}
        <Section title="Recommended positioning" sub="The position with the most defensible space">
          <Card padding="lg" style={{ background: PURPLE_TINT_BG, borderColor: PURPLE_TINT_BORDER, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Heading level={4} style={{ color: PURPLE_DEEP }}>
              "The Austin painter who finishes what they start — same crew, every day"
            </Heading>
            <Text variant="secondary" style={{ color: 'var(--dark-80)' }}>
              Bridge two customer truths: Austin homeowners want a recognizable name they can trust AND they want to know who is actually painting their house. The strongest position is the painter who pairs national-grade warranty + scope with same-crew accountability you can call by name — exterior, interior, cabinets, HOA, hot-weather scheduling and all.
            </Text>
            <Text variant="smallList" style={{ color: 'var(--dark-90)' }}>Recommended messaging themes:</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {[
                '"Same crew, start to finish — no rotating subcontractors."',
                '"Painted to last through an Austin summer."',
                '"One Austin painter for interior, exterior, cabinets, decks, and HOAs."',
                '"Backed by a real warranty, run by neighbors you can call."',
              ].map((t) => (
                <div key={t} style={{ padding: '12px 12px', background: 'var(--light-100)', border: `1px solid ${PURPLE_TINT_BORDER}`, borderRadius: 8, fontStyle: 'italic' }}>
                  <Text variant="secondary" style={{ color: 'var(--dark-90)', fontStyle: 'italic' }}>{t}</Text>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" onPress={() => showToast({ message: 'Positioning applied to brand kit', variant: 'success' })}>
                Apply To Brand Kit
              </Button>
            </div>
          </Card>
        </Section>

        {/* Risks & strengths */}
        <Section title="Competitive risks & strengths" sub="Where you're vulnerable and where you lean in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <RsColumn
              title="Strengths to lean into"
              tone="strength"
              items={[
                { text: 'Same-crew accountability across multi-day jobs — rare among franchises', action: 'Build Campaign' },
                { text: 'Broader scope: interior, exterior, cabinets, decks, HOA, stucco — one Austin contact', action: 'Create Bundle Page' },
                { text: 'Hot-weather + UV-stable paint expertise built for Austin summers', action: 'Launch Summer Campaign' },
                { text: 'Strong fit for urgent listing-deadline and move-in repaints', action: 'Launch Urgency Campaign' },
              ]}
            />
            <RsColumn
              title="Risks to mitigate"
              tone="risk"
              items={[
                { text: 'National franchises outspending on search + warranty marketing', action: 'Build Counter-strategy' },
                { text: 'Local rivals copying your flat-rate room pricing', action: 'Set Monitor Alert' },
                { text: 'If pricing is unclear, "painter near me" shoppers default to flat-rate options', action: 'Audit Pricing Pages' },
                { text: 'Sherwin-Williams contractor price increases squeezing exterior margins', action: 'Plan Supplier Mix' },
              ]}
            />
          </div>
        </Section>

        {/* Sources */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Heading level={3}>Sources cited in this analysis</Heading>
            <Text variant="metadata" style={{ color: 'var(--dark-60)' }}>14 references ↓</Text>
          </div>
          <Card padding="md">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                'PCA (Painting Contractors Association) — 2026 industry report',
                'Houzz — Austin painters directory + reviews',
                'Sherwin-Williams contractor program — 2026 pricing update',
                'Benjamin Moore — exterior paint UV-stability whitepaper',
                'NextDoor — Austin painting recommendations (Westlake + Cedar Park)',
                'Five Star Painting — franchise services overview',
                'WOW 1 DAY PAINTING — Austin location reviews',
                'Paper Moon Painting — pricing + commercial page',
                'Spectrum Painting Austin — services',
                'Maverick Painting — Hill Country portfolio',
                'American Painting Contractor — Texas market trends',
                'Top 10 painters in Austin — Expertise.com',
              ].map((s) => (
                <a key={s} style={{ color: 'var(--dark-90)', cursor: 'pointer', padding: '4px 0', textDecoration: 'none' }}>
                  <Text variant="metadata" style={{ color: 'var(--dark-90)' }}>{s}</Text>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </H2Layout>
  );
}

function Section({
  title,
  sub,
  right,
  subVariant = 'metadata',
  children,
}: {
  title: string;
  sub: string;
  right?: React.ReactNode;
  subVariant?: 'metadata' | 'secondary';
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <div>
          <Heading level={3} style={{ marginBottom: 2 }}>{title}</Heading>
          <Text variant={subVariant} style={{ color: 'var(--dark-60)' }}>{sub}</Text>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function CategoryItem({ item, onRemove }: { item: LandscapeCompetitor; onRemove: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid var(--dark-8)', borderRadius: 8 }}
    >
      <Avatar
        fallback={item.initials}
        size="sm"
        style={{ background: item.color, color: 'var(--light-100)', width: 28, height: 28 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text variant="smallList" style={{ color: 'var(--dark-90)', display: 'block' }}>{item.name}</Text>
        <Text
          variant="metadata"
          style={{
            color: 'var(--dark-60)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginTop: 2,
          }}
        >
          {item.desc}
        </Text>
      </div>
      <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms ease', marginLeft: 'auto' }}>
        <IconButton
          icon={Trash2}
          size="xs"
          variant="tertiary"
          aria-label={`Remove ${item.name} from landscape`}
          onPress={onRemove}
        />
      </div>
    </div>
  );
}

function RsColumn({
  title,
  tone,
  items,
}: {
  title: string;
  tone: 'strength' | 'risk';
  items: { text: string; action: string }[];
}) {
  const itemBg = tone === 'strength' ? STRENGTH_BG : RISK_BG;
  const itemBorder = tone === 'strength' ? STRENGTH_BORDER : RISK_BORDER;
  const { showToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Heading level={5}>{title}</Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it) => (
          <li key={it.text} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: itemBg, borderRadius: 8, border: `1px solid ${itemBorder}` }}>
            <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>{it.text}</Text>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="xs" variant="secondary" onPress={() => showToast({ message: `${it.action} → ${it.text}`, variant: 'success' })}>
                {it.action}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
