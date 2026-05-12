import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Button, IconButton, Modal, ModalStack, Text, useModals } from '@/components';
import type { StackModalProps } from '@/components';
import { TabChip, useToast } from '@/staging';
import Stars from '@/icons/20/Stars';
import Pause from '@/icons/20/Pause';
import Play3 from '@/icons/20/Play3';
import Mail from '@/icons/20/Mail';
import UserProfile from '@/icons/20/UserProfile';
import Plus from '@/icons/20/Plus';
import Send1 from '@/icons/20/Send1';
import MoreDots from '@/icons/20/MoreDots';
import { H2Layout } from '../H2Layout';
import { useDevState } from '../dev-state-context';
import { CrmColdView } from './ColdViews';

/**
 * /h2/crm — Pipedrive-inspired CRM with an AI SDR agent ("Blaze SDR")
 * orchestrating the pipeline. The user retains a global pause/resume kill
 * switch in the top banner, plus a per-deal "Take over" button in the
 * detail modal.
 */

type StageId = 'lead' | 'qualified' | 'demo' | 'proposal' | 'won';

interface Stage {
  id: StageId;
  label: string;
  color: string;
}

const STAGES: Stage[] = [
  { id: 'lead', label: 'Lead', color: 'var(--status-draft)' },
  { id: 'qualified', label: 'Qualified', color: 'var(--status-connect)' },
  { id: 'demo', label: 'Demo', color: 'var(--status-review)' },
  { id: 'proposal', label: 'Proposal', color: 'var(--status-posting)' },
  { id: 'won', label: 'Won', color: 'var(--status-approved)' },
];

interface Message {
  from: 'ai' | 'prospect';
  body: string;
  timestamp: string;
}

interface Deal {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  value: number;
  stage: StageId;
  lastActivity: string;
  aiManaged: boolean;
  aiSuggestion: string;
  thread: Message[];
}

const DEALS: Deal[] = [
  // Lead
  {
    id: 'd1',
    company: 'Ridgeline Coffee Roasters',
    contactName: 'Mara Ellison',
    contactEmail: 'mara@ridgelinecoffee.com',
    contactPhone: '+1 (415) 555-0182',
    contactRole: 'Head of Wholesale',
    value: 4200,
    stage: 'lead',
    lastActivity: 'AI replied 2h ago - Awaiting prospect reply',
    aiManaged: true,
    aiSuggestion: 'Send a wholesale-tier ROI case study next - prospect asked about margins.',
    thread: [
      { from: 'ai', body: "Hi Mara - saw Ridgeline is opening a third cafe. Worth a 15-min chat on how we've helped roasters like Heartstone double wholesale margins?", timestamp: 'Mon 9:14 AM' },
      { from: 'prospect', body: 'Possibly. What kind of margin lift are we talking about?', timestamp: 'Mon 11:02 AM' },
      { from: 'ai', body: 'Heartstone went from 18% to 34% in two quarters - happy to share the breakdown. Tuesday 11am EST?', timestamp: 'Mon 11:08 AM' },
    ],
  },
  {
    id: 'd2',
    company: 'Northwind Pediatrics',
    contactName: 'Dr. Priya Shah',
    contactEmail: 'priya@northwindkids.com',
    contactPhone: '+1 (206) 555-0144',
    contactRole: 'Practice Owner',
    value: 2800,
    stage: 'lead',
    lastActivity: 'AI sent intro 1d ago',
    aiManaged: true,
    aiSuggestion: 'Follow up in 2 days if no reply - pediatric practices average 4-day response.',
    thread: [
      { from: 'ai', body: 'Hi Dr. Shah - Northwind keeps coming up in Seattle parent groups. Curious if a 10-min walkthrough on patient-acquisition automation would be useful?', timestamp: 'Yesterday 8:30 AM' },
    ],
  },
  {
    id: 'd3',
    company: 'Foundry & Folk',
    contactName: 'Theo Wren',
    contactEmail: 'theo@foundryfolk.studio',
    contactPhone: '+1 (718) 555-0211',
    contactRole: 'Co-founder',
    value: 6500,
    stage: 'lead',
    lastActivity: 'Manual follow-up scheduled tomorrow',
    aiManaged: false,
    aiSuggestion: 'AI is paused on this deal - resume to draft a follow-up email.',
    thread: [
      { from: 'ai', body: 'Hi Theo - loved the rebrand work for Sable Hotels. Open to a quick intro?', timestamp: 'Fri 2:11 PM' },
      { from: 'prospect', body: "Sure - but I'll loop in my partner first. Give us a few days.", timestamp: 'Fri 4:48 PM' },
    ],
  },
  // Qualified
  {
    id: 'd4',
    company: 'Halberd Legal',
    contactName: 'Renee Okafor',
    contactEmail: 'renee@halberdlegal.com',
    contactPhone: '+1 (312) 555-0177',
    contactRole: 'Managing Partner',
    value: 12500,
    stage: 'qualified',
    lastActivity: 'AI scheduled follow-up for tomorrow',
    aiManaged: true,
    aiSuggestion: 'Share the boutique-law-firm comparison deck - prospect mentioned competitive pricing concern.',
    thread: [
      { from: 'ai', body: "Renee, thanks for the call yesterday. Sending over a deck tailored to boutique firms - mind if I follow up Thursday?", timestamp: 'Tue 4:15 PM' },
      { from: 'prospect', body: "Thursday works. We're also evaluating Clio's marketing add-on - want to make sure we compare apples to apples.", timestamp: 'Wed 9:02 AM' },
      { from: 'ai', body: "Got it - I'll include a side-by-side feature & price comparison. Anything specific you'd like called out?", timestamp: 'Wed 9:11 AM' },
    ],
  },
  {
    id: 'd5',
    company: 'Coastline Veterinary',
    contactName: 'Jamie Park',
    contactEmail: 'jamie@coastlinevet.com',
    contactPhone: '+1 (619) 555-0166',
    contactRole: 'Director of Operations',
    value: 5400,
    stage: 'qualified',
    lastActivity: 'AI replied 4h ago',
    aiManaged: true,
    aiSuggestion: 'Offer demo slots before Friday - prospect signaled urgency.',
    thread: [
      { from: 'ai', body: 'Hi Jamie - confirmed your two locations and review volume. We can run a tailored demo focused on review-response automation. Tomorrow 2pm?', timestamp: 'Today 10:08 AM' },
      { from: 'prospect', body: 'Tomorrow 2pm works. Can you also show booking integrations?', timestamp: 'Today 1:42 PM' },
    ],
  },
  {
    id: 'd6',
    company: 'Larkspur Florists',
    contactName: 'Eli Tanaka',
    contactEmail: 'eli@larkspurflorists.com',
    contactPhone: '+1 (503) 555-0119',
    contactRole: 'Owner',
    value: 1900,
    stage: 'qualified',
    lastActivity: 'Awaiting prospect reply 3d',
    aiManaged: false,
    aiSuggestion: 'Resume AI to nudge - 3 days of silence usually means competing priorities, not lost interest.',
    thread: [
      { from: 'ai', body: "Hi Eli - quick check-in on the seasonal campaign discussion. Still useful to compare quotes?", timestamp: '3 days ago' },
    ],
  },
  // Demo
  {
    id: 'd7',
    company: 'Greycastle Realty',
    contactName: 'Lina Voss',
    contactEmail: 'lina@greycastle.realty',
    contactPhone: '+1 (847) 555-0193',
    contactRole: 'VP Marketing',
    value: 18000,
    stage: 'demo',
    lastActivity: 'Demo completed - AI sent recap 30m ago',
    aiManaged: true,
    aiSuggestion: 'Send a case-study link next - prospect mentioned ROI.',
    thread: [
      { from: 'ai', body: "Thanks for joining today's demo, Lina. Here's the recap + a Loom on listing-page automation. Open to next steps?", timestamp: 'Today 11:30 AM' },
      { from: 'prospect', body: "Solid demo. ROI is what I'll need to take upstairs - do you have numbers for a multi-office brokerage?", timestamp: 'Today 12:14 PM' },
      { from: 'ai', body: "Yes - pulling a Halberd-style comparison and a brokerage benchmark deck. Want me to send by EOD?", timestamp: 'Today 12:18 PM' },
    ],
  },
  {
    id: 'd8',
    company: 'Aldermere Wellness',
    contactName: 'Sasha Romero',
    contactEmail: 'sasha@aldermere.co',
    contactPhone: '+1 (305) 555-0148',
    contactRole: 'Founder',
    value: 7600,
    stage: 'demo',
    lastActivity: 'AI replied 1h ago',
    aiManaged: true,
    aiSuggestion: 'Offer a free 14-day pilot - founder is price-sensitive but high-fit.',
    thread: [
      { from: 'ai', body: "Sasha - excited for tomorrow's demo. To make the most of it, mind sharing your current review volume?", timestamp: 'Yesterday 5:14 PM' },
      { from: 'prospect', body: "~40/week across the two studios. Honestly worried about pricing for an indie operator.", timestamp: 'Today 9:28 AM' },
      { from: 'ai', body: "Totally hear you - we have a starter tier built for indies. I'll walk through it in the demo.", timestamp: 'Today 10:21 AM' },
    ],
  },
  {
    id: 'd9',
    company: 'Glenmoor Dental',
    contactName: 'Marcus Levy',
    contactEmail: 'marcus@glenmoordental.com',
    contactPhone: '+1 (612) 555-0157',
    contactRole: 'Practice Manager',
    value: 9200,
    stage: 'demo',
    lastActivity: 'Demo scheduled for Thursday',
    aiManaged: true,
    aiSuggestion: 'Send a one-pager beforehand - prospect prefers async prep.',
    thread: [
      { from: 'ai', body: "Confirmed for Thursday 3pm CT. I'll send a one-pager Tuesday so you can skim before the call.", timestamp: 'Mon 6:30 PM' },
    ],
  },
  // Proposal
  {
    id: 'd10',
    company: 'Sable Hotels',
    contactName: 'Imani Brooks',
    contactEmail: 'imani@sablehotels.com',
    contactPhone: '+1 (404) 555-0188',
    contactRole: 'Director of Growth',
    value: 24000,
    stage: 'proposal',
    lastActivity: 'AI sent proposal 6h ago',
    aiManaged: true,
    aiSuggestion: 'Surface annual-prepay discount - Sable typically signs in Q-end.',
    thread: [
      { from: 'ai', body: 'Imani - sent over the proposal with the 5-property rollout plan. Happy to walk through any line item.', timestamp: 'Today 7:00 AM' },
      { from: 'prospect', body: 'Reviewing internally. Is the per-property rate negotiable for an annual commit?', timestamp: 'Today 12:45 PM' },
    ],
  },
  {
    id: 'd11',
    company: 'Forge & Pine Outfitters',
    contactName: 'Cal Henriksen',
    contactEmail: 'cal@forgepine.co',
    contactPhone: '+1 (970) 555-0136',
    contactRole: 'Owner',
    value: 8400,
    stage: 'proposal',
    lastActivity: 'Awaiting signature',
    aiManaged: false,
    aiSuggestion: 'Manual hold - owner asked to be the only point of contact this week.',
    thread: [
      { from: 'ai', body: "Cal - proposal signed and ready in DocuSign. Anything I can clarify?", timestamp: 'Fri 11:00 AM' },
      { from: 'prospect', body: "Reviewing tonight. I'll handle this thread directly - please pause the AI for now.", timestamp: 'Fri 6:18 PM' },
    ],
  },
  {
    id: 'd12',
    company: 'Brightleaf Academy',
    contactName: 'Nadia Choi',
    contactEmail: 'nadia@brightleafacademy.org',
    contactPhone: '+1 (617) 555-0123',
    contactRole: 'Director of Enrollment',
    value: 14500,
    stage: 'proposal',
    lastActivity: 'AI replied 45m ago',
    aiManaged: true,
    aiSuggestion: 'Confirm procurement timeline - schools often need 2-week paper trail.',
    thread: [
      { from: 'ai', body: 'Nadia - revised the proposal to reflect the school-year cadence. Procurement should find everything they need in section 4.', timestamp: 'Today 9:50 AM' },
      { from: 'prospect', body: "Thanks - sending to procurement today. They'll likely have questions on data residency.", timestamp: 'Today 10:35 AM' },
    ],
  },
  // Won
  {
    id: 'd13',
    company: 'Heartstone Roasting',
    contactName: 'Jules Atwood',
    contactEmail: 'jules@heartstone.coffee',
    contactPhone: '+1 (503) 555-0114',
    contactRole: 'Co-founder',
    value: 16800,
    stage: 'won',
    lastActivity: 'Won 2d ago - AI handed off to CS',
    aiManaged: true,
    aiSuggestion: 'Kick off onboarding sequence - first check-in scheduled for Day 7.',
    thread: [
      { from: 'ai', body: "Welcome aboard, Jules! Kickoff call is on the calendar for Monday. I'll loop in your CS partner today.", timestamp: '2 days ago' },
      { from: 'prospect', body: "Pumped to get started.", timestamp: '2 days ago' },
    ],
  },
  {
    id: 'd14',
    company: 'Whetstone Bakeshop',
    contactName: 'Owen Trask',
    contactEmail: 'owen@whetstonebakeshop.com',
    contactPhone: '+1 (215) 555-0162',
    contactRole: 'Owner',
    value: 5200,
    stage: 'won',
    lastActivity: 'Won last week - onboarding 30%',
    aiManaged: false,
    aiSuggestion: 'AI handoff complete - CS team is driving onboarding.',
    thread: [
      { from: 'ai', body: "Congrats on the launch, Owen! Your CS rep, Priya, will reach out today.", timestamp: 'Last Wed' },
    ],
  },
  {
    id: 'd15',
    company: 'Cobalt Climbing Gyms',
    contactName: 'Tessa Vance',
    contactEmail: 'tessa@cobaltclimb.gym',
    contactPhone: '+1 (303) 555-0199',
    contactRole: 'Operations Director',
    value: 21000,
    stage: 'won',
    lastActivity: 'Won 3w ago - onboarding 80%',
    aiManaged: false,
    aiSuggestion: 'Almost done with onboarding - schedule a quarterly review for next month.',
    thread: [
      { from: 'ai', body: "Tessa - signed sealed delivered. Your CS team takes it from here.", timestamp: '3 weeks ago' },
    ],
  },
];

interface Kpi {
  label: string;
  value: string;
  icon: string;
}

const KPIS: Kpi[] = [
  { label: 'Open deals', value: '12', icon: '📂' },
  { label: 'Pipeline value', value: '$132K', icon: '💰' },
  { label: 'This week activity', value: '48', icon: '⚡' },
  { label: 'Win rate', value: '38%', icon: '🎯' },
  { label: 'AI replies sent', value: '127', icon: '🤖' },
];

const cardSurface: CSSProperties = {
  background: 'var(--light-100)',
  border: '1px solid var(--dark-8)',
  borderRadius: 12,
};

function formatMoney(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

function dealsAt(stage: StageId): Deal[] {
  return DEALS.filter((d) => d.stage === stage);
}

function stageSum(stage: StageId): number {
  return dealsAt(stage).reduce((acc, d) => acc + d.value, 0);
}

function KpiStrip() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${KPIS.length}, 1fr)`,
        gap: 10,
        marginBottom: 20,
      }}
    >
      {KPIS.map((k) => (
        <div key={k.label} style={{ ...cardSurface, padding: '14px 16px' }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>{k.icon}</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: 'var(--dark-90)',
              marginBottom: 2,
              letterSpacing: '-0.2px',
            }}
          >
            {k.value}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{k.label}</div>
        </div>
      ))}
    </div>
  );
}

function AiBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 10,
        background: 'rgba(124,92,252,0.12)',
        color: 'var(--purple)',
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: '0.2px',
      }}
    >
      <Stars size={10} color="var(--purple)" />
      AI
    </span>
  );
}

function DealCard({ deal, onClick }: { deal: Deal; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        ...cardSurface,
        padding: 12,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: 'var(--dark-90)',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {deal.company}
          </div>
          <div style={{ fontSize: 12, color: 'var(--dark-60)' }}>{deal.contactName}</div>
        </div>
        {deal.aiManaged && <AiBadge />}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', letterSpacing: '-0.1px' }}>
        {formatMoney(deal.value)}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--dark-60)',
          lineHeight: 1.4,
          paddingTop: 8,
          borderTop: '1px solid var(--dark-4)',
        }}
      >
        {deal.lastActivity}
      </div>
    </div>
  );
}

function StageColumn({
  stage,
  onCardClick,
}: {
  stage: Stage;
  onCardClick: (d: Deal) => void;
}) {
  const deals = dealsAt(stage.id);
  const sum = stageSum(stage.id);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 12px',
          background: 'var(--dark-2)',
          border: '1px solid var(--dark-4)',
          borderRadius: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: stage.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
            {stage.label}
          </span>
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--dark-60)',
              padding: '1px 6px',
              borderRadius: 8,
              background: 'var(--dark-4)',
            }}
          >
            {deals.length}
          </span>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>{formatMoney(sum)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} onClick={() => onCardClick(d)} />
        ))}
      </div>
    </div>
  );
}

function Pipeline({ onCardClick }: { onCardClick: (d: Deal) => void }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {STAGES.map((s) => (
        <StageColumn key={s.id} stage={s} onCardClick={onCardClick} />
      ))}
    </div>
  );
}

interface DealModalProps extends StackModalProps {
  deal: Deal;
  onTakeOver: () => void;
  onApprove: () => void;
}

function DealDetailModal({ close, deal, onTakeOver, onApprove }: DealModalProps) {
  const stage = STAGES.find((s) => s.id === deal.stage)!;
  return (
    <Modal.Root size="md" aria-labelledby="deal-detail-title" data-testid="crm-deal-detail">
      <Modal.Header title={deal.company} id="deal-detail-title" onClose={close} compact={false} />
      <Modal.Content compact={false}>
        <ContactBlock deal={deal} stage={stage} />
        <AiSuggestion text={deal.aiSuggestion} />
        <ConversationThread thread={deal.thread} />
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={onTakeOver}>
            Take over
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="primary" onPress={onApprove}>
            Approve next AI step
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function ContactBlock({ deal, stage }: { deal: Deal; stage: Stage }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        padding: 16,
        background: 'var(--dark-2)',
        border: '1px solid var(--dark-4)',
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <ContactField label="Contact" value={deal.contactName} />
      <ContactField label="Role" value={deal.contactRole} />
      <ContactField label="Email" value={deal.contactEmail} icon={<Mail size={14} color="var(--dark-60)" />} />
      <ContactField label="Phone" value={deal.contactPhone} />
      <ContactField label="Deal value" value={formatMoney(deal.value)} bold />
      <ContactField
        label="Stage"
        value={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: stage.color,
              }}
            />
            {stage.label}
          </span>
        }
      />
      <div style={{ gridColumn: '1 / -1', fontSize: 11.5, color: 'var(--dark-60)' }}>
        Last activity: {deal.lastActivity}
      </div>
    </div>
  );
}

function ContactField({
  label,
  value,
  icon,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--dark-60)', marginBottom: 3, letterSpacing: '0.2px', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--dark-90)',
          fontWeight: bold ? 500 : 400,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}

function AiSuggestion({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: 14,
        background: 'rgba(124,92,252,0.06)',
        border: '1px solid rgba(124,92,252,0.24)',
        borderRadius: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--purple)',
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Stars size={14} color="var(--light-100)" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple)', marginBottom: 3, letterSpacing: '0.2px' }}>
          AI SUGGESTION
        </div>
        <div style={{ fontSize: 13, color: 'var(--dark-90)', lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  );
}

function ConversationThread({ thread }: { thread: Message[] }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--dark-90)',
          marginBottom: 10,
          letterSpacing: '0.2px',
          textTransform: 'uppercase',
        }}
      >
        Conversation
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {thread.map((m, i) => (
          <MessageRow key={i} message={m} />
        ))}
      </div>
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isAi = message.from === 'ai';
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        flexDirection: isAi ? 'row' : 'row-reverse',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: isAi
            ? 'linear-gradient(135deg, #7C5CFC, #5A3FCC)'
            : 'linear-gradient(135deg, var(--dark-60), var(--dark-90))',
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isAi ? <Stars size={14} color="var(--light-100)" /> : <UserProfile size={14} color="var(--light-100)" />}
      </div>
      <div style={{ maxWidth: '78%', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'baseline',
            marginBottom: 3,
            flexDirection: isAi ? 'row' : 'row-reverse',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--dark-90)' }}>
            {isAi ? 'Blaze SDR' : 'Prospect'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--dark-60)' }}>{message.timestamp}</span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: 'var(--dark-90)',
            lineHeight: 1.5,
            padding: '10px 12px',
            background: isAi ? 'rgba(124,92,252,0.08)' : 'var(--dark-4)',
            border: `1px solid ${isAi ? 'rgba(124,92,252,0.18)' : 'var(--dark-8)'}`,
            borderRadius: 10,
          }}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blaze SDR right-rail chat sidebar
// ---------------------------------------------------------------------------

const SDR_SUMMARY: string[] = [
  'Handled 3 inbound leads',
  'Replied to Halberd Legal',
  'Scheduled demo with Greycastle Realty for Thursday',
  'Flagged Cobalt Climbing Gyms as at-risk',
];

function BlazeSdrSidebar({
  paused,
  onTogglePaused,
}: {
  paused: boolean;
  onTogglePaused: () => void;
}) {
  const { showToast } = useToast();
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const send = () => {
    showToast({ message: 'Sent to Blaze SDR' });
    setDraft('');
  };

  const handleToggle = () => {
    onTogglePaused();
    setMenuOpen(false);
  };

  return (
    <aside
      style={{
        position: 'sticky',
        top: 0,
        alignSelf: 'start',
        height: 'calc(100vh - 56px)',
        borderLeft: '1px solid var(--dark-8)',
        background: 'var(--light-100)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C5CFC, #5A3FCC)',
            color: 'var(--light-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Stars size={16} color="var(--light-100)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
            Blaze SDR
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--dark-60)' }}>
            {paused ? 'Paused' : 'Always-on outreach agent'}
          </div>
        </div>
        <div ref={menuWrapRef} style={{ position: 'relative' }}>
          <IconButton
            size="sm"
            icon={MoreDots}
            aria-label="Agent actions"
            active={menuOpen}
            onPress={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                right: 0,
                minWidth: 180,
                background: 'var(--light-100)',
                border: '1px solid var(--dark-8)',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                padding: 4,
                zIndex: 20,
              }}
            >
              <button
                role="menuitem"
                onClick={handleToggle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--dark-90)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--dark-4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {paused ? (
                  <Play3 size={16} color="var(--dark-90)" />
                ) : (
                  <Pause size={16} color="var(--dark-90)" />
                )}
                {paused ? 'Resume agent' : 'Pause agent'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Since you were last here... */}
        <div
          style={{
            padding: 12,
            background: 'rgba(124,92,252,0.06)',
            border: '1px solid rgba(124,92,252,0.24)',
            borderRadius: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--purple)',
              marginBottom: 8,
              letterSpacing: '0.2px',
              textTransform: 'uppercase',
            }}
          >
            Since you were last here...
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SDR_SUMMARY.map((s) => (
              <li
                key={s}
                style={{
                  display: 'flex',
                  gap: 8,
                  fontSize: 12.5,
                  color: 'var(--dark-90)',
                  lineHeight: 1.45,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'var(--purple)',
                    marginTop: 7,
                  }}
                />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Input — sticky to bottom of sidebar viewport */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          borderTop: '1px solid var(--dark-8)',
          padding: 12,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          background: 'var(--light-100)',
        }}
      >
        <textarea
          rows={2}
          placeholder="Ask Blaze SDR..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{
            flex: 1,
            fontFamily: 'inherit',
            fontSize: 13,
            color: 'var(--dark-90)',
            background: 'var(--light-100)',
            border: '1px solid var(--dark-15)',
            borderRadius: 9,
            padding: '8px 10px',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.45,
          }}
        />
        <IconButton
          size="md"
          icon={Send1}
          aria-label="Send message"
          onPress={send}
        />
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// People view — flat list grouped by status (Prospect / Lead / Qualified / Customer)
// ---------------------------------------------------------------------------

type PeopleStatus = 'prospect' | 'lead' | 'qualified' | 'customer';

interface Person {
  id: string;
  name: string;
  initials: string;
  company: string;
  status: PeopleStatus;
  lastActivity: string;
  aiFlag: string;
}

const STATUS_META: Record<PeopleStatus, { label: string; color: string; bg: string }> = {
  prospect: {
    label: 'Prospect',
    color: 'var(--status-draft)',
    bg: 'rgba(117, 124, 138, 0.12)',
  },
  lead: {
    label: 'Lead',
    color: 'var(--status-connect)',
    bg: 'rgba(237, 124, 44, 0.14)',
  },
  qualified: {
    label: 'Qualified',
    color: 'var(--status-posting)',
    bg: 'rgba(1, 121, 207, 0.12)',
  },
  customer: {
    label: 'Customer',
    color: 'var(--status-approved)',
    bg: 'rgba(4, 175, 0, 0.12)',
  },
};

const PEOPLE: Person[] = [
  // Prospects
  { id: 'p1', name: 'Avery Lin', initials: 'AL', company: 'Sapling Studios', status: 'prospect', lastActivity: 'Visited pricing page 2h ago', aiFlag: 'AI suggests outreach' },
  { id: 'p2', name: 'Devon Kim', initials: 'DK', company: 'Northpine Outfitters', status: 'prospect', lastActivity: 'Opened intro email yesterday', aiFlag: 'AI suggests outreach' },
  { id: 'p3', name: 'Mara Ellison', initials: 'ME', company: 'Ridgeline Coffee Roasters', status: 'prospect', lastActivity: 'Clicked case-study link 3d ago', aiFlag: 'AI suggests outreach' },
  { id: 'p4', name: 'Theo Wren', initials: 'TW', company: 'Foundry & Folk', status: 'prospect', lastActivity: 'Replied to cold email 5d ago', aiFlag: 'AI scheduled follow-up' },
  // Leads
  { id: 'p5', name: 'Dr. Priya Shah', initials: 'PS', company: 'Northwind Pediatrics', status: 'lead', lastActivity: 'AI sent intro 1d ago', aiFlag: 'AI scheduled follow-up' },
  { id: 'p6', name: 'Eli Tanaka', initials: 'ET', company: 'Larkspur Florists', status: 'lead', lastActivity: 'Awaiting prospect reply 3d', aiFlag: 'AI marked at-risk' },
  { id: 'p7', name: 'Sasha Romero', initials: 'SR', company: 'Aldermere Wellness', status: 'lead', lastActivity: 'Demo confirmed for tomorrow', aiFlag: 'AI scheduled follow-up' },
  { id: 'p8', name: 'Renee Okafor', initials: 'RO', company: 'Halberd Legal', status: 'lead', lastActivity: 'Comparison deck sent 6h ago', aiFlag: 'AI scheduled follow-up' },
  // Qualified
  { id: 'p9', name: 'Lina Voss', initials: 'LV', company: 'Greycastle Realty', status: 'qualified', lastActivity: 'Demo completed - recap sent', aiFlag: 'AI suggests outreach' },
  { id: 'p10', name: 'Marcus Levy', initials: 'ML', company: 'Glenmoor Dental', status: 'qualified', lastActivity: 'Demo on Thursday 3pm CT', aiFlag: 'AI scheduled follow-up' },
  { id: 'p11', name: 'Imani Brooks', initials: 'IB', company: 'Sable Hotels', status: 'qualified', lastActivity: 'Proposal sent 6h ago', aiFlag: 'AI suggests outreach' },
  { id: 'p12', name: 'Nadia Choi', initials: 'NC', company: 'Brightleaf Academy', status: 'qualified', lastActivity: 'Reviewing with procurement', aiFlag: 'AI scheduled follow-up' },
  { id: 'p13', name: 'Cal Henriksen', initials: 'CH', company: 'Forge & Pine Outfitters', status: 'qualified', lastActivity: 'Awaiting signature', aiFlag: 'AI marked at-risk' },
  // Customers
  { id: 'p14', name: 'Jules Atwood', initials: 'JA', company: 'Heartstone Roasting', status: 'customer', lastActivity: 'Won 2d ago - onboarding kicked off', aiFlag: 'AI scheduled follow-up' },
  { id: 'p15', name: 'Owen Trask', initials: 'OT', company: 'Whetstone Bakeshop', status: 'customer', lastActivity: 'Onboarding 30% complete', aiFlag: 'AI suggests outreach' },
  { id: 'p16', name: 'Tessa Vance', initials: 'TV', company: 'Cobalt Climbing Gyms', status: 'customer', lastActivity: 'Onboarding 80% - QBR due', aiFlag: 'AI marked at-risk' },
  { id: 'p17', name: 'Jamie Park', initials: 'JP', company: 'Coastline Veterinary', status: 'customer', lastActivity: 'Signed annual contract last month', aiFlag: 'AI suggests outreach' },
];

function PeopleView() {
  const grouped: Record<PeopleStatus, Person[]> = {
    prospect: PEOPLE.filter((p) => p.status === 'prospect'),
    lead: PEOPLE.filter((p) => p.status === 'lead'),
    qualified: PEOPLE.filter((p) => p.status === 'qualified'),
    customer: PEOPLE.filter((p) => p.status === 'customer'),
  };
  const order: PeopleStatus[] = ['prospect', 'lead', 'qualified', 'customer'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {order.map((s) => (
        <PeopleGroup key={s} status={s} people={grouped[s]} />
      ))}
    </div>
  );
}

function PeopleGroup({ status, people }: { status: PeopleStatus; people: Person[] }) {
  const meta = STATUS_META[status];
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--dark-90)' }}>
          {meta.label}
        </span>
        <span
          style={{
            fontSize: 11.5,
            color: 'var(--dark-60)',
            padding: '1px 6px',
            borderRadius: 8,
            background: 'var(--dark-4)',
          }}
        >
          {people.length}
        </span>
      </div>
      <div style={{ ...cardSurface, overflow: 'hidden' }}>
        {people.map((p, idx) => (
          <PersonRow
            key={p.id}
            person={p}
            isFirst={idx === 0}
            isLast={idx === people.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function PersonRow({
  person,
  isFirst,
  isLast,
}: {
  person: Person;
  isFirst: boolean;
  isLast: boolean;
}) {
  const meta = STATUS_META[person.status];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto auto auto',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderTop: isFirst ? 'none' : '1px solid var(--dark-4)',
        borderTopLeftRadius: isFirst ? 12 : 0,
        borderTopRightRadius: isFirst ? 12 : 0,
        borderBottomLeftRadius: isLast ? 12 : 0,
        borderBottomRightRadius: isLast ? 12 : 0,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--dark-15), var(--dark-60))',
          color: 'var(--light-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 500,
        }}
      >
        {person.initials}
      </div>
      {/* Name + company + last activity */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 500,
            color: 'var(--dark-90)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {person.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--dark-60)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {person.company} · {person.lastActivity}
        </div>
      </div>
      {/* Status pill */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 9px',
          borderRadius: 12,
          background: meta.bg,
          color: meta.color,
          fontSize: 11.5,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: meta.color,
          }}
        />
        {meta.label}
      </span>
      {/* AI flag chip */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 8px',
          borderRadius: 10,
          background: 'rgba(124,92,252,0.10)',
          color: 'var(--purple)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.1px',
        }}
      >
        <Stars size={10} color="var(--purple)" />
        {person.aiFlag}
      </span>
      <div />
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Deal modal
// ---------------------------------------------------------------------------

interface NewDealModalProps extends StackModalProps {
  onCreate: () => void;
}

function NewDealModal({ close, onCreate }: NewDealModalProps) {
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState<StageId>('lead');
  const [source, setSource] = useState('');

  return (
    <Modal.Root size="md" aria-labelledby="new-deal-title" data-testid="crm-new-deal">
      <Modal.Header
        title="New deal"
        id="new-deal-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <p style={{ margin: '0 0 16px 0', fontSize: 13.5, color: 'var(--dark-60)' }}>
          Add a deal to your pipeline. Blaze SDR will pick up outreach automatically.
        </p>
        <FormField label="Company name">
          <TextField value={company} onChange={setCompany} placeholder="e.g. Ridgeline Coffee Roasters" />
        </FormField>
        <FormField label="Contact name">
          <TextField value={contact} onChange={setContact} placeholder="e.g. Mara Ellison" />
        </FormField>
        <FormField label="Estimated value">
          <TextField
            value={value}
            onChange={setValue}
            placeholder="0"
            type="number"
            prefix="$"
          />
        </FormField>
        <FormField label="Stage">
          <SelectField value={stage} onChange={(v) => setStage(v as StageId)}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </SelectField>
        </FormField>
        <FormField label="Source">
          <SelectField value={source} onChange={setSource}>
            <option value="">Select a source...</option>
            <option value="inbound">Inbound — Website</option>
            <option value="referral">Referral</option>
            <option value="outbound">Outbound — AI prospecting</option>
            <option value="event">Event / conference</option>
            <option value="partner">Partner</option>
          </SelectField>
        </FormField>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
          <Modal.FooterButton variant="primary" onPress={onCreate}>
            Create deal
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Text
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--dark-90)',
          marginBottom: 6,
          letterSpacing: '0.1px',
        }}
      >
        {label}
      </Text>
      {children}
    </div>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  prefix?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--light-100)',
        border: '1px solid var(--dark-15)',
        borderRadius: 9,
        padding: '8px 12px',
      }}
    >
      {prefix && (
        <span style={{ fontSize: 14, color: 'var(--dark-60)' }}>{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 14,
          color: 'var(--dark-90)',
        }}
      />
    </div>
  );
}

function SelectField({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        fontFamily: 'inherit',
        fontSize: 14,
        color: 'var(--dark-90)',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-15)',
        borderRadius: 9,
        padding: '8px 12px',
        outline: 'none',
      }}
    >
      {children}
    </select>
  );
}

function CrmTopbarAction({ onNewDeal }: { onNewDeal: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button
        variant="secondary"
        size="md"
        frontIcon={Plus}
        onClick={onNewDeal}
      >
        New Deal
      </Button>
    </div>
  );
}

export function CrmRoute() {
  return (
    <ModalStack>
      <CrmRouteInner />
    </ModalStack>
  );
}

function CrmRouteInner() {
  const devState = useDevState().getState('/h2/crm');
  if (devState === 'cold') {
    return (
      <H2Layout title="CRM">
        <CrmColdView />
      </H2Layout>
    );
  }
  return <CrmSteady />;
}

type CrmTab = 'pipeline' | 'people';

function CrmSteady() {
  const { openModal, closeModal } = useModals();
  const { showToast } = useToast();
  const [paused, setPaused] = useState(false);
  const [tab, setTab] = useState<CrmTab>('pipeline');

  const openDeal = (deal: Deal) => {
    openModal(DealDetailModal, {
      deal,
      onTakeOver: () => {
        closeModal();
        showToast({ message: `Took over ${deal.company} - AI paused on this deal` });
      },
      onApprove: () => {
        closeModal();
        showToast({ message: `Approved next AI step for ${deal.company}` });
      },
    });
  };

  const openNewDeal = () => {
    openModal(NewDealModal, {
      onCreate: () => {
        closeModal();
        showToast({ message: 'Deal created' });
      },
    });
  };

  const tabs = (
    <div style={{ display: 'inline-flex', gap: 6 }}>
      <TabChip selected={tab === 'pipeline'} onSelect={() => setTab('pipeline')}>
        Pipeline
      </TabChip>
      <TabChip selected={tab === 'people'} onSelect={() => setTab('people')}>
        People
      </TabChip>
    </div>
  );

  return (
    <H2Layout
      title="CRM"
      topbarCenter={tabs}
      topbarRight={<CrmTopbarAction onNewDeal={openNewDeal} />}
    >
      <div
        style={{
          margin: -24,
          display: 'grid',
          gridTemplateColumns: '1fr 260px',
          alignItems: 'start',
          minHeight: 'calc(100% + 48px)',
        }}
      >
        <div style={{ padding: '20px 24px 60px', minWidth: 0 }}>
          <KpiStrip />
          {tab === 'pipeline' ? <Pipeline onCardClick={openDeal} /> : <PeopleView />}
        </div>
        <BlazeSdrSidebar paused={paused} onTogglePaused={() => setPaused((p) => !p)} />
      </div>
    </H2Layout>
  );
}
