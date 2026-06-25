import { useEffect, useRef, useState } from 'react';
import { Button, Text } from '@/components';
import Close from '@/icons/16/Close';
import ArrowRight from '@/icons/20/ArrowRight';
import Voice from '@/icons/20/Voice';
import Microphone from '@/icons/20/Microphone';

/**
 * Mock "try your agent" experiences for the DIY receptionist cold flow:
 *   - ChatDemoPanel — a right-side slide-in chat thread.
 *   - CallDemoModal — a centered live-call card with an auto-playing transcript.
 * Both are canned (no backend) — just enough to convey usefulness.
 */

interface Msg {
  id: number;
  role: 'agent' | 'user';
  text: string;
}

const CHAT_OPENER = "Hi! Thanks for reaching out to CertaPro Painters of Austin. What can I help you with today?";

const CHAT_REPLIES = [
  'Happy to help with that! Is this for interior, exterior, or cabinet work?',
  'Got it. And which part of the Austin metro is the property in?',
  'Perfect — our free in-home estimates take about 30 minutes. Want me to text you a few time slots?',
  'Great. Are you the homeowner or the main decision-maker for the project?',
];

export function ChatDemoPanel({ agentName, onClose }: { agentName: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: 'agent', text: CHAT_OPENER }]);
  const [draft, setDraft] = useState('');
  const idRef = useRef(1);
  const replyRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: idRef.current++, role: 'user', text }]);
    setDraft('');
    const reply = CHAT_REPLIES[replyRef.current % CHAT_REPLIES.length]!;
    replyRef.current += 1;
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: idRef.current++, role: 'agent', text: reply }]);
    }, 700);
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.25)' }}
    >
      <div
        role="dialog"
        aria-label={`Chat with ${agentName}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(400px, 100vw)',
          height: '100%',
          background: 'var(--light-100)',
          borderLeft: '1px solid var(--dark-8)',
          boxShadow: '-12px 0 40px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--dark-90)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar agentName={agentName} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--light-100)', lineHeight: 1.3 }}>{agentName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.2 }}>Test chat</div>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={iconBtn}>
            <Close size={16} />
          </button>
        </div>

        {/* messages */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m) => {
            const isAgent = m.role === 'agent';
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: isAgent ? 'flex-start' : 'flex-end' }}>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '8px 12px',
                    borderRadius: isAgent ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                    background: isAgent ? 'var(--dark-4)' : 'var(--dark-90)',
                    color: isAgent ? 'var(--dark-90)' : 'var(--light-100)',
                    fontSize: 14,
                    lineHeight: 1.45,
                  }}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* input */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--dark-8)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…"
            style={{
              flex: 1,
              height: 36,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid var(--dark-8)',
              background: 'var(--light-100)',
              color: 'var(--dark-90)',
              fontFamily: "'Sohne', sans-serif",
              fontSize: 14,
              letterSpacing: '0.28px',
              outline: 'none',
            }}
          />
          <button
            type="button"
            aria-label="Send"
            onClick={send}
            disabled={draft.trim().length === 0}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 'none',
              padding: 0,
              flexShrink: 0,
              background: draft.trim().length > 0 ? 'var(--dark-90)' : 'var(--dark-8)',
              color: draft.trim().length > 0 ? 'var(--light-100)' : 'var(--dark-40)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: draft.trim().length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

interface CallLine {
  who: 'agent' | 'caller';
  line: string;
}

const CALL_SCRIPT: CallLine[] = [
  { who: 'agent', line: 'Thanks for calling CertaPro Painters of Austin, this is Riley. How can I help?' },
  { who: 'caller', line: 'Hi, I need a quote to repaint the outside of my house.' },
  { who: 'agent', line: 'Happy to set that up! Whereabouts is the home?' },
  { who: 'caller', line: 'Over in Cedar Park.' },
  { who: 'agent', line: 'Perfect, we cover Cedar Park. I can book a free estimate this week — does Thursday morning work?' },
  { who: 'caller', line: 'Thursday works great.' },
  { who: 'agent', line: 'Done — you’re booked for Thursday at 9. I’ll text you a confirmation right now.' },
];

export function CallDemoModal({ agentName, onClose }: { agentName: string; onClose: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [muted, setMuted] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (revealed >= CALL_SCRIPT.length) return;
    const t = window.setTimeout(() => setRevealed((r) => r + 1), 2400);
    return () => window.clearTimeout(t);
  }, [revealed]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [revealed]);

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', padding: 32 }}
    >
      <div
        role="dialog"
        aria-label={`Demo call with ${agentName}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, calc(100vw - 64px))',
          maxHeight: 'calc(100vh - 64px)',
          background: 'var(--light-100)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* call header */}
        <div style={{ padding: '24px 24px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'var(--dark-90)' }}>
          <Avatar agentName={agentName} size={56} />
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--light-100)' }}>{agentName}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--status-approved)' }} />
            Live · {mmss}
          </div>
        </div>

        {/* transcript */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 220 }}>
          {CALL_SCRIPT.slice(0, revealed).map((l, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: 500, color: 'var(--dark-40)' }}>
                {l.who === 'agent' ? agentName : 'Caller'}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--dark-80)' }}>{l.line}</Text>
            </div>
          ))}
          {revealed < CALL_SCRIPT.length && (
            <Text variant="secondary" style={{ fontSize: 13, color: 'var(--dark-40)' }}>…</Text>
          )}
        </div>

        {/* controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 24px', borderTop: '1px solid var(--dark-8)' }}>
          <Button variant={muted ? 'secondary' : 'ghost'} size="md" frontIcon={Microphone} onPress={() => setMuted((m) => !m)}>
            {muted ? 'Unmute' : 'Mute'}
          </Button>
          <Button variant="red" size="md" frontIcon={Voice} onPress={onClose}>
            End call
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────

function Avatar({ agentName, size = 32 }: { agentName: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--brand)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.42,
        fontWeight: 700,
        color: 'var(--dark-90)',
        flexShrink: 0,
      }}
    >
      {agentName.charAt(0).toUpperCase()}
    </span>
  );
}

const iconBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.12)',
  color: 'var(--light-100)',
  cursor: 'pointer',
  padding: 0,
};
