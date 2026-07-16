import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text, Heading, Button, IconButton } from '@/components';
import { Pill } from '@/staging';
import ThumbUp from '@/icons/20/ThumbUp';
import ThumbDown from '@/icons/20/ThumbDown';
import Edit3 from '@/icons/20/Edit3';
import Check2 from '@/icons/20/Check2';
import { SEARCH_ADS, SITELINKS, type SearchAsset } from './data';
import { useWizard } from './wizard';
import { RequestChangesAction } from './ui';

/**
 * Google Search review. A Responsive Search Ad is not a finished ad: the client
 * approves a pool of assets (up to 15 headlines, 4 descriptions, images, URL
 * paths) that Google mixes and matches. Each asset can be liked, disliked, or
 * edited (and flagged as edited); a live feed on the right shows example ads
 * Google could assemble from what is kept. Composed from Blaze components.
 */

const F = "'Sohne', sans-serif";
type Vote = 'up' | 'down';

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--dark-15)', borderRadius: 8, padding: '8px 10px',
  fontFamily: F, fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', outline: 'none', boxSizing: 'border-box',
};

/** One reviewable asset: text (or inline editor), edited flag, edit + vote controls.
 *  With hoverReveal, the like/dislike votes stay visible and only the edit
 *  button fades in on hover. */
function AssetRow({ text, original, vote, onVote, onSave, mono, hoverReveal }: {
  text: string; original: string; vote?: Vote; onVote: (v: Vote) => void; onSave: (v: string) => void; mono?: boolean; hoverReveal?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [hover, setHover] = useState(false);
  const edited = text !== original;
  const showEdit = !hoverReveal || hover;

  if (editing) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid var(--dark-8)' }}>
      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} style={inputStyle}
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(draft.trim() || original); setEditing(false); } if (e.key === 'Escape') { setDraft(text); setEditing(false); } }} />
      <Button size="sm" variant="ghost" onPress={() => { setDraft(text); setEditing(false); }}>Cancel</Button>
      <Button size="sm" variant="primary" onPress={() => { onSave(draft.trim() || original); setEditing(false); }}>Save</Button>
    </div>
  );

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', borderTop: '1px solid var(--dark-8)', opacity: vote === 'down' ? 0.55 : 1 }}
    >
      <Text style={{ minWidth: 0, fontSize: mono ? 14 : 16, fontWeight: 400, color: mono ? 'var(--dark-70)' : 'var(--dark-90)', fontFamily: F, textDecoration: vote === 'down' ? 'line-through' : 'none' }}>{text}</Text>
      <span style={{ display: 'inline-flex', flexShrink: 0, opacity: showEdit ? 1 : 0, pointerEvents: showEdit ? 'auto' : 'none', transition: 'opacity 0.12s ease' }}>
        <IconButton size="sm" variant="ghost" icon={Edit3} title="Edit" onPress={() => { setDraft(text); setEditing(true); }} />
      </span>
      {edited && <Pill size="sm">Edited</Pill>}
      <span style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <IconButton size="sm" variant={vote === 'up' ? 'green' : 'ghost'} icon={ThumbUp} title="Like" onPress={() => onVote('up')} />
        <IconButton size="sm" variant={vote === 'down' ? 'red' : 'ghost'} icon={ThumbDown} title="Dislike" onPress={() => onVote('down')} />
      </div>
    </div>
  );
}

/** Section title + hint sit OUTSIDE the bordered container; the container
 *  holds only the reviewable rows. The first row's top divider is dropped
 *  (via the .rsa-body rule) so it does not double up with the container edge. */
function Section({ title, hint, count, children }: { title: string; hint?: string; count?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: hint ? 4 : 10 }}>
        <Heading level={3} style={{ margin: 0 }}>{title}</Heading>
        {count}
      </div>
      {hint && <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 10, lineHeight: 1.5 }}>{hint}</Text>}
      <div className="rsa-body" style={{ border: '1px solid var(--dark-8)', borderRadius: 12, background: 'var(--light-100)', padding: '2px 22px' }}>
        {children}
      </div>
    </section>
  );
}

/** Horizontal marquee of example ads. Scrolls left continuously and eases to
 *  a stop on hover; fog gradients fade the ends into the page. */
function AdTicker({ cards }: { cards: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const speed = useRef(0);
  const target = useRef(0.9);
  useEffect(() => {
    let raf = 0;
    const step = () => {
      speed.current += (target.current - speed.current) * 0.06;
      offset.current -= speed.current;
      const track = trackRef.current;
      if (track) {
        const half = track.scrollWidth / 2;
        if (half > 0 && -offset.current >= half) offset.current += half;
        track.style.transform = `translateX(${offset.current}px)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const fog = 'linear-gradient(90deg, var(--light-100), rgba(255,255,255,0))';
  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', padding: '6px 0' }}
      onMouseEnter={() => { target.current = 0; }}
      onMouseLeave={() => { target.current = 0.9; }}
    >
      <div ref={trackRef} style={{ display: 'flex', gap: 16, width: 'max-content', alignItems: 'stretch', willChange: 'transform' }}>
        {cards.map((c, i) => (
          <div key={`a${i}`} style={{ flexShrink: 0, width: 300, display: 'flex' }}>{c}</div>
        ))}
        {cards.map((c, i) => (
          <div key={`b${i}`} aria-hidden style={{ flexShrink: 0, width: 300, display: 'flex' }}>{c}</div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 150, background: fog, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 150, background: fog, transform: 'scaleX(-1)', pointerEvents: 'none' }} />
    </div>
  );
}

/** Approve-all for the whole Google Search asset pool. */
function ApproveAll() {
  const { decisions, decide } = useWizard();
  const id = 'paid:search-ads';
  const approved = decisions[id]?.status === 'approved';
  return (
    <Button size="md" variant={approved ? 'green' : 'secondary'} frontIcon={Check2} onPress={() => decide(id, approved ? null : { status: 'approved' })}>
      {approved ? 'All approved' : 'Approve all'}
    </Button>
  );
}

/** The sitelinks block in the client review: one section-level Request Changes
 *  for the whole set, each sitelink shown as a clearly-separated card. */
function ClientSitelinksSection() {
  const { decisions } = useWizard();
  const decision = decisions['paid:sitelinks'];
  const changed = decision?.status === 'changes';
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <Heading level={3} style={{ margin: 0 }}>Sitelinks</Heading>
        <RequestChangesAction decisionKey="paid:sitelinks" prompt="What should change about the sitelinks?" />
      </div>
      <Text variant="secondary" color="var(--dark-60)" style={{ display: 'block', marginBottom: 12, lineHeight: 1.5 }}>Extra links shown under your ad that jump people to key pages.</Text>
      {changed && decision?.note && (
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(174,34,34,0.06)', borderRadius: 8 }}>
          <Text color="var(--dark-80)" style={{ display: 'block', fontSize: 14, lineHeight: 1.5 }}>You requested changes: {decision.note}</Text>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SITELINKS.map((s) => (
          <div key={s.id} style={{ border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--light-100)', padding: '16px 18px' }}>
            <Text style={{ display: 'block', fontSize: 15, fontWeight: 500, color: '#1a0dab', fontFamily: F }}>{s.title}</Text>
            <Text style={{ display: 'block', marginTop: 4, fontSize: 13.5, color: 'var(--dark-60)', lineHeight: 1.45 }}>{s.desc}</Text>
            <Text style={{ display: 'block', marginTop: 8, fontSize: 12.5, color: 'var(--status-approved)', fontFamily: F }}>{s.url}</Text>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SearchAdsReview() {
  const [votes, setVotes] = useState<Record<string, Vote | undefined>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});

  const textOf = (a: SearchAsset) => edits[a.id] ?? a.text;
  const setVote = (id: string, v: Vote) => setVotes((p) => ({ ...p, [id]: p[id] === v ? undefined : v }));
  const setEdit = (id: string, val: string) => setEdits((p) => ({ ...p, [id]: val }));

  const kept = (list: SearchAsset[]) => list.filter((a) => votes[a.id] !== 'down');
  const likedCount = (list: SearchAsset[]) => list.filter((a) => votes[a.id] === 'up').length;

  const liveHeadlines = kept(SEARCH_ADS.headlines);
  const liveDescriptions = kept(SEARCH_ADS.descriptions);

  // Example ads Google could assemble from what is kept: 2–3 headlines + 1 description.
  const previews = [0, 1, 2, 3, 4].map((k) => ({
    headlines: [0, 1, 2].map((i) => liveHeadlines[(k * 2 + i) % Math.max(1, liveHeadlines.length)]).filter(Boolean),
    description: liveDescriptions[k % Math.max(1, liveDescriptions.length)],
  }));

  const countPill = (list: SearchAsset[]) => (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      <Pill size="sm">{likedCount(list)} liked</Pill>
      {list.length - kept(list).length > 0 && <Pill size="sm" tone="danger">{list.length - kept(list).length} flagged</Pill>}
    </span>
  );

  const url = `${textOf({ id: 'finalUrl', text: SEARCH_ADS.finalUrl } as SearchAsset)}/${SEARCH_ADS.displayPaths.map((d) => textOf(d)).join('/')}`;
  const previewCards = previews.map((p, i) => (
    <div key={i} style={{ width: '100%', border: '1px solid var(--dark-8)', borderRadius: 10, background: 'var(--light-100)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '14px 16px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--dark-90)', fontFamily: F, border: '1px solid var(--dark-15)', borderRadius: 4, padding: '0 4px', lineHeight: '15px' }}>Ad</span>
        <span style={{ fontSize: 11.5, color: 'var(--dark-60)', fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 400, color: '#1a0dab', fontFamily: F, lineHeight: 1.3 }}>
        {p.headlines.map((h) => textOf(h)).join('  |  ')}
      </p>
      {p.description && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--dark-60)', fontFamily: F, lineHeight: 1.5 }}>{textOf(p.description)}</p>}
    </div>
  ));

  return (
    <div>
      <style>{'.rsa-body > div:first-child { border-top-color: transparent !important; }'}</style>

      {/* hero: a ticker of example ads Google could assemble, above the headline, bleeding to the edges */}
      <div style={{ margin: '0 -32px 32px' }}>
        <AdTicker cards={previewCards} />
      </div>

      {/* headline + approve, below the ticker. The blurb spans the full column
          width (its own row) so it stays to two lines. */}
      <div style={{ maxWidth: 760, margin: '0 auto 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Heading level={2} style={{ margin: 0 }}>Your Google Search ads</Heading>
          <div style={{ flexShrink: 0 }}><ApproveAll /></div>
        </div>
        <Text variant="primary" color="var(--dark-60)" style={{ display: 'block', margin: '10px 0 0', lineHeight: 1.6 }}>
          Google assembles your ads on the fly, mixing and matching these assets to find the best performers. Like the ones you love, flag any you do not, and edit the copy anytime.
        </Text>
      </div>

      {/* asset pool, single column */}
      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Section title="Headlines" hint="Up to 15. Google shows up to 3 at a time." count={countPill(SEARCH_ADS.headlines)}>
          {SEARCH_ADS.headlines.map((h) => (
            <AssetRow key={h.id} text={textOf(h)} original={h.text} vote={votes[h.id]} onVote={(v) => setVote(h.id, v)} onSave={(val) => setEdit(h.id, val)} hoverReveal />
          ))}
        </Section>

        <Section title="Descriptions" hint="Up to 4. Google shows up to 2 at a time." count={countPill(SEARCH_ADS.descriptions)}>
          {SEARCH_ADS.descriptions.map((d) => (
            <AssetRow key={d.id} text={textOf(d)} original={d.text} vote={votes[d.id]} onVote={(v) => setVote(d.id, v)} onSave={(val) => setEdit(d.id, val)} hoverReveal />
          ))}
        </Section>

        <Section title="Images" hint="Shown alongside the ad on eligible placements.">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, padding: '14px 0 18px' }}>
            {SEARCH_ADS.images.map((im) => (
              <div key={im.id} style={{ opacity: votes[im.id] === 'down' ? 0.55 : 1 }}>
                <div style={{ aspectRatio: '4 / 3', borderRadius: 8, overflow: 'hidden', background: 'var(--dark-4)', border: '1px solid var(--dark-8)' }}>
                  <img src={im.img} alt={im.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                  <Text style={{ flex: 1, minWidth: 0, fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.35 }}>{im.label}</Text>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <IconButton size="sm" variant={votes[im.id] === 'up' ? 'green' : 'ghost'} icon={ThumbUp} title="Like" onPress={() => setVote(im.id, 'up')} />
                    <IconButton size="sm" variant={votes[im.id] === 'down' ? 'red' : 'ghost'} icon={ThumbDown} title="Dislike" onPress={() => setVote(im.id, 'down')} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <ClientSitelinksSection />
      </div>
    </div>
  );
}
