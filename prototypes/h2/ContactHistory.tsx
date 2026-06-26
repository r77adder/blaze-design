import { Avatar, StatusPill } from '@/staging';
import { Heading, Text } from '@/components';
import Voice from '@/icons/20/Voice';
import MessageText2 from '@/icons/20/MessageText2';
import MessageChat01 from '@/icons/20/MessageChat01';
import AlertTriangle from '@/icons/20/AlertTriangle';
import {
  STATUS_STYLES,
  SOURCE_LABELS,
  formatRelative,
  relativeMinutesAgo,
  type Contact,
  type Lead,
  type Message,
} from './sdr-data';

interface ContactHistoryProps {
  contact: Contact | null;
  leads: Lead[];
  onOpenLead: (id: string) => void;
}

export function ContactHistory({ contact, leads, onOpenLead }: ContactHistoryProps) {
  const sortedLeads = [...leads].sort(
    (a, b) => relativeMinutesAgo(a.last_activity_at) - relativeMinutesAgo(b.last_activity_at),
  );

  if (!contact) {
    return (
      <div style={{ padding: '40px 28px', textAlign: 'center' }}>
        <Text variant="secondary">Contact not found.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 860, margin: '0 auto' }}>
      {/* section: contact identity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
          paddingBottom: 24,
          borderBottom: '1px solid var(--dark-8)',
        }}
      >
        <Avatar fallback={initials(contact.name)} size={48} />
        <div>
          <Heading level={3} style={{ marginBottom: 4 }}>{contact.name}</Heading>
          <Text variant="secondary" style={{ fontSize: 14 }}>
            {contact.phone} · {contact.email}
          </Text>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              color: 'var(--dark-60)',
              background: 'var(--dark-4)',
              borderRadius: 999,
              padding: '4px 10px',
            }}
          >
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
          </span>
        </div>
      </div>

      {/* section: lead timeline */}
      {sortedLeads.length === 0 ? (
        <Text variant="secondary">No leads for this contact.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {sortedLeads.map((lead) => (
            <LeadSection key={lead.id} lead={lead} onOpenLead={onOpenLead} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeadSection({ lead, onOpenLead }: { lead: Lead; onOpenLead: (id: string) => void }) {
  const ss = STATUS_STYLES[lead.status];
  const channelLabel = SOURCE_LABELS[lead.channel];

  return (
    <div>
      {/* Lead header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--dark-60)',
            letterSpacing: '0.06em',
          }}
        >
          LEAD
        </Text>
        <Text style={{ fontSize: 14, color: 'var(--dark-80)' }}>
          {channelLabel} · {formatRelative(lead.created_at)}
        </Text>
        <StatusPill tone={ss.tone} size="sm">{ss.label}</StatusPill>
      </div>

      {/* Activity list */}
      <div
        style={{
          background: 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {lead.transcript.map((msg, i) => (
          <ActivityRow
            key={msg.id}
            msg={msg}
            lead={lead}
            isLast={i === lead.transcript.length - 1}
          />
        ))}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--dark-4)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenLead(lead.id)}
            style={{
              fontSize: 14,
              color: 'var(--purple)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: 0,
              fontWeight: 500,
            }}
          >
            View full thread →
          </button>
        </div>
      </div>
    </div>
  );
}

function isTrigger(content: string): boolean {
  return /escalat|flagged for owner|paused for owner|detected|rules-engine|morning digest/i.test(content);
}

function ActivityRow({
  msg,
  lead,
  isLast,
}: {
  msg: Message;
  lead: Lead;
  isLast: boolean;
}) {
  const borderStyle = isLast ? 'none' : '1px solid var(--dark-4)';

  if (msg.type === 'system') {
    const trigger = isTrigger(msg.content);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 16px',
          borderBottom: borderStyle,
          background: trigger ? 'rgba(237, 182, 44, 0.04)' : 'transparent',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {trigger ? (
            <AlertTriangle size={14} color="#edb62c" />
          ) : (
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '1.5px solid var(--dark-15)',
                display: 'inline-block',
              }}
            />
          )}
        </span>
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: trigger ? 'var(--dark-90)' : 'var(--dark-60)',
            lineHeight: 1.45,
          }}
        >
          {msg.content}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)', flexShrink: 0 }}>
          {formatRelative(msg.timestamp)}
        </Text>
      </div>
    );
  }

  if (msg.type === 'call') {
    const dur = msg.call?.duration ?? '';
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 16px',
          borderBottom: borderStyle,
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Voice size={14} color="var(--status-posting)" />
        </span>
        <Text style={{ flex: 1, fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.45 }}>
          {msg.role === 'system' ? 'Voicemail' : `${msg.role === 'ai' ? 'AI' : 'Call'}`} · {dur}
        </Text>
        <Text style={{ fontSize: 12, color: 'var(--dark-60)', flexShrink: 0 }}>
          {formatRelative(msg.timestamp)}
        </Text>
      </div>
    );
  }

  // text message
  const roleColor: Record<Message['role'], string> = {
    ai: 'var(--purple)',
    prospect: 'var(--dark-60)',
    owner: 'var(--status-posting)',
    system: 'var(--dark-60)',
  };
  const roleLabel: Record<Message['role'], string> = {
    ai: 'AI',
    prospect: 'Prospect',
    owner: 'Owner',
    system: 'System',
  };
  const channelIcon =
    lead.channel === 'inbound-call' ? (
      <MessageText2 size={13} color="var(--dark-40)" />
    ) : lead.channel === 'chat' ? (
      <MessageChat01 size={13} color="var(--dark-40)" />
    ) : (
      <MessageText2 size={13} color="var(--dark-40)" />
    );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '9px 16px',
        borderBottom: borderStyle,
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', marginTop: 2 }}>
        {channelIcon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: roleColor[msg.role],
            marginRight: 6,
          }}
        >
          {roleLabel[msg.role]}
        </span>
        <Text
          style={{
            fontSize: 14,
            color: 'var(--dark-80)',
            lineHeight: 1.45,
          }}
        >
          {msg.content.length > 120 ? `${msg.content.slice(0, 117)}…` : msg.content}
        </Text>
      </div>
      <Text style={{ fontSize: 12, color: 'var(--dark-60)', flexShrink: 0, marginTop: 2 }}>
        {formatRelative(msg.timestamp)}
      </Text>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
