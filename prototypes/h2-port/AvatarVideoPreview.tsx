import { useState } from 'react';
import { Button, useModals } from '@/components';
import { ArrowLeft, ArrowRight, Approvals as ApprovalsIcon } from '@/icons/20';
import { ScriptSettingsModal, makeAvatarDraft, type NewPostDraft, type ContentTypeId } from './CreatePostFlow';

/**
 * Full-screen content preview for an AI Avatar Video calendar card.
 *
 * Opened from the OrganicSocial calendar when an `avatar-video` post is clicked.
 * Mirrors the post-review layout (left = Blaze suggestions, center = 9:16 video
 * preview, right = posting details + Quick Edits + Redesign). The Redesign
 * section's "Regenerate Video" launches the shared Script & Settings modal in
 * `regenerate` mode (CTA = "Regenerate AI Avatar Video" + credits).
 */

const F = "'Sohne', sans-serif";

interface PreviewPost {
  title: string;
  time: string;
  thumb: string | null;
  source: string;
  status: 'scheduled' | 'draft' | 'review' | 'approved';
}

// Section eyebrow — sentence/title case per the H2 no-all-caps rule.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--dark-40)', fontFamily: F, letterSpacing: '0.22px' }}>
      {children}
    </p>
  );
}

// The 9:16 avatar-video frame with social overlays.
function VideoFrame({ face, caption }: { face: string | null; caption: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 250,
        aspectRatio: '9 / 16',
        borderRadius: 14,
        overflow: 'hidden',
        background: 'var(--dark-90)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
    >
      {face && (
        <img src={face} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      {/* bottom scrim for caption legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.7) 100%)',
        }}
      />
      {/* play badge */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 52,
          height: 52,
          borderRadius: 99,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
      </div>
      {/* right-side social action rail */}
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 70,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#fff',
          alignItems: 'center',
        }}
      >
        {['♡', '○', '⤴'].map((ic) => (
          <span key={ic} style={{ fontSize: 20, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{ic}</span>
        ))}
      </div>
      {/* caption */}
      <div style={{ position: 'absolute', left: 12, right: 48, bottom: 14 }}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#fff', fontFamily: F, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {caption}
        </p>
      </div>
    </div>
  );
}

export function AvatarVideoPreview({
  post,
  onClose,
  contentType = 'ai-avatar',
}: {
  post: PreviewPost;
  onClose: () => void;
  contentType?: ContentTypeId;
}) {
  const { openModal } = useModals();
  const [chatInput, setChatInput] = useState('');
  // One draft seeds the modal; edits there flow back so the preview reflects them.
  // contentType keys the regenerate CTA/label to the video format.
  const [draft, setDraft] = useState<NewPostDraft>(() => makeAvatarDraft({ contentType }));

  const openRegenerate = () =>
    openModal(ScriptSettingsModal, {
      draft,
      mode: 'regenerate',
      onChange: (next: NewPostDraft) => setDraft(next),
    });

  const suggestions = [
    { emoji: '🎬', label: 'Change the hook', detail: '"open with the finished exterior, then cut to prep"' },
    { emoji: '🗣️', label: 'Adjust the script', detail: '"make the intro shorter and punchier"' },
    { emoji: '🧑', label: 'Swap the avatar', detail: '"use Devin, the crew foreman, instead"' },
    { emoji: '🎵', label: 'Add background audio', detail: '"upbeat, low-key under the voiceover"' },
    { emoji: '🔤', label: 'Restyle captions', detail: '"bigger karaoke-style captions"' },
  ];

  const accounts = [
    { name: 'Instagram', connected: false },
    { name: 'TikTok', connected: true },
    { name: 'YouTube', connected: true },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#f4f5f5', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ── */}
      <div style={{ height: 52, flexShrink: 0, background: 'var(--light-100)', borderBottom: '1px solid var(--dark-8)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Button variant="ghost" size="sm" square frontIcon={ArrowLeft} onPress={onClose} aria-label="Back to calendar" />
          <span style={{ fontSize: 14, color: 'var(--dark-80)', fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
            {post.title}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500, fontFamily: F, color: '#1c7d3f', background: 'rgba(4,175,0,0.12)' }}>
            Approved
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <Button variant="ghost" size="sm" frontIcon={ArrowLeft} isDisabled>Previous</Button>
          <Button variant="secondary" size="sm" onPress={onClose}>Don't Post</Button>
          <Button variant="secondary" size="sm" frontIcon={ApprovalsIcon} onPress={onClose}>Remove approval</Button>
          <Button variant="ghost" size="sm" endIcon={ArrowRight} isDisabled>Next</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ width: 28, height: 28, borderRadius: 99, background: '#5b2d6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontFamily: F }}>S</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left — Blaze suggestions */}
        <div style={{ width: 280, flexShrink: 0, background: 'var(--light-100)', borderRight: '1px solid var(--dark-8)', display: 'flex', flexDirection: 'column', padding: '20px 20px 0', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--dark-80)', fontFamily: F, lineHeight: 1.5 }}>Blaze can improve this video by:</p>
          <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {suggestions.map((s, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--dark-80)', fontFamily: F, lineHeight: 1.5 }}>
                <span style={{ marginRight: 4 }}>{s.emoji}</span>
                <strong style={{ fontWeight: 500, color: 'var(--dark-90)' }}>{s.label}</strong>
                {': '}
                <span style={{ color: 'var(--dark-60)' }}>{s.detail}</span>
              </li>
            ))}
          </ol>
          <p style={{ margin: '20px 0 12px', fontSize: 13, color: 'var(--dark-80)', fontFamily: F }}>What would you like to do?</p>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: '1px solid var(--dark-8)', paddingTop: 12, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--dark-8)', borderRadius: 8, padding: '8px 10px', background: 'var(--light-100)' }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Blaze to change something..."
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: 'var(--dark-90)', fontFamily: F, background: 'transparent' }}
              />
              <button style={{ width: 26, height: 26, borderRadius: 99, border: 'none', background: 'var(--dark-90)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Center — video preview */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, overflowY: 'auto' }}>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'absolute', right: '100%', top: 0, marginRight: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--dark-40)', fontFamily: F }}>View as</span>
              {accounts.map((a, i) => (
                <div key={a.name} style={{ width: 30, height: 30, borderRadius: 99, background: i === 0 ? 'var(--dark-90)' : 'var(--dark-4)', color: i === 0 ? '#fff' : 'var(--dark-60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: F }}>
                  {a.name.slice(0, 2)}
                </div>
              ))}
            </div>
            <VideoFrame face={draft.refImage} caption={draft.script ?? post.title} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: 'var(--light-100)', borderRadius: 99, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid var(--dark-8)' }}>
              <span style={{ fontSize: 13, color: 'var(--dark-80)', fontFamily: F }}>Do you like the result?</span>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>👎</button>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>👍</button>
              <Button variant="secondary" size="sm" onPress={onClose}>Close</Button>
            </div>
          </div>
        </div>

        {/* Right — posting details */}
        <div style={{ width: 230, flexShrink: 0, background: 'var(--light-100)', borderLeft: '1px solid var(--dark-8)', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <Eyebrow>Posting on</Eyebrow>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', fontFamily: F }}>{post.time}</p>
          </div>
          <div style={{ height: 1, background: 'var(--dark-8)' }} />
          <div>
            <Eyebrow>Posting to</Eyebrow>
            {accounts.map((acct) => (
              <div key={acct.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--dark-90)', fontFamily: F }}>{acct.name}</span>
                {acct.connected ? (
                  <div style={{ width: 18, height: 18, borderRadius: 99, background: 'var(--dark-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--dark-40)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                ) : (
                  <Button variant="secondary" size="xs" onPress={() => {}}>Connect</Button>
                )}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--dark-8)' }} />
          <div>
            <Eyebrow>Campaign</Eyebrow>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--dark-90)', fontFamily: F }}>{post.source}</p>
          </div>
          <div style={{ height: 1, background: 'var(--dark-8)' }} />
          <div>
            <Eyebrow>Quick Edits</Eyebrow>
            {[
              { icon: '✏️', label: 'Adjust Caption' },
              { icon: '🔒', label: 'Adjust Privacy Settings' },
              { icon: '🎵', label: 'Add Audio' },
            ].map((item) => (
              <button key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 4 }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--dark-90)', fontFamily: F }}>{item.label}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--dark-8)' }} />
          <div>
            <Eyebrow>Redesign</Eyebrow>
            <button onClick={openRegenerate} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: 8, textAlign: 'left' }}>
              <span style={{ fontSize: 16, lineHeight: 1.2 }}>↻</span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--dark-90)', fontFamily: F }}>Regenerate video</div>
                <div style={{ fontSize: 12, color: 'var(--dark-40)', fontFamily: F }}>Edit script and style before generating</div>
              </div>
            </button>
            <button style={{ display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', textAlign: 'left' }}>
              <span style={{ fontSize: 16, lineHeight: 1.2 }}>🎞</span>
              <div>
                <div style={{ fontSize: 13, color: 'var(--dark-90)', fontFamily: F }}>Replace with Video</div>
                <div style={{ fontSize: 12, color: 'var(--dark-40)', fontFamily: F }}>Swap video with your own</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
