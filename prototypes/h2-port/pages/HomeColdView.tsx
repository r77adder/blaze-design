import { useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Heading, Text } from '@/components';
import { useToast } from '@/staging';
import Calendar1 from '@/icons/20/Calendar1';
import Globe from '@/icons/20/Globe';
import UserProfileCircle from '@/icons/20/UserProfileCircle';
import Cursor04 from '@/icons/20/Cursor04';
import Google from '@/icons/20/Google';
import Templates from '@/icons/20/Templates';
import UserProfileGroup from '@/icons/20/UserProfileGroup';
import Star from '@/icons/20/Star';
import Check2 from '@/icons/20/Check2';
import ArrowRight from '@/icons/20/ArrowRight';
import Palette from '@/icons/20/Palette';
import { H2Layout } from '../H2Layout';
import { useOnboarding } from '../onboarding/onboarding-context';
import { useBrandKit } from '../brand-kit/brand-kit-context';
import { useDevState } from '../dev-state-context';
import { TOOL_DESCRIPTIONS, TOOL_LABEL, type ToolId } from '../tools-context';

/**
 * HomeColdView — post-onboarding "unboxing" experience. The user picked
 * features in Step5Strategy; here each one needs a one-click activation
 * (mocked locally) to feel like the workspace is coming alive in real-time.
 *
 * Visual energy comes from: warm brand-tinted icon squares, a sticky progress
 * chip with a gradient bar, smooth row-flip transitions, and a celebratory
 * all-done state. Copy is action-oriented per-feature ("what this turns on")
 * rather than passive descriptions.
 */

const TOOL_ICONS: Record<ToolId, ComponentType<{ size?: number; color?: string }>> = {
  'Organic Campaigns': Calendar1,
  'SEO/AEO': Globe,
  'UGC Content': UserProfileCircle,
  'Paid Social': Cursor04,
  'Paid Search': Google,
  'Landing Pages': Templates,
  SDR: UserProfileGroup,
  Reputation: Star,
};

// Action-oriented per-feature blurbs — answer "what happens the moment I turn
// this on?" rather than describing the feature in abstract. Falls back to
// TOOL_DESCRIPTIONS if a tool is missing here.
const TURN_ON_COPY: Record<ToolId, string> = {
  'Organic Campaigns': 'Your first 30-day content calendar generates overnight.',
  'SEO/AEO': 'Topic clusters drafted for Google AND structured citations for ChatGPT, Perplexity, and your Google Business listing.',
  'UGC Content': 'Your first AI avatar video renders within the hour.',
  'Paid Social': 'Meta, TikTok, and LinkedIn ad accounts get a recommended starter campaign.',
  'Paid Search': 'Google Ads keywords, bids, and conversion tracking get auto-configured.',
  'Landing Pages': 'A campaign-ready landing page goes live on your domain in minutes.',
  SDR: 'Your AI Receptionist starts drafting outbound to your first 50 leads.',
  Reputation: 'We start watching reviews across Google, Yelp, and Facebook.',
};

// Toast confirmation copy — friendly, slightly conspiratorial. "We just did
// the work for you" energy.
const TURNED_ON_TOAST: Record<ToolId, string> = {
  'Organic Campaigns': 'Organic Campaigns is on — your first calendar generates overnight.',
  'SEO/AEO': 'SEO/AEO is on — topic clusters queued and answer engines now in scope.',
  'UGC Content': 'UGC Content is on — your first avatar video is rendering.',
  'Paid Social': 'Paid Social is on — starter campaigns drafted for review.',
  'Paid Search': 'Paid Search is on — keywords and tracking are wired up.',
  'Landing Pages': 'Landing Pages is on — your first page deploys shortly.',
  SDR: 'AI Receptionist is on — drafting outbound now.',
  Reputation: 'Reputation is on — we are watching every review surface.',
};

export function HomeColdView({ businessName }: { businessName?: string }) {
  const { showToast } = useToast();
  const { selectedTools } = useOnboarding();
  const { done: brandKitDone } = useBrandKit();
  const { setState: setDevState } = useDevState();
  const navigate = useNavigate();
  const [active, setActive] = useState<Set<ToolId>>(() => new Set());

  // Owner-first welcome ("Welcome to Blaze, John.") feels warmer than the
  // raw business name. Falls back to the first token of `businessName` if
  // it doesn't match our known workspace.
  const firstName = businessName?.toLowerCase().includes('certapro')
    ? 'John'
    : businessName
      ? businessName.split(' ')[0]
      : '';
  // Total includes Brand Kit + every feature the user opted into.
  const total = selectedTools.length + 1;
  const liveCount = active.size + (brandKitDone ? 1 : 0);
  const allDone = liveCount === total;
  const progressPct = total === 0 ? 0 : Math.round((liveCount / total) * 100);

  const turnOn = (id: ToolId) => {
    // Organic Campaigns has a dedicated setup flow — jump straight into the
    // first-campaign modal on the OC cold page rather than pretending the
    // tool flipped on with a toast.
    if (id === 'Organic Campaigns') {
      setDevState('/h2/organic-social', 'cold');
      navigate('/h2/organic-social?setup=1');
      return;
    }
    setActive((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    showToast({ message: TURNED_ON_TOAST[id] });
  };

  // Clicking "Finalize" opens the dedicated 3-step Brand Kit flow at
  // /h2/brand-kit. We explicitly flip the per-path dev state to 'cold'
  // first so BrandKitFlow renders the setup takeover regardless of the
  // user's prior completion state — the row says "Finalize", so the user
  // expects the setup screens, not the steady content surface.
  const finalizeBrandKit = () => {
    setDevState('/h2/brand-kit', 'cold');
    navigate('/h2/brand-kit');
  };

  const handleDashboardCta = () => {
    showToast({ message: 'Your dashboard is live — pinned items will appear here.' });
  };

  return (
    <H2Layout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 4px 60px' }}>
        {/* HERO — warm gradient hint behind the welcome line */}
        <div
          style={{
            position: 'relative',
            padding: '40px 24px 36px',
            marginBottom: 20,
            borderRadius: 16,
            background:
              'linear-gradient(135deg, rgba(252, 183, 40, 0.10) 0%, rgba(124, 92, 252, 0.06) 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle radial accent in the top-right */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(252, 183, 40, 0.25) 0%, rgba(252, 183, 40, 0) 70%)',
              pointerEvents: 'none',
            }}
          />
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-60)',
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 8,
              letterSpacing: '0.4px',
            }}
          >
            Workspace coming online
          </Text>
          <Heading
            level={2}
            style={{
              lineHeight: 1.15,
              letterSpacing: '-0.6px',
              marginBottom: 10,
              fontSize: 32,
            }}
          >
            Welcome to Blaze{firstName ? `, ${firstName}` : ''}.
          </Heading>
          <Text
            variant="primary"
            style={{
              display: 'block',
              lineHeight: 1.5,
              color: 'var(--dark-60)',
              fontSize: 16,
              maxWidth: 540,
            }}
          >
            Your workspace is coming alive. Turn on each feature below to start shipping —
            we did the setup; you just flip the switch.
          </Text>
        </div>

        {/* PROGRESS — sticky so it tracks the user as they scroll the list */}
        <div
          style={{
            position: 'sticky',
            top: 8,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '14px 18px',
            background: allDone
              ? 'linear-gradient(90deg, rgba(4, 175, 0, 0.08) 0%, rgba(252, 183, 40, 0.10) 100%)'
              : 'var(--light-100)',
            border: `1px solid ${allDone ? 'rgba(4, 175, 0, 0.35)' : 'var(--dark-8)'}`,
            borderRadius: 12,
            marginBottom: 16,
            boxShadow: allDone
              ? '0 0 0 4px rgba(4, 175, 0, 0.08)'
              : '0 1px 2px rgba(0, 0, 0, 0.02)',
            transition:
              'background 240ms ease, border-color 240ms ease, box-shadow 240ms ease',
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text
              variant="smallList"
              style={{ color: 'var(--dark-90)', fontWeight: 500 }}
            >
              {allDone
                ? 'All features live — let\'s go'
                : `${liveCount} of ${total} feature${total === 1 ? '' : 's'} live`}
            </Text>
            <Text
              variant="secondary"
              style={{
                display: 'block',
                color: 'var(--dark-60)',
                marginTop: 2,
              }}
            >
              {allDone
                ? 'Your workspace is fully on. The good stuff starts now.'
                : 'Flip them on one at a time — or in a single sweep. Order doesn\'t matter.'}
            </Text>
          </div>
          <div
            style={{
              flexShrink: 0,
              width: 110,
              height: 8,
              background: 'var(--dark-4)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPct}%`,
                height: '100%',
                background: allDone
                  ? '#04af00'
                  : 'linear-gradient(90deg, var(--brand) 0%, var(--purple) 100%)',
                transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </div>
        </div>

        {/* FEATURE LIST or ALL-DONE BANNER */}
        {allDone ? (
          <AllDoneBanner onCta={handleDashboardCta} />
        ) : (
          <div
            style={{
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <BrandKitRow active={brandKitDone} onFinalize={finalizeBrandKit} />
            {selectedTools.map((id) => (
              <FeatureRow
                key={id}
                id={id}
                isFirst={false}
                active={active.has(id)}
                onTurnOn={() => turnOn(id)}
              />
            ))}
          </div>
        )}

        {!allDone && (
          <Text
            variant="metadata"
            style={{
              display: 'block',
              color: 'var(--dark-40)',
              fontSize: 12,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            Want a guided walkthrough? We can hop on a 15-minute call.
          </Text>
        )}
      </div>
    </H2Layout>
  );
}

/**
 * Brand Kit is the prerequisite first step before the feature toggles —
 * logo, colors, voice. It always sits at the top of the list with a tinted
 * purple accent to set it apart from the brand-yellow feature rows.
 */
function BrandKitRow({
  active,
  onFinalize,
}: {
  active: boolean;
  onFinalize: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 20px',
        background: active ? 'rgba(4, 175, 0, 0.04)' : 'rgba(124, 92, 252, 0.04)',
        transition: 'background 260ms ease',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 10,
          background: active
            ? 'rgba(4, 175, 0, 0.12)'
            : 'rgba(124, 92, 252, 0.14)',
          color: active ? 'var(--dark-90)' : 'var(--purple)',
          flexShrink: 0,
          transition: 'background 260ms ease, transform 260ms ease, color 260ms ease',
          transform: active ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <Palette size={20} color={active ? 'var(--dark-90)' : 'var(--purple)'} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="smallList"
          style={{
            color: 'var(--dark-90)',
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          Finalize your Brand kit
        </Text>
        <Text
          variant="secondary"
          style={{
            display: 'block',
            color: 'var(--dark-60)',
            marginTop: 3,
            lineHeight: 1.45,
          }}
        >
          Confirm your logo, colors, and brand voice so every campaign and post stays on-brand.
        </Text>
      </div>
      {active ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(4, 175, 0, 0.12)',
            color: '#04af00',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <Check2 size={14} color="#04af00" />
          Locked in
        </span>
      ) : (
        <Button variant="primary" size="sm" onPress={onFinalize}>
          Finalize
        </Button>
      )}
    </div>
  );
}

function FeatureRow({
  id,
  isFirst,
  active,
  onTurnOn,
}: {
  id: ToolId;
  isFirst: boolean;
  active: boolean;
  onTurnOn: () => void;
}) {
  const Icon = TOOL_ICONS[id];
  const blurb = TURN_ON_COPY[id] ?? TOOL_DESCRIPTIONS[id];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 20px',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-4)',
        background: active ? 'rgba(4, 175, 0, 0.04)' : 'transparent',
        transition: 'background 260ms ease',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 10,
          background: active
            ? 'rgba(4, 175, 0, 0.12)'
            : 'rgba(252, 183, 40, 0.12)',
          color: 'var(--dark-90)',
          flexShrink: 0,
          transition: 'background 260ms ease, transform 260ms ease',
          transform: active ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <Icon size={20} color="var(--dark-90)" />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text
          variant="smallList"
          style={{
            color: 'var(--dark-90)',
            fontWeight: 500,
            fontSize: 15,
          }}
        >
          {TOOL_LABEL[id]}
        </Text>
        <Text
          variant="secondary"
          style={{
            display: 'block',
            color: 'var(--dark-60)',
            marginTop: 3,
            lineHeight: 1.45,
          }}
        >
          {blurb}
        </Text>
      </div>
      {active ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(4, 175, 0, 0.12)',
            color: '#04af00',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          <Check2 size={14} color="#04af00" />
          Live
        </span>
      ) : (
        <Button variant="primary" size="sm" onPress={onTurnOn}>
          Turn on
        </Button>
      )}
    </div>
  );
}

function AllDoneBanner({ onCta }: { onCta: () => void }) {
  return (
    <div
      style={{
        padding: '36px 28px',
        borderRadius: 14,
        background:
          'linear-gradient(135deg, rgba(252, 183, 40, 0.10) 0%, rgba(124, 92, 252, 0.08) 100%)',
        border: '1px solid rgba(252, 183, 40, 0.30)',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(4, 175, 0, 0.12)',
          marginBottom: 16,
        }}
      >
        <Check2 size={20} color="#04af00" />
      </div>
      <Heading
        level={3}
        style={{
          lineHeight: 1.2,
          letterSpacing: '-0.3px',
          marginBottom: 8,
        }}
      >
        Every feature is on.
      </Heading>
      <Text
        variant="primary"
        style={{
          display: 'block',
          color: 'var(--dark-60)',
          fontSize: 15,
          lineHeight: 1.5,
          marginBottom: 20,
          maxWidth: 480,
        }}
      >
        Your workspace is fully live. First drafts, campaigns, and review responses
        will start showing up in your feed over the next few hours.
      </Text>
      <Button variant="primary" size="md" onPress={onCta} endIcon={ArrowRight}>
        Go to your dashboard
      </Button>
    </div>
  );
}
