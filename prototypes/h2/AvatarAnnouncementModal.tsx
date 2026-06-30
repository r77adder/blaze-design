import { useRef, useState, type ComponentType, type ReactNode, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Text, Heading, type StackModalProps } from '@/components';
import { Card, Toggle, Pill } from '@/staging';
import Check2 from '@/icons/20/Check2';
import ArrowRight from '@/icons/20/ArrowRight';
import Plus from '@/icons/20/Plus';
import Trash2 from '@/icons/20/Trash2';
import UserProfileAdd from '@/icons/20/UserProfileAdd';
import ChevronDown from '@/icons/20/ChevronDown';
import Instagram from '@/icons/20/Instagram';
import Facebook from '@/icons/20/Facebook';
import TikTok from '@/icons/20/TikTok';
import YouTube from '@/icons/20/YouTube';
import LinkedIn from '@/icons/20/LinkedIn';
import Twitter from '@/icons/20/Twitter';
import {
  AVATARS_SEED,
  AVATAR_OPTIONS,
  SelectionGrid,
  AvatarEditor,
  withSettingsDefaults,
  type AvatarProfile,
  type AvatarOption,
  type ExampleVideo,
} from './AvatarsTab';

/**
 * Announcement modal for the AI avatar video feature. Three screens inside a
 * single medium (888px) vetted Modal:
 *
 *   1. intro   — what the feature is + its benefits, primary CTA to turn it on
 *   2. avatars — the avatars that will appear in videos. Shows only the ones
 *                turned on, as the same portrait cards used on Content
 *                Settings → Video (hover for remove / customize, click to
 *                preview). Add more via the reused EntryChooser → SelectionGrid
 *                → AvatarEditor flow from AvatarsTab.
 *   3. allSet  — confirmation + deep links to where avatar content lives later.
 *
 * Opened from the DevStatePanel. Mirrors the lib-Modal multi-step pattern used
 * by MetaCampaignModal (consumer-owned `step` state, swap Modal.Content).
 */

type Step = 'intro' | 'avatars' | 'posting' | 'allSet';
// Sub-views inside the avatars step: the active list, the picker, the editor.
type AvatarView = 'list' | 'select' | 'edit';

export function AvatarAnnouncementModal({
  close,
  onComplete,
}: StackModalProps & { onComplete?: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('intro');

  // Working set of avatars for avatar videos — seeded from the existing library,
  // limited to the ones already turned on. No on/off toggle here: the list IS
  // the set of active avatars; remove with the hover trash, add with the button.
  const [avatars, setAvatars] = useState<AvatarProfile[]>(() =>
    AVATARS_SEED.filter((a) => a.enabled).slice(0, 3).map(withSettingsDefaults),
  );

  // Sub-flow state for the avatars step (mirrors AvatarsTab's CreateAvatarModal).
  const [view, setView] = useState<AvatarView>('list');
  const [draft, setDraft] = useState<AvatarProfile | null>(null);
  const [origin, setOrigin] = useState<'entry' | 'select'>('select');
  const [exampleVideos, setExampleVideos] = useState<ExampleVideo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Which card is currently previewing (mock voice/video playback).
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewAvatar = (id: string) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreviewingId((cur) => {
      if (cur === id) return null;
      previewTimer.current = setTimeout(() => setPreviewingId(null), 2200);
      return id;
    });
  };

  // ── avatars-step handlers ────────────────────────────────────────────────
  const pickFromLibrary = (option: AvatarOption) => {
    setDraft(
      withSettingsDefaults({
        id: `avatar-${Date.now()}`,
        name: option.name,
        imageUrl: option.imageUrl,
        summary: option.summary,
        ethnicity: option.ethnicity,
        toneOfVoice: option.toneOfVoice,
        accent: option.accent,
        visualDescription: option.visualDescription,
        personalCharacteristics: option.personalCharacteristics,
        enabled: true,
        videos: [],
        campaigns: [],
      }),
    );
    setExampleVideos(option.exampleVideos);
    setOrigin('select');
    setEditingId(null);
    setView('edit');
  };

  const startBlank = () => {
    setDraft(
      withSettingsDefaults({
        id: `avatar-${Date.now()}`,
        name: '',
        imageUrl: '',
        summary: '',
        ethnicity: '',
        toneOfVoice: '',
        accent: '',
        visualDescription: '',
        personalCharacteristics: '',
        enabled: true,
        videos: [],
        campaigns: [],
      }),
    );
    setExampleVideos([]);
    setOrigin('select');
    setEditingId(null);
    setView('edit');
  };

  const customizeExisting = (avatar: AvatarProfile) => {
    setDraft(avatar);
    setExampleVideos([]);
    setEditingId(avatar.id);
    setView('edit');
  };

  const removeAvatar = (id: string) => setAvatars((prev) => prev.filter((a) => a.id !== id));

  const saveDraft = () => {
    if (!draft) return;
    setAvatars((prev) =>
      editingId ? prev.map((a) => (a.id === editingId ? draft : a)) : [...prev, draft],
    );
    setDraft(null);
    setEditingId(null);
    setView('list');
  };

  const goToManage = (path: string) => {
    close();
    navigate(path);
  };

  // ── per-screen header title ───────────────────────────────────────────────
  const title =
    step === 'intro'
      ? 'Turn your topics into lifelike avatar videos'
      : step === 'posting'
        ? 'When and where to post'
        : step === 'allSet'
          ? 'AI avatar videos are on'
          : view === 'select'
            ? 'Choose an avatar'
            : view === 'edit'
              ? draft?.name || (editingId ? 'Customize avatar' : 'New avatar')
              : 'Avatars matched to your Brand Kit';

  // Subheadline sits in the header (tight under the title) on the screens that
  // have one, rather than floating in the body with a large gap.
  const subHeaderText =
    step === 'avatars' && view === 'list'
      ? 'Recommended for your brand. Click one to preview, hover to customize or remove, or add your own.'
      : step === 'posting'
        ? 'We recommend starting with 1 video per week — 20 credits/week. You can change this anytime.'
        : undefined;

  return (
    <Modal.Root size="md" onClose={close} onPressOutside={close} aria-label="AI avatar videos">
      <Modal.Header
        title={title}
        onClose={close}
        subHeader={
          subHeaderText ? (
            <Text variant="secondary" style={{ color: 'var(--dark-60)', fontWeight: 400 }}>
              {subHeaderText}
            </Text>
          ) : undefined
        }
      />

      <Modal.Content>
        {step === 'intro' && <IntroScreen />}

        {step === 'avatars' && view === 'list' && (
          <AvatarListView
            avatars={avatars}
            previewingId={previewingId}
            onPreview={previewAvatar}
            onCustomize={customizeExisting}
            onRemove={removeAvatar}
            onAdd={() => setView('select')}
          />
        )}
        {step === 'avatars' && view === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm" frontIcon={Plus} onClick={startBlank}>
                Create custom avatar
              </Button>
            </div>
            <SelectionGrid options={AVATAR_OPTIONS} onSelect={pickFromLibrary} />
          </div>
        )}
        {step === 'avatars' && view === 'edit' && draft && (
          <AvatarEditor
            draft={draft}
            onChange={setDraft}
            exampleVideos={exampleVideos}
            isBlank={!editingId && !draft.imageUrl}
            compact
          />
        )}

        {step === 'posting' && <PostingStep />}

        {step === 'allSet' && <AllSetScreen onManage={goToManage} />}
      </Modal.Content>

      {renderFooter()}
    </Modal.Root>
  );

  // ── footer (depends on step + sub-view) ───────────────────────────────────
  function renderFooter() {
    if (step === 'intro') {
      return (
        <Modal.Footer>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="primary" onPress={() => setStep('avatars')}>
              Turn On AI Avatar Videos
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      );
    }

    if (step === 'posting') {
      return (
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={() => setStep('avatars')}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="primary" onPress={() => setStep('allSet')}>
              Continue
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      );
    }

    if (step === 'allSet') {
      return (
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={() => setStep('posting')}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton
              variant="primary"
              onPress={() => {
                onComplete?.();
                close();
              }}
            >
              Done
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      );
    }

    // step === 'avatars' — footer varies by sub-view
    if (view === 'list') {
      return (
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton variant="ghost" onPress={() => setStep('intro')}>
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton
              variant="primary"
              onPress={() => setStep('posting')}
              isDisabled={avatars.length === 0}
            >
              {avatars.length > 0
                ? `Continue With ${avatars.length} Avatar${avatars.length === 1 ? '' : 's'}`
                : 'Add At Least One Avatar'}
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      );
    }

    if (view === 'edit') {
      return (
        <Modal.Footer>
          <Modal.FooterContent slot="left">
            <Modal.FooterButton
              variant="ghost"
              onPress={() => setView(editingId ? 'list' : origin)}
            >
              Back
            </Modal.FooterButton>
          </Modal.FooterContent>
          <Modal.FooterContent slot="right">
            <Modal.FooterButton variant="primary" onPress={saveDraft}>
              {editingId ? 'Save Changes' : 'Add To My Avatars'}
            </Modal.FooterButton>
          </Modal.FooterContent>
        </Modal.Footer>
      );
    }

    // view === 'select' — back to the active-avatars list
    return (
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={() => setView('list')}>
            Back
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    );
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Screen 1 — intro / benefits
// ───────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  'Studio-quality video from a script — generated in minutes, not days.',
  'Consistent, on-brand presenters across every campaign.',
  'Pick from a library of avatars or upload your own.',
  'Added to your organic and paid campaigns automatically.',
];

function IntroScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* hero — avatar collage */}
      <div style={{ display: 'flex', gap: 10 }}>
        {AVATAR_OPTIONS.slice(0, 4).map((a) => (
          <div
            key={a.id}
            style={{
              flex: 1,
              aspectRatio: '3 / 4',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--dark-4)',
            }}
          >
            <img
              src={a.imageUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {BENEFITS.map((b) => (
          <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span
              style={{
                flexShrink: 0,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--dark-4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              <Check2 size={14} color="var(--dark-90)" />
            </span>
            <Text variant="primary">{b}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Screen 2 (list view) — active avatars as Content-Settings-style cards
// ───────────────────────────────────────────────────────────────────────────

function AvatarListView({
  avatars,
  previewingId,
  onPreview,
  onCustomize,
  onRemove,
  onAdd,
}: {
  avatars: AvatarProfile[];
  previewingId: string | null;
  onPreview: (id: string) => void;
  onCustomize: (avatar: AvatarProfile) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        {avatars.map((a) => (
          <AvatarTile
            key={a.id}
            avatar={a}
            previewing={previewingId === a.id}
            onPreview={() => onPreview(a.id)}
            onCustomize={() => onCustomize(a)}
            onRemove={() => onRemove(a.id)}
          />
        ))}
      </div>

      <div>
        <Button variant="secondary" size="sm" frontIcon={Plus} onClick={onAdd}>
          Add Avatar
        </Button>
      </div>
    </div>
  );
}

/**
 * Portrait avatar card matching Content Settings → Video. Click previews;
 * hover reveals a trash (remove) and a tertiary Customize button.
 */
function AvatarTile({
  avatar,
  previewing,
  onPreview,
  onCustomize,
  onRemove,
}: {
  avatar: AvatarProfile;
  previewing: boolean;
  onPreview: () => void;
  onCustomize: () => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      interactive
      padding="none"
      onClick={onPreview}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          backgroundImage: avatar.imageUrl ? `url('${avatar.imageUrl}')` : undefined,
          backgroundColor: 'var(--dark-4)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* centered play / pause — always visible so the avatar reads as playable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            background: previewing ? 'rgba(0,0,0,0.28)' : 'transparent',
            transition: 'background 160ms ease',
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
            }}
          >
            {previewing ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1.2" />
                <rect x="14" y="5" width="4" height="14" rx="1.2" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5Z" />
              </svg>
            )}
          </span>
        </div>

        {/* hover controls */}
        {hovered && (
          <>
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button
                variant="secondary"
                size="sm"
                frontIcon={Trash2}
                aria-label={`Remove ${avatar.name || 'avatar'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                Remove
              </Button>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                padding: '28px 8px 10px',
                display: 'flex',
                justifyContent: 'center',
                background: 'linear-gradient(to top, rgba(255,255,255,0.96), rgba(255,255,255,0))',
              }}
            >
              <span
                style={{
                  background: 'var(--light-100)',
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                }}
              >
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCustomize();
                  }}
                >
                  Customize
                </Button>
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Heading level={5} lineClamp={1}>
          {avatar.name || 'Untitled avatar'}
        </Heading>
        {avatar.summary && (
          <Text variant="secondary" lineClamp={1} style={{ color: 'var(--dark-60)' }}>
            {avatar.summary}
          </Text>
        )}
      </div>
    </Card>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Posting step — schedule, time, cadence, and crosspost channels
// (matches the Content Settings "Feed posts" layout)
// ───────────────────────────────────────────────────────────────────────────

const POSTING_CHANNELS: {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  on: boolean;
}[] = [
  { key: 'instagram', label: 'Connect Instagram', icon: Instagram, on: true },
  { key: 'facebook', label: 'Connect Facebook', icon: Facebook, on: true },
  { key: 'tiktok', label: 'Connect TikTok', icon: TikTok, on: true },
  { key: 'youtube', label: 'Connect YouTube', icon: YouTube, on: false },
  { key: 'linkedin', label: 'Connect LinkedIn', icon: LinkedIn, on: true },
  { key: 'x', label: 'Connect X / Twitter', icon: Twitter, on: false },
];

function PostingStep() {
  const [postsPerWeek, setPostsPerWeek] = useState(1);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(POSTING_CHANNELS.map((c) => [c.key, c.on])),
  );
  const [customizing, setCustomizing] = useState(false);
  const enabledChannels = POSTING_CHANNELS.filter((c) => enabled[c.key]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Schedule controls */}
      <div
        style={{
          paddingBottom: 8,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 32,
          flexWrap: 'wrap',
        }}
      >
        <ControlField label="Days to post">
          <ControlPill>Weekdays</ControlPill>
        </ControlField>
        <ControlField label="Posts per week">
          <Stepper
            value={postsPerWeek}
            onDecrease={() => setPostsPerWeek((v) => Math.max(1, v - 1))}
            onIncrease={() => setPostsPerWeek((v) => Math.min(7, v + 1))}
          />
        </ControlField>
      </div>

      {/* Crosspost channels — collapsed to pills, "Customize" reveals the full list */}
      <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
        >
          <Heading level={5} color="var(--dark-90)">
            Accounts to crosspost to
          </Heading>
          <Button variant="secondary" size="sm" onClick={() => setCustomizing((v) => !v)}>
            {customizing ? 'Done' : 'Customize'}
          </Button>
        </div>

        {customizing ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {POSTING_CHANNELS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    borderTop: '1px solid var(--dark-4)',
                  }}
                >
                  <Icon size={24} />
                  <div style={{ flex: 1 }}>
                    <Button
                      variant="tertiary"
                      size="sm"
                      frontIcon={UserProfileAdd}
                      onClick={() => {}}
                    >
                      {c.label}
                    </Button>
                  </div>
                  <Toggle
                    checked={enabled[c.key]}
                    onChange={(v) => setEnabled((prev) => ({ ...prev, [c.key]: v }))}
                  />
                </div>
              );
            })}
            <div style={{ marginTop: 12 }}>
              <Button variant="secondary" size="sm" frontIcon={UserProfileAdd}>
                New Account
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {enabledChannels.length === 0 ? (
              <Text variant="secondary" style={{ color: 'var(--dark-60)' }}>
                No accounts yet — customize to add some.
              </Text>
            ) : (
              enabledChannels.map((c) => {
                const Icon = c.icon;
                return (
                  <Pill key={c.key} size="xl" style={{ gap: 8 }}>
                    <Icon size={20} />
                    {c.label.replace('Connect ', '')}
                  </Pill>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ControlField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading level={5} color="var(--dark-90)">
        {label}
      </Heading>
      {children}
    </div>
  );
}

function ControlPill({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 44,
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        padding: '0 12px 0 16px',
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'inherit',
        color: 'var(--dark-90)',
        background: 'var(--light-100)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
      }}
    >
      {children}
      <ChevronDown size={16} color="var(--dark-60)" />
    </button>
  );
}

function Stepper({
  value,
  onDecrease,
  onIncrease,
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const btn: CSSProperties = {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: '0 16px',
    height: 44,
    fontSize: 18,
    color: 'var(--dark-80)',
    lineHeight: 1,
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 44,
        border: '1px solid var(--dark-8)',
        borderRadius: 8,
        background: 'var(--light-100)',
      }}
    >
      <button type="button" aria-label="Decrease" onClick={onDecrease} style={btn}>
        −
      </button>
      <span
        style={{
          minWidth: 32,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: 500,
          color: 'var(--dark-90)',
        }}
      >
        {value}
      </span>
      <button type="button" aria-label="Increase" onClick={onIncrease} style={btn}>
        +
      </button>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Screen 3 — all set + manage links
// ───────────────────────────────────────────────────────────────────────────

const MANAGE_LINKS: { label: string; hint: string; path: string }[] = [
  { label: 'Avatars', hint: 'Add, edit, or remove avatars', path: '/h2/content-settings' },
  { label: 'Content Settings', hint: 'Posting schedule, channels, and more', path: '/h2/content-settings' },
  { label: 'Campaigns', hint: 'See where avatar videos appear', path: '/h2/campaigns' },
  { label: 'Create a post', hint: 'Make a one-off avatar video now', path: '/h2/organic-social' },
];

function AllSetScreen({ onManage }: { onManage: (path: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          paddingTop: 8,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--green-10)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Check2 size={20} color="var(--green)" />
        </span>
        <Text variant="primary" style={{ display: 'block', maxWidth: 460 }}>
          From now on, avatar content will be added to your future campaigns automatically — change
          your avatars or campaigns anytime.
        </Text>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MANAGE_LINKS.map((link) => (
          <button
            key={link.path}
            type="button"
            onClick={() => onManage(link.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              border: '1px solid var(--dark-8)',
              borderRadius: 10,
              background: 'var(--light-100)',
              cursor: 'pointer',
              font: 'inherit',
              textAlign: 'left',
              transition: 'border-color 160ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--dark-8)';
            }}
          >
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Heading level={5}>{link.label}</Heading>
              <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-60)' }}>
                {link.hint}
              </Text>
            </div>
            <ArrowRight size={16} color="var(--dark-40)" />
          </button>
        ))}
      </div>
    </div>
  );
}
