import { useState } from 'react';
import { Text, Button } from '@/components';
import { Card, StatusPill, Checkbox } from '@/staging';
import Edit1 from '@/icons/20/Edit1';
import ImageArrows from '@/icons/20/ImageArrows';
import ArrowRefresh from '@/icons/20/ArrowRefresh';
import Trash2 from '@/icons/20/Trash2';
import Check2 from '@/icons/20/Check2';
import type { GeneratedAsset, AssetType } from './lib/types';
import { TextInput, TextArea, HoverInput } from './ui';

/** Preview aspect ratio per format, Instagram portrait (4:5) for stills, ads &
 *  carousels; vertical (9:16) for stories and video reels. */
export const ASPECT: Partial<Record<AssetType, string>> = {
  'Still Image': '4 / 5',
  Carousel: '4 / 5',
  'Search Ad': '4 / 5',
  'Meta Ad': '4 / 5',
  Story: '9 / 16',
  Video: '9 / 16',
};

/**
 * The review card used in both the Plan step and the Visual review step.
 * Pass `selectable` to show a label-less checkbox in the top-left corner (used
 * on the Plan step to mark a sample for the customer's review).
 */
export function AssetCard({
  asset,
  selectable,
  checked,
  onCheckedChange,
  readOnly,
}: {
  asset: GeneratedAsset;
  selectable?: boolean;
  checked?: boolean;
  onCheckedChange?: (next: boolean) => void;
  /** Content-only: no per-piece approve/request controls or edit tools. */
  readOnly?: boolean;
}) {
  const [fb, setFb] = useState({ topic: '', caption: '', overlay: '' });
  const [panel, setPanel] = useState<'edit' | 'replace' | null>(null);
  const [seed, setSeed] = useState(0);
  const [hover, setHover] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [decision, setDecision] = useState<'none' | 'approved' | 'changes'>('none');
  const [notesOpen, setNotesOpen] = useState(false);
  const [caption, setCaption] = useState(asset.caption);
  const textOnly = asset.type === 'Blog Post' || asset.type === 'Email';
  if (deleted) return null;

  return (
    <Card padding="none" style={{ overflow: 'visible', position: 'relative' }}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {/* media on top */}
        <div style={{ position: 'relative', ...(textOnly ? { height: 132 } : { aspectRatio: ASPECT[asset.type] ?? '4 / 5' }), overflow: 'hidden', borderRadius: '8px 8px 0 0', background: textOnly ? 'var(--dark-3)' : 'var(--dark-8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!textOnly && <img src={`https://picsum.photos/seed/dfy-${asset.id}-${seed}/480/300`} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          {!textOnly && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55))' }} />}
          {/* select-for-review checkbox, top-left (Plan step only) */}
          {selectable && (
            <span onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, display: 'inline-flex', transform: 'scale(1.75)', transformOrigin: 'top left' }}>
              <Checkbox checked={!!checked} onChange={(n) => onCheckedChange?.(n)} />
            </span>
          )}
          {/* hover actions: edit design · replace · regenerate · delete */}
          {!readOnly && (
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, display: 'flex', gap: 6, opacity: hover ? 1 : 0, transition: 'opacity 0.12s', pointerEvents: hover ? 'auto' : 'none' }}>
              <MiniBtn title="Edit design" onClick={() => setPanel(panel === 'edit' ? null : 'edit')}><Edit1 size={14} /></MiniBtn>
              <MiniBtn title="Replace" onClick={() => setPanel(panel === 'replace' ? null : 'replace')}><ImageArrows size={14} /></MiniBtn>
              <MiniBtn title="Regenerate" onClick={() => setSeed((s) => s + 1)}><ArrowRefresh size={14} /></MiniBtn>
              <MiniBtn title="Delete" onClick={() => setDeleted(true)}><Trash2 size={14} /></MiniBtn>
            </div>
          )}
          <Text variant="smallList" color={textOnly ? 'var(--dark-40)' : 'var(--light-100)'} style={{ position: 'relative', zIndex: 1, padding: '32px 16px 16px', textAlign: 'center', textShadow: textOnly ? 'none' : '0 1px 7px rgba(0,0,0,0.45)' }}>{textOnly ? asset.type : asset.overlay}</Text>
        </div>
        <div style={{ padding: 12 }}>
          {panel === 'edit' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <TextInput inputSize="sm" placeholder="Describe the change…" style={{ flex: 1 }} />
              <Button size="sm" onPress={() => setPanel(null)}>Apply</Button>
            </div>
          )}
          {panel === 'replace' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <Button variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => setPanel(null)}>Upload a file</Button>
              <Button variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => setPanel(null)}>Paste a link</Button>
            </div>
          )}
          {/* caption underneath */}
          <Text variant="metadata" color="var(--dark-40)" style={{ display: 'block', marginBottom: 2 }}>{asset.topic}</Text>
          <div style={{ margin: '0 0 8px' }}>
            {readOnly
              ? <Text variant="secondary" color="var(--dark-90)" style={{ display: 'block', lineHeight: 1.5 }}>{caption}</Text>
              : <HoverInput value={caption} onChange={setCaption} multiline placeholder="Caption…" style={{ fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.5, minHeight: 0 }} />}
          </div>
          {/* approve / request changes */}
          {readOnly ? null : decision === 'approved' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusPill tone="success">Approved</StatusPill>
              <Button variant="ghost" size="sm" onPress={() => setDecision('none')}>Undo</Button>
            </div>
          ) : decision === 'changes' ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <StatusPill tone="warning">Changes requested</StatusPill>
              <Button variant="ghost" size="sm" onPress={() => setNotesOpen(true)}>Edit notes</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              <span style={{ position: 'relative' }}>
                <Button variant="secondary" size="sm" onPress={() => setNotesOpen(true)}>Request changes</Button>
                {notesOpen && (
                  <>
                    <div onClick={() => setNotesOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 29 }} />
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, width: 300, zIndex: 30, background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <Text variant="label" color="var(--dark-60)">Request changes</Text>
                      {(['topic', 'caption', 'overlay'] as const).map((k) => (
                        <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <Text variant="metadata" color="var(--dark-60)">{k === 'overlay' ? 'Image / text overlay' : k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                          <TextArea value={fb[k]} onChange={(e) => setFb({ ...fb, [k]: e.target.value })} placeholder={`Notes on ${k}…`} style={{ minHeight: 46, fontSize: 13 }} />
                        </label>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 2 }}>
                        <Button variant="ghost" size="sm" onPress={() => setNotesOpen(false)}>Cancel</Button>
                        <Button size="sm" onPress={() => { setDecision('changes'); setNotesOpen(false); }}>Send notes</Button>
                      </div>
                    </div>
                  </>
                )}
              </span>
              <Button variant="secondary" size="sm" frontIcon={Check2} onPress={() => setDecision('approved')}>Approve</Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function MiniBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return <button title={title} onClick={onClick} style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, background: 'var(--light-90)', color: 'var(--dark-80)', backdropFilter: 'blur(4px)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>{children}</button>;
}
