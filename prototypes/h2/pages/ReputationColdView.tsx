import { useState } from 'react';
import { Button, Heading, Modal, Text } from '@/components';
import type { StackModalProps } from '@/components';
import {
  ArrowLeft,
  ArrowRight,
  Facebook,
  Google,
  Instagram,
  TikTok,
} from '@/icons/20';
import { StatusPill, TextField, useToast } from '@/staging';
import { useDevState } from '../dev-state-context';

/**
 * /h2/reputation — cold (pre-setup) state.
 *
 * Mirrors the SEO/AEO cold-state landing format: a centered hero with a single
 * primary CTA, a "How Blaze does it" three-card row, a collapsible explainer,
 * and a DFY upsell banner. The primary CTA (and the banner CTA) open a
 * connection modal where the user wires up their review/social sources;
 * connecting at least one and confirming flips the page to `steady`.
 *
 * Rendered inside <H2Layout> by ReputationRouteInner (which sits inside a
 * <ModalStack>), so this returns content only and can use the openModal stack.
 */

/**
 * Two connection models:
 * - `oauth`  — Google Business Profile & Facebook connect via OAuth, which
 *   lives in account settings. The row exposes a "Manage in settings" button.
 * - `paste`  — review sites (Yelp/Angi/Thumbtack/BBB) and Reddit have no API,
 *   so the user pastes a profile URL (or, for Reddit, comma-separated brand
 *   terms) and Blaze scrapes mentions from there.
 */
type SourceKind = 'oauth' | 'paste';

interface SourceDef {
  key: string;
  label: string;
  kind: SourceKind;
  /** paste-kind only */
  placeholder?: string;
  /** paste-kind only — helper text under the field */
  note?: string;
  /** paste-kind only — when 'url', the value must be a valid http(s) URL. */
  validate?: 'url';
  /** paste-kind only — pre-filled into the field (inferred profile URL). */
  defaultValue?: string;
}

// Data sources confirmed by Luke. Reputation::Review is sourced from nine
// platforms (OAuth where there's an API; pasted profile URL or brand terms
// where there isn't). Reputation::Mention is social-listening across the web.
const SOURCES: SourceDef[] = [
  { key: 'google', label: 'Google Business Profile', kind: 'oauth' },
  { key: 'yelp', label: 'Yelp', kind: 'paste', placeholder: 'https://www.yelp.com/biz/your-business', validate: 'url', defaultValue: 'https://www.yelp.com/biz/certapro-painters-of-austin' },
  {
    key: 'reddit',
    label: 'Reddit',
    kind: 'paste',
    placeholder: 'Acme Plumbing, Acme Inc',
    note: "Comma-separated. We'll pull Reddit posts mentioning any of these terms.",
  },
  { key: 'facebook', label: 'Facebook', kind: 'oauth' },
  { key: 'instagram', label: 'Instagram', kind: 'oauth' },
  { key: 'tiktok', label: 'TikTok', kind: 'oauth' },
  { key: 'angi', label: 'Angi', kind: 'paste', placeholder: 'https://www.angi.com/companylist/...', validate: 'url', defaultValue: 'https://www.angi.com/companylist/us/tx/austin/certapro-painters-reviews.htm' },
  { key: 'thumbtack', label: 'Thumbtack', kind: 'paste', placeholder: 'https://www.thumbtack.com/.../service/...', validate: 'url', defaultValue: 'https://www.thumbtack.com/tx/austin/painting/certapro-painters' },
  { key: 'bbb', label: 'BBB', kind: 'paste', placeholder: 'https://www.bbb.org/.../customer-reviews', validate: 'url', defaultValue: 'https://www.bbb.org/us/tx/austin/profile/painting-contractors/certapro-painters' },
];

/** A value counts as a URL only if it parses and uses http(s). */
function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Brand logomarks (Angi/Thumbtack/BBB) shipped as static SVGs under
// public/more_brand_icons. Filenames contain spaces + commas, so encode them.
const BRAND_ICON_FILES: Record<string, string> = {
  angi: 'Logomark=Angi, White=OFF, Filled=OFF.svg',
  bbb: 'Logomark=BBB, White=OFF, Filled=OFF.svg',
  thumbtack: 'Logomark=Thumbtack, White=OFF, Filled=OFF.svg',
};

function brandIconSrc(file: string): string {
  // encodeURI (not encodeURIComponent) so the '=' and ',' in the filenames
  // stay literal — Vite's static server matches the raw name and only the
  // spaces need escaping.
  return encodeURI(`${import.meta.env.BASE_URL}more_brand_icons/${file}`);
}

/** Brand mark in a 36px tile. Google/Facebook/Instagram/TikTok use vetted
 *  icons; Yelp and Reddit use their public favicons; Angi/Thumbtack/BBB use the
 *  brand logomark SVGs. Anything else falls back to a first-letter monogram. */
function SourceMark({ source, label }: { source: string; label: string }) {
  const size = 18;
  let inner;
  let monogram = false;
  if (source === 'google') inner = <Google width={size} height={size} />;
  else if (source === 'facebook') inner = <Facebook width={size} height={size} />;
  else if (source === 'instagram') inner = <Instagram width={size} height={size} />;
  else if (source === 'tiktok') inner = <TikTok width={size} height={size} />;
  else if (source === 'yelp')
    inner = <img src="https://www.yelp.com/favicon.ico" alt="" width={size} height={size} style={{ borderRadius: 3, display: 'block' }} />;
  else if (source === 'reddit')
    inner = <img src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png" alt="" width={size} height={size} style={{ borderRadius: 3, display: 'block' }} />;
  else if (BRAND_ICON_FILES[source])
    inner = <img src={brandIconSrc(BRAND_ICON_FILES[source])} alt="" width={size} height={size} style={{ borderRadius: 3, display: 'block' }} />;
  else {
    monogram = true;
    inner = (
      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--light-100)' }}>
        {label.charAt(0).toUpperCase()}
      </span>
    );
  }

  const isMonogram = monogram;
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: isMonogram ? 'var(--dark-90)' : 'var(--dark-4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {inner}
    </div>
  );
}

/** Sources grouped by what Blaze pulls from them. Drives the setup-page layout. */
interface SourceGroup {
  title: string;
  description: string;
  keys: string[];
}

const SOURCE_GROUPS: SourceGroup[] = [
  {
    title: 'Reviews',
    description: 'Star ratings and written reviews from the sites customers check before they hire.',
    keys: ['google', 'yelp', 'angi', 'thumbtack', 'bbb'],
  },
  {
    title: 'Comments',
    description: 'Comments and DMs on your social profiles.',
    keys: ['facebook', 'instagram', 'tiktok'],
  },
  {
    title: 'Mentions',
    description: 'Conversations about your brand across the web, with sentiment.',
    keys: ['reddit'],
  },
];

const SOURCE_BY_KEY: Record<string, SourceDef> = Object.fromEntries(SOURCES.map((s) => [s.key, s]));

/** One source row — brand tile, label + status pill, and either the OAuth
 *  Connect button or the paste field + Save. Shared by the modal and the
 *  setup page. */
function SourceRow({
  row,
  isConnected,
  value,
  showDivider,
  onChangeValue,
  onSave,
  onOauthConnect,
}: {
  row: SourceDef;
  isConnected: boolean;
  value: string;
  showDivider: boolean;
  onChangeValue: (v: string) => void;
  onSave: () => void;
  onOauthConnect: () => void;
}) {
  const isPaste = row.kind === 'paste';
  const connectedLabel = isPaste ? 'Added' : 'Connected';
  const requiresUrl = row.validate === 'url';
  const urlInvalid = requiresUrl && value.trim().length > 0 && !isValidUrl(value);
  const canSave = value.trim().length > 0 && (!requiresUrl || isValidUrl(value));

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 0',
        borderTop: showDivider ? '1px solid var(--dark-8)' : 'none',
      }}
    >
      <SourceMark source={row.key} label={row.label} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Label + right-side action/status. No pill when not connected;
            once connected (or set up), a green pill sits on the right. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 36 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>{row.label}</span>
          {isConnected ? (
            <div style={{ marginLeft: 'auto' }}>
              <StatusPill tone="success" size="sm">{connectedLabel}</StatusPill>
            </div>
          ) : row.kind === 'oauth' ? (
            <div style={{ marginLeft: 'auto' }}>
              <Button variant="secondary" size="sm" onPress={onOauthConnect}>
                Connect
              </Button>
            </div>
          ) : null}
        </div>

        {/* Paste sources take a profile URL (or, for Reddit, terms) */}
        {row.kind === 'paste' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <TextField
                fullWidth
                size="sm"
                placeholder={row.placeholder}
                value={value}
                invalid={urlInvalid}
                onChange={onChangeValue}
              />
              {!isConnected && (
                <Button variant="secondary" size="sm" isDisabled={!canSave} onPress={onSave}>
                  Save
                </Button>
              )}
            </div>
            {urlInvalid ? (
              <div style={{ fontSize: 12, color: 'var(--red-90)', marginTop: 6 }}>
                Enter a full URL, including https://
              </div>
            ) : (
              row.note && (
                <div style={{ fontSize: 12, color: 'var(--dark-60)', marginTop: 6 }}>{row.note}</div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Shared connect-state hook: tracks connected sources + paste values and the
 *  two ways to connect (OAuth handshake vs. saving a URL/terms). */
function useConnectState(initialConnected?: string[], onConnect?: (key: string) => void) {
  const { showToast } = useToast();
  const [connected, setConnected] = useState<Set<string>>(() => new Set(initialConnected ?? []));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(SOURCES.filter((s) => s.defaultValue).map((s) => [s.key, s.defaultValue!])),
  );

  const save = (key: string, label: string) => {
    setConnected((prev) => new Set(prev).add(key));
    onConnect?.(key);
    showToast({ message: `${label} saved` });
  };
  const connectOauth = (key: string, label: string) => {
    showToast({ message: `Redirecting to ${label} to authorize…` });
    setConnected((prev) => new Set(prev).add(key));
    onConnect?.(key);
  };

  return { connected, values, setValues, save, connectOauth };
}

/** Connection modal — vetted Modal stack. OAuth sources connect via an OAuth
 *  handshake; paste sources take a URL or brand terms.
 *
 *  Reused in two places:
 *  - Cold state: starts empty, "Set Up Reputation" lands on the connected page.
 *  - Steady/connected header: seeded with already-connected sources via
 *    `initialConnected`, reports new connections through `onConnect`, and uses
 *    a "Done" finish label to just close. */
export function ConnectSourcesModal({
  close,
  onFinish,
  initialConnected,
  onConnect,
  finishLabel = 'Set Up Reputation',
}: StackModalProps & {
  onFinish: () => void;
  initialConnected?: string[];
  onConnect?: (key: string) => void;
  finishLabel?: string;
}) {
  const { connected, values, setValues, save, connectOauth } = useConnectState(initialConnected, onConnect);
  const connectedCount = connected.size;

  return (
    <Modal.Root size="sm" aria-labelledby="connect-sources-title" data-testid="connect-sources-modal">
      <Modal.Header
        title="Connect your review & social sources"
        id="connect-sources-title"
        onClose={close}
        subHeader={
          <Text variant="secondary" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
            Pull in reviews, comments, and DMs so Blaze can triage what needs attention, draft
            replies, and track sentiment over time.
          </Text>
        }
      />
      <Modal.Content>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SOURCES.map((row, i) => (
            <SourceRow
              key={row.key}
              row={row}
              isConnected={connected.has(row.key)}
              value={values[row.key] ?? ''}
              showDivider={i > 0}
              onChangeValue={(v) => setValues((prev) => ({ ...prev, [row.key]: v }))}
              onSave={() => save(row.key, row.label)}
              onOauthConnect={() => connectOauth(row.key, row.label)}
            />
          ))}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <span style={{ fontSize: 12, color: 'var(--dark-60)' }}>
            {connectedCount === 0
              ? 'Connect at least one source to get started'
              : `${connectedCount} source${connectedCount === 1 ? '' : 's'} connected`}
          </span>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" isDisabled={connectedCount === 0} onPress={onFinish}>
            {finishLabel}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

/** Full-page connect flow — sources grouped by what they pull in. Used in two
 *  places:
 *  - Cold setup: `onFinish`/`onBack` provided → renders the sticky proceed
 *    footer (Back + "Set Up Reputation").
 *  - "Manage Accounts" tab: seeded with `initialConnected`, reports new
 *    connections via `onConnect`, and renders no footer (each source saves on
 *    its own; switching tabs is the exit). */
export function ConnectSourcesPage({
  title = 'Connect your sources',
  subhead = 'Pull in reviews, comments, and DMs so Blaze can triage what needs attention, draft replies, and track sentiment over time.',
  initialConnected,
  onConnect,
  onFinish,
  onBack,
}: {
  title?: string;
  subhead?: string;
  initialConnected?: string[];
  onConnect?: (key: string) => void;
  onFinish?: () => void;
  onBack?: () => void;
}) {
  const { connected, values, setValues, save, connectOauth } = useConnectState(initialConnected, onConnect);
  const connectedCount = connected.size;
  const showFooter = !!onFinish;

  return (
    <>
      <div style={{ width: '100%', maxWidth: 720, margin: '0 auto', padding: showFooter ? '40px 28px 112px' : '40px 28px 48px' }}>
        <Heading level={1} style={{ marginBottom: 8 }}>
          {title}
        </Heading>
        <Text variant="secondary" style={{ display: 'block', lineHeight: 1.6, maxWidth: 560 }}>
          {subhead}
        </Text>

        {SOURCE_GROUPS.map((group) => (
          <section key={group.title} style={{ marginTop: 28 }}>
            <Heading level={4} style={{ marginBottom: 2 }}>
              {group.title}
            </Heading>
            <Text variant="secondary" style={{ display: 'block', color: 'var(--dark-60)', marginBottom: 12 }}>
              {group.description}
            </Text>
            <div style={{ border: '1px solid var(--dark-8)', borderRadius: 12, padding: '0 16px', background: 'var(--light-100)' }}>
              {group.keys.map((k, i) => {
                const row = SOURCE_BY_KEY[k];
                return (
                  <SourceRow
                    key={k}
                    row={row}
                    isConnected={connected.has(k)}
                    value={values[k] ?? ''}
                    showDivider={i > 0}
                    onChangeValue={(v) => setValues((prev) => ({ ...prev, [k]: v }))}
                    onSave={() => save(k, row.label)}
                    onOauthConnect={() => connectOauth(k, row.label)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Fixed proceed footer — matches the SEO/AEO cold-state setup flow.
          Back sits on the left; the prompt sits next to the primary CTA.
          Only shown in the cold setup flow, not the "Manage Accounts" tab. */}
      {showFooter && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 238,
            right: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '16px 28px',
            background: 'var(--light-100)',
            borderTop: '1px solid var(--dark-8)',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {onBack ? (
            <Button variant="tertiary" size="sm" frontIcon={ArrowLeft} onPress={onBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>
              {connectedCount === 0
                ? 'Connect at least one source to get started'
                : `${connectedCount} source${connectedCount === 1 ? '' : 's'} connected`}
            </span>
            <Button variant="primary" size="lg" isDisabled={connectedCount === 0} onPress={onFinish}>
              Set Up Reputation
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function ReputationColdView() {
  const { showToast } = useToast();
  const { setState } = useDevState();
  const [step, setStep] = useState<'landing' | 'setup'>('landing');

  // Cold setup is a full page (not a modal): the hero CTA advances to it,
  // and finishing lands on the connected (monitoring, no data yet) state.
  if (step === 'setup') {
    return (
      <ConnectSourcesPage
        onBack={() => setStep('landing')}
        onFinish={() => {
          setState('/h2/reputation', 'steady');
          showToast({ message: 'Reputation is live — monitoring your sources' });
        }}
      />
    );
  }

  const openConnect = () => setStep('setup');

  const cards: { title: string; desc: string }[] = [
    {
      title: 'Connect every source',
      desc: 'Pull in Google, Yelp, Facebook, Instagram, and TikTok reviews, comments, and DMs — all in one inbox.',
    },
    {
      title: 'Draft replies instantly',
      desc: 'Blaze writes on-brand responses ready for your approval, and auto-replies to the high-confidence ones.',
    },
    {
      title: 'Protect your reputation',
      desc: 'Track sentiment over time, catch issues early, and surface what needs a human before it spreads.',
    },
  ];

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '20px 28px 60px' }}>
      {/* Hero — boxed on a light-gray surface (like the AI Receptionist cold
          state). Left-aligned copy + CTA on the left, visual on the right. */}
      <div
        style={{
          background: 'var(--dark-3)',
          borderRadius: 16,
          padding: '40px 48px 40px 72px',
          display: 'flex',
          alignItems: 'center',
          gap: 48,
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Heading level={1} style={{ marginBottom: 14 }}>
            Stay on top of every review and mention
          </Heading>
          <Text variant="secondary" style={{ display: 'block', lineHeight: 1.65, marginBottom: 28, maxWidth: 600 }}>
            Blaze pulls your reviews, comments, and DMs into one place, triages what needs attention, and drafts on-brand replies — so nothing slips through the cracks.
          </Text>
          <Button variant="primary" size="lg" endIcon={ArrowRight} onPress={openConnect}>
            Connect your sources
          </Button>
        </div>
        <div style={{ flex: '0 0 460px', maxWidth: 460 }}>
          <img
            src={`${import.meta.env.BASE_URL}reputation_background.png`}
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16 }}
          />
        </div>
      </div>

      {/* Value props */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {cards.map(({ title, desc }, i) => (
            <div key={title} style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12, padding: '20px 18px' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--dark-8)',
                  color: 'var(--dark-60)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 14,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', marginBottom: 6, lineHeight: 1.3 }}>{title}</div>
              <div style={{ fontSize: 14, color: 'var(--dark-60)', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DFY upsell — photo bleeds above the banner */}
      <div
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 20,
          borderRadius: 12,
          padding: '18px 24px 18px 124px',
          minHeight: 88,
          background: 'linear-gradient(100deg, #b9d9f4 0%, #d6e9f8 55%, #e7f1fa 100%)',
        }}
      >
        <div
          role="img"
          aria-label=""
          style={{
            position: 'absolute', left: 4, bottom: 0,
            width: 116, height: 138,
            backgroundImage: `url("${import.meta.env.BASE_URL}salesperson.png")`,
            backgroundSize: 'contain',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'no-repeat',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
          <Heading level={5}>Want results faster?</Heading>
          <Text variant="secondary">Have a Blaze reputation specialist monitor your reviews and respond 1:1.</Text>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button variant="secondary" endIcon={ArrowRight} onPress={openConnect}>
            Talk to a reputation expert 1:1
          </Button>
        </div>
      </div>
    </div>
  );
}
