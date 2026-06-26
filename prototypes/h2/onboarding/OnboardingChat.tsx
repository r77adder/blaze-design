import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '@/components';
import Send1 from '@/icons/20/Send1';
import { Step1Website } from './steps/Step1Website';
import { useOnboarding } from './onboarding-context';
import { useDevState } from '../dev-state-context';
import { AgentBubble, AgentRow, CardActiveContext, INITIAL_SELECTIONS, UserBubble, type Selections } from './chat-ui';
import {
  ChangesSummaryCard,
  ChannelsCard,
  CheckoutCard,
  CompetitorsCard,
  CreativeGalleryCard,
  GoalsHistoryCard,
  GoalsTimelineCard,
  LookCard,
  MajorEventsCard,
  MarketCreativeCard,
  PlanCard,
  ProfileCard,
  SoundCard,
} from './chat-cards';
import { ACCOUNT } from '../cold-flows/strategy-data';
import { THEME } from '../cold-flows/CreativeReviewFlow';

/**
 * V2 onboarding — chat-with-an-agent. The user enters their website on the
 * original V1 first screen, which animates into a conversation. The agent
 * narrates what it's doing as plain messages, then surfaces each part of the
 * setup as a visual, selectable card. Nothing is removed or collapsed —
 * confirmed cards stay in the transcript (read-only) so the view never jumps.
 * Finishing drops them straight into the cold-state Home.
 */

type CardId =
  | 'profile'
  | 'competitors'
  | 'market'
  | 'sound'
  | 'look'
  | 'goals'
  | 'history'
  | 'events'
  | 'channels'
  | 'gallery'
  | 'changes'
  | 'plan';

type Beat = { kind: 'say'; text: string } | { kind: 'card'; card: CardId };

const AGENDA = [
  'Pull your business profile',
  'Scan competitors & their creative',
  'Lock your voice & look',
  'Set your goals & channels',
  'Generate your first wave of creative',
  'Recommend your plan',
];

const SCRIPT: Beat[] = [
  { kind: 'say', text: `Reading ${ACCOUNT.domain} now — your site, Google Business Profile, socials, and reviews. This is how I learn your voice and what you're known for.` },
  { kind: 'say', text: "Got a clear picture. Here's what I found — take a look and tweak anything that's off." },
  { kind: 'card', card: 'profile' },
  { kind: 'say', text: "Nice. Next I want to see who you're up against — knowing who's advertising locally shows me where the open lanes are." },
  { kind: 'say', text: 'Found a handful of active local advertisers.' },
  { kind: 'card', card: 'competitors' },
  { kind: 'say', text: "Here's the creative they're actually running. Tell me which ones land for you and I'll steer your ads that way." },
  { kind: 'card', card: 'market' },
  { kind: 'say', text: "Now let's lock your brand so everything I make sounds and looks like you — starting with your voice." },
  { kind: 'card', card: 'sound' },
  { kind: 'say', text: 'And the visual side. Pick a lead color and the preview updates live.' },
  { kind: 'card', card: 'look' },
  { kind: 'say', text: "Time for targets. I've drafted a 90-day plan from your goals and the audit — realistic, paid-first, and built to compound." },
  { kind: 'card', card: 'goals' },
  { kind: 'say', text: "A little context on where you're starting from, so the plan plays to your strengths." },
  { kind: 'card', card: 'history' },
  { kind: 'say', text: "I'll also plan around your busy seasons so spend lands when demand peaks." },
  { kind: 'card', card: 'events' },
  { kind: 'say', text: 'Last setup question — which channels should I build out first?' },
  { kind: 'card', card: 'channels' },
  { kind: 'say', text: `Now the fun part — I'm generating your first wave of creative for the “${THEME}” theme. Give me a moment here.` },
  { kind: 'say', text: 'Writing the concepts and rendering Meta + Search ads…' },
  { kind: 'say', text: 'Producing stills, carousels, stories, and video cutdowns…' },
  { kind: 'say', text: "All set — here's your first wave." },
  { kind: 'card', card: 'gallery' },
  { kind: 'say', text: "Nice work. Here's a quick recap of everything you shaped — it's all saved to your Brand Kit." },
  { kind: 'card', card: 'changes' },
  { kind: 'say', text: "That's the whole setup done. Based on all of it, here's the plan I'd recommend to get you live." },
  { kind: 'card', card: 'plan' },
];

interface Item {
  id: number;
  kind: 'agent' | 'user' | 'agenda' | 'card';
  text?: string;
  card?: CardId;
  confirmed?: boolean;
}

export function OnboardingChat({ bar }: { bar?: ReactNode }) {
  const { profile, websiteUrl, finish } = useOnboarding();
  const { setState: setDevState } = useDevState();
  const navigate = useNavigate();

  const [sel, setSel] = useState<Selections>(INITIAL_SELECTIONS);
  const [messages, setMessages] = useState<Item[]>([]);
  const [started, setStarted] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [paying, setPaying] = useState(false);
  const [show, setShow] = useState(false);
  const [input, setInput] = useState('');

  const idRef = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (started) {
      const t = window.setTimeout(() => setShow(true), 20);
      return () => window.clearTimeout(t);
    }
  }, [started]);

  // Walk the script. Narration ('say') beats append as persistent agent
  // messages on a stagger so it reads like the agent working in real time.
  // Card beats append a card and park until the user confirms.
  const advanceFrom = (i: number) => {
    if (i >= SCRIPT.length) return;
    const beat = SCRIPT[i];
    if (beat.kind === 'say') {
      setMessages((m) => [...m, { id: idRef.current++, kind: 'agent', text: beat.text }]);
      setCursor(i + 1);
      window.setTimeout(() => advanceFrom(i + 1), 850);
    } else {
      setMessages((m) => [...m, { id: idRef.current++, kind: 'card', card: beat.card, confirmed: false }]);
      setCursor(i);
    }
  };

  const enterChat = () => {
    setStarted(true);
    setMessages([
      { id: idRef.current++, kind: 'agent', text: `Awesome — I've got what I need to start from ${websiteUrl || ACCOUNT.domain}. I'll walk you through your whole setup one step at a time, and you can tweak anything as we go. Here's the plan:` },
      { id: idRef.current++, kind: 'agenda' },
    ]);
    window.setTimeout(() => advanceFrom(0), 1100);
  };

  const confirmActiveCard = () => {
    setMessages((m) => m.map((msg) => (msg.kind === 'card' && !msg.confirmed ? { ...msg, confirmed: true } : msg)));
    advanceFrom(cursor + 1);
  };

  const finishTrial = () => {
    setDevState('/h2', 'cold');
    finish();
    navigate('/h2');
  };

  const goCheckout = () => {
    setMessages((m) => [
      ...m.map((msg) => (msg.kind === 'card' && msg.card === 'plan' ? { ...msg, confirmed: true } : msg)),
      { id: idRef.current++, kind: 'agent', text: 'Last step — confirm below and your workspace goes live.' },
      { id: idRef.current++, kind: 'card', card: 'checkout', confirmed: false },
    ]);
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(finishTrial, 1400);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { id: idRef.current++, kind: 'user', text }]);
    window.setTimeout(
      () => setMessages((m) => [...m, { id: idRef.current++, kind: 'agent', text: 'Got it — noted. Use the buttons above whenever you’re ready to continue.' }]),
      400,
    );
  };

  const renderCard = (card: CardId) => {
    switch (card) {
      case 'profile':
        return <ProfileCard profile={profile} onContinue={confirmActiveCard} />;
      case 'competitors':
        return <CompetitorsCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'market':
        return <MarketCreativeCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'sound':
        return <SoundCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'look':
        return <LookCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'goals':
        return <GoalsTimelineCard onContinue={confirmActiveCard} />;
      case 'history':
        return <GoalsHistoryCard onContinue={confirmActiveCard} />;
      case 'events':
        return <MajorEventsCard onContinue={confirmActiveCard} />;
      case 'channels':
        return <ChannelsCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'gallery':
        return <CreativeGalleryCard sel={sel} setSel={setSel} onContinue={confirmActiveCard} />;
      case 'changes':
        return <ChangesSummaryCard sel={sel} onContinue={confirmActiveCard} />;
      case 'plan':
        return <PlanCard sel={sel} setSel={setSel} onStartTrial={finishTrial} onCheckout={goCheckout} />;
    }
  };

  const progress = !started ? 0 : Math.round((cursor / SCRIPT.length) * 100);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--light-100)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 3, background: 'var(--dark-4)', flexShrink: 0 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--dark-90)', transition: 'width 320ms ease' }} />
      </div>
      {bar}

      {!started ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Step1Website onContinue={enterChat} />
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', opacity: show ? 1 : 0, transition: 'opacity 360ms ease' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {messages.map((m) => {
                if (m.kind === 'agent') return <AgentBubble key={m.id}>{m.text}</AgentBubble>;
                if (m.kind === 'user') return <UserBubble key={m.id}>{m.text}</UserBubble>;
                if (m.kind === 'agenda') return <Agenda key={m.id} />;
                return (
                  <CardActiveContext.Provider key={m.id} value={!m.confirmed}>
                    {m.card === 'checkout' ? <CheckoutCard tier={sel.plan} paying={paying} onPay={pay} /> : renderCard(m.card!)}
                  </CardActiveContext.Provider>
                );
              })}
              <div ref={endRef} />
            </div>
          </div>

          <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '12px 24px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask me anything, or add a note…"
                style={{ flex: 1, padding: '12px 16px', fontSize: 16, letterSpacing: '0.32px', fontFamily: 'inherit', background: 'var(--dark-2)', border: '1px solid var(--dark-8)', borderRadius: 999, color: 'var(--dark-90)', outline: 'none' }}
              />
              <button
                type="button"
                onClick={send}
                aria-label="Send"
                style={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--dark-90)' : 'var(--dark-8)', color: 'var(--light-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background 140ms ease' }}
              >
                <Send1 size={18} color="var(--light-100)" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Agenda() {
  return (
    <AgentRow>
      <div style={{ border: '1px solid var(--dark-8)', borderRadius: 14, borderTopLeftRadius: 4, background: 'var(--light-100)', padding: '14px 18px' }}>
        {AGENDA.map((step, i) => (
          <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '5px 0' }}>
            <span
              style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--dark-4)',
                color: 'var(--dark-60)',
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i + 1}
            </span>
            <Text variant="secondary" style={{ color: 'var(--dark-90)' }}>
              {step}
            </Text>
          </div>
        ))}
      </div>
    </AgentRow>
  );
}
