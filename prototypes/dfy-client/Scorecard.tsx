import { useState, useRef, useEffect } from 'react';
import { Text, Button } from '@/components';
import { useToast } from '@/staging';
import Edit3 from '@/icons/20/Edit3';
import Check2 from '@/icons/20/Check2';
import { ClientShell, BackTitle } from './shell';
import { ScorecardBody } from './growth-review/StepScorecard';

/**
 * The portal Scorecard page. Renders the exact same scorecard content as the
 * Growth Engine Review's Scorecard step (animated donut summary, local
 * comparison table, per-section cards), wrapped in the portal shell with an
 * approve / request-changes footer. Shown the same way to the AM and the
 * client (the AM/Client switch drives approvals, not the scorecard).
 */
export function Scorecard() {
  const { showToast } = useToast();
  const [approved, setApproved] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [note, setNote] = useState('');
  const anchorRef = useRef<HTMLSpanElement>(null);

  // Close the request-changes popover on any click outside its anchor.
  useEffect(() => {
    if (!reqOpen) return;
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) setReqOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [reqOpen]);

  const approve = () => { setApproved(true); showToast({ variant: 'success', message: 'Scorecard approved' }); };
  const sendRequest = () => { setReqOpen(false); setNote(''); showToast({ message: 'Change request sent. Your account manager will follow up.' }); };

  return (
    <ClientShell section="scorecard" title={<BackTitle label="Scorecard" />}>
      <div style={{ height: 'calc(100% + 48px)', margin: -24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 24px 32px' }}>
          <ScorecardBody />
        </div>

        <div style={{ flexShrink: 0, borderTop: '1px solid var(--dark-8)', background: 'var(--light-100)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Text variant="secondary" color="var(--dark-60)">
            {approved ? 'You approved this scorecard.' : 'Does this scorecard look right?'}
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span ref={anchorRef} style={{ position: 'relative', display: 'inline-flex' }}>
              <Button variant="secondary" size="md" frontIcon={Edit3} onPress={() => setReqOpen((o) => !o)}>Request changes</Button>
              {reqOpen && (
                <div
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 30, width: 340,
                    background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 12,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.16)', padding: 16,
                    display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left',
                  }}
                >
                  <Text variant="metadata" style={{ color: 'var(--dark-60)', lineHeight: 1.5 }}>
                    What looks off about your scorecard? Your account manager will follow up.
                  </Text>
                  <textarea
                    autoFocus
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe the change…"
                    style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid var(--dark-8)', padding: '10px 12px', fontFamily: "'Sohne', sans-serif", fontSize: 14, letterSpacing: '0.28px', color: 'var(--dark-90)', lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="ghost" size="sm" onPress={() => { setReqOpen(false); setNote(''); }}>Cancel</Button>
                    <Button variant="primary" size="sm" isDisabled={!note.trim()} onPress={sendRequest}>Send request</Button>
                  </div>
                </div>
              )}
            </span>
            <Button variant="primary" size="md" frontIcon={Check2} isDisabled={approved} onPress={approve}>
              {approved ? 'Approved' : 'Approve'}
            </Button>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}
