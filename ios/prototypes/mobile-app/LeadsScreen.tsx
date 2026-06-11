import { useState, useMemo } from 'react';
import { ToolbarButton, SelectionPill } from '@ios/components';
import {
  LEADS,
  STATUS_STYLES,
  ALL_STATUSES,
  formatRelative,
  relativeMinutes,
  isAnonymousName,
  type Lead,
  type Status,
} from './leads-data';
import { BookingsSection, bookingsCount } from './BookingsScreen';
import { SwipeableRow } from './SwipeableRow';
import phoneCallIcon from '@ios/icons/phone-call01.svg';

const font = 'var(--ios-font)';

// 'bookings' is a virtual filter: instead of filtering the lead list it
// swaps the row list out for the booking sections (Upcoming + Past).
type Filter = Status | 'bookings';

function Avatar({ lead }: { lead: Lead }) {
  const { avatarUrl, name } = lead.prospect;
  const anonymous = isAnonymousName(name);
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 99,
        flexShrink: 0,
        background: '#45164a',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : anonymous ? (
        <img
          src={phoneCallIcon}
          alt=""
          aria-hidden="true"
          style={{ width: 22, height: 22, filter: 'invert(1)', opacity: 0.9 }}
        />
      ) : (
        <span style={{ fontFamily: font, fontSize: 18, fontWeight: 500, color: '#ffffff', lineHeight: 1 }}>
          {initial}
        </span>
      )}
    </div>
  );
}

export function LeadsScreen({
  onLeadClick,
  onStatusEdit,
  statusOverrides,
}: {
  onLeadClick: (id: string) => void;
  onStatusEdit: (leadId: string) => void;
  statusOverrides: Record<string, Status>;
}) {
  const [filter, setFilter] = useState<Filter>('human-handling');

  // Resolve a lead's effective status by checking the override map first.
  const effectiveStatus = (lead: Lead): Status => statusOverrides[lead.id] ?? lead.status;

  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = {
      'human-handling': 0,
      'ai-handling': 0,
      'resolved': 0,
      'opted-out': 0,
    };
    for (const lead of LEADS) counts[effectiveStatus(lead)] += 1;
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusOverrides]);

  const filtered = useMemo(() => {
    if (filter === 'bookings') return [];
    const list = LEADS.filter((l) => effectiveStatus(l) === filter);
    list.sort((a, b) => relativeMinutes(a.last_activity_at) - relativeMinutes(b.last_activity_at));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, statusOverrides]);

  const totalBookings = useMemo(() => bookingsCount(), []);

  return (
    <div style={{ fontFamily: font, minHeight: '100%' }}>

      {/* Header — inline (no border, no gray shade), matches the page bg so
          there's no visual seam between the title row and the content. */}
      <div style={{
        height: 68,
        padding: '0 20px 12px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}>
        <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, lineHeight: 1.4, color: 'var(--ios-dark-90)' }}>
          Receptionist
        </span>
        <ToolbarButton variant="credits" credits={96} />
      </div>

      {/* Content — outer container has no horizontal padding so the list rows
          can stretch all the way to the phone edges. Each row sets its own
          20px horizontal padding internally. */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Filter row — sticky to the top of the scroll container. As the
            user scrolls past the header, the filter pills pin themselves
            at the top with a frosted-glass background so list content
            slides cleanly underneath. */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 5,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 12,
            paddingBottom: 12,
            background: 'rgba(247,247,247,0.85)',
            backdropFilter: 'saturate(140%) blur(20px)',
            WebkitBackdropFilter: 'saturate(140%) blur(20px)',
          }}
        >
          {ALL_STATUSES.flatMap((s) => {
            const pill = (
              <SelectionPill
                key={s}
                label={STATUS_STYLES[s].label}
                count={statusCounts[s]}
                selected={filter === s}
                onClick={() => setFilter(s)}
              />
            );
            // Inject the Bookings pill directly after Needs Attention so it
            // sits next in line for "needs your attention now" work.
            if (s === 'human-handling') {
              return [
                pill,
                <SelectionPill
                  key="bookings"
                  label="Bookings"
                  count={totalBookings}
                  selected={filter === 'bookings'}
                  onClick={() => setFilter('bookings')}
                />,
              ];
            }
            return [pill];
          })}
        </div>

        {/* Bookings section — replaces the lead list when the "Bookings"
            filter is selected. Tapping a row opens the lead conversation
            via the same onLeadClick handler so back navigation works. */}
        {filter === 'bookings' ? (
          <BookingsSection onLeadClick={onLeadClick} />
        ) : filtered.length === 0 ? (
          <div
            style={{
              fontFamily: font,
              fontSize: 14,
              color: 'var(--ios-dark-60)',
              textAlign: 'center',
              paddingTop: 40,
              letterSpacing: '0.14px',
            }}
          >
            No leads match this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((lead, i) => {
              const isLast = i === filtered.length - 1;
              // Mirrors PR35: any lead with activity in the last 20 minutes
              // is treated as "unread" — gets a blue dot to the left of the
              // avatar and a bolder name. Older leads read as already-handled.
              const unread = relativeMinutes(lead.last_activity_at) <= 20;
              return (
                <SwipeableRow
                  key={lead.id}
                  onClick={() => onLeadClick(lead.id)}
                  onCall={() => { window.location.href = `tel:${lead.prospect.phone}`; }}
                  onText={() => { window.location.href = `sms:${lead.prospect.phone}`; }}
                  onStatus={() => onStatusEdit(lead.id)}
                >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '14px 20px',
                    // Unread rows pop with a white surface; read rows blend
                    // with the page background gray so the inbox reads more
                    // like a sorted, partially-handled list.
                    background: unread ? 'white' : 'var(--ios-background-gray, #f7f7f7)',
                    borderBottom: isLast ? 'none' : '1px solid var(--ios-dark-4)',
                    textAlign: 'left',
                    fontFamily: font,
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Unread dot — sits in the row's left gutter with a
                      visible gap from the avatar (~10px between dot and
                      avatar edge). */}
                  {unread && (
                    <span
                      aria-label="Unread"
                      style={{
                        position: 'absolute',
                        left: 4,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 8,
                        height: 8,
                        borderRadius: 99,
                        background: '#0083e2',
                      }}
                    />
                  )}

                  <Avatar lead={lead} />

                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Top line: name (left) + relative time (right) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          flex: 1,
                          fontFamily: font,
                          fontSize: 16,
                          fontWeight: unread ? 500 : 400,
                          lineHeight: 1.4,
                          color: 'var(--ios-dark-90)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0,
                        }}
                      >
                        {lead.prospect.name}
                      </span>
                      <span
                        style={{
                          fontFamily: font,
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: unread ? 'var(--ios-dark-90)' : 'var(--ios-dark-40)',
                          letterSpacing: '0.12px',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {formatRelative(lead.last_activity_at)}
                      </span>
                    </div>

                    {/* Middle line: company */}
                    <div
                      style={{
                        fontFamily: font,
                        fontSize: 13,
                        fontWeight: 400,
                        lineHeight: 1.4,
                        color: unread ? 'var(--ios-dark-80)' : 'var(--ios-dark-40)',
                        letterSpacing: '0.13px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lead.prospect.company}
                    </div>

                    {/* Bottom line: hand-authored needs_summary — "what's
                        next" for this lead rather than a raw chat excerpt. */}
                    {lead.needs_summary && (
                      <div
                        style={{
                          marginTop: 2,
                          fontFamily: font,
                          fontSize: 13,
                          fontWeight: 400,
                          lineHeight: 1.4,
                          color: unread ? 'var(--ios-dark-80)' : 'var(--ios-dark-40)',
                          letterSpacing: '0.13px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lead.needs_summary}
                      </div>
                    )}
                  </div>
                </div>
                </SwipeableRow>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
