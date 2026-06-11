import { useMemo } from 'react';
import { ContentStatusPill } from '@ios/components';
import {
  LEADS,
  isAnonymousName,
  effectiveBookingOutcome,
  BOOKING_OUTCOME_STYLES,
  type Lead,
  type Booking,
} from './leads-data';
import { SwipeableRow } from './SwipeableRow';
import clockCheckIcon from '@ios/icons/clock-check.svg';
import clockBackwardIcon from '@ios/icons/clock-backward.svg';
import chevronRightSmall from '@ios/icons/chevron-right-small.svg';
import phoneCallIcon from '@ios/icons/phone-call01.svg';

const font = 'var(--ios-font)';

interface BookingItem {
  lead: Lead;
  booking: Booking;
}

/** Mirrors PR35's BookingsTab logic: only resolved leads with a scheduled
 *  booking surface here. Split into Upcoming (`scheduled_when > 0`, soonest
 *  first) and Past (`<= 0`, most-recent first). */
function partition(): { upcoming: BookingItem[]; past: BookingItem[] } {
  const items: BookingItem[] = [];
  for (const lead of LEADS) {
    if (lead.status !== 'resolved') continue;
    for (const booking of lead.bookings) {
      if (typeof booking.scheduled_when !== 'number') continue;
      items.push({ lead, booking });
    }
  }
  const upcoming = items
    .filter((i) => (i.booking.scheduled_when ?? 0) > 0)
    .sort((a, b) => (a.booking.scheduled_when ?? 0) - (b.booking.scheduled_when ?? 0));
  const past = items
    .filter((i) => (i.booking.scheduled_when ?? 0) <= 0)
    .sort((a, b) => (b.booking.scheduled_when ?? 0) - (a.booking.scheduled_when ?? 0));
  return { upcoming, past };
}

function Avatar({ lead }: { lead: Lead }) {
  const { avatarUrl, name } = lead.prospect;
  const anonymous = isAnonymousName(name);
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 44,
        height: 44,
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
        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : anonymous ? (
        <img
          src={phoneCallIcon}
          alt=""
          aria-hidden="true"
          style={{ width: 20, height: 20, filter: 'invert(1)', opacity: 0.9 }}
        />
      ) : (
        <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: '#ffffff', lineHeight: 1 }}>
          {initial}
        </span>
      )}
    </div>
  );
}

/** Drop the leading "+1 " country code on a US-format phone string so it
 *  fits comfortably on the row's secondary line. */
function shortPhone(phone: string): string {
  return phone.replace(/^\+1\s*/, '').trim();
}

/** Pull the last "·"-delimited segment of the company field to use as a
 *  short location label. "Tran Family · Pflugerville" → "Pflugerville".
 *  Falls back to the full string when there's no separator. */
function shortLocation(company: string): string {
  const parts = company.split('·').map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : company;
}

function BookingRow({ item, isLast, isPast, onClick }: { item: BookingItem; isLast: boolean; isPast: boolean; onClick: () => void }) {
  const { lead, booking } = item;
  const phoneAndLocation = `${shortPhone(lead.prospect.phone)} ${shortLocation(lead.prospect.company)}`;
  const outcomeStyle = BOOKING_OUTCOME_STYLES[effectiveBookingOutcome(booking)];
  return (
    <SwipeableRow
      onClick={onClick}
      onCall={() => { window.location.href = `tel:${lead.prospect.phone}`; }}
      onText={() => { window.location.href = `sms:${lead.prospect.phone}`; }}
      onStatus={() => { /* no-op for prototype — would open a status picker */ }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          padding: '14px 20px',
          background: isPast ? 'var(--ios-background-gray, #f7f7f7)' : 'white',
          borderBottom: isLast ? 'none' : '1px solid var(--ios-dark-4)',
          textAlign: 'left',
          fontFamily: font,
          boxSizing: 'border-box',
        }}
      >
        <Avatar lead={lead} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Top line: prospect name + outcome pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                flex: 1,
                fontFamily: font,
                fontSize: 16,
                fontWeight: isPast ? 400 : 500,
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
            <div style={{ flexShrink: 0 }}>
              <ContentStatusPill variant={outcomeStyle.variant} label={outcomeStyle.label} />
            </div>
          </div>

          {/* Middle line: phone + short location (no +1, just a space
              between the number and the location). */}
          <div
            style={{
              fontFamily: font,
              fontSize: 13,
              fontWeight: 400,
              lineHeight: 1.4,
              color: isPast ? 'var(--ios-dark-40)' : 'var(--ios-dark-80)',
              letterSpacing: '0.13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {phoneAndLocation}
          </div>

          {/* Bottom line: scheduled when */}
          <div
            style={{
              marginTop: 2,
              fontFamily: font,
              fontSize: 12,
              fontWeight: 400,
              lineHeight: 1.4,
              color: isPast ? 'var(--ios-dark-40)' : 'var(--ios-dark-60)',
              letterSpacing: '0.12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {booking.when}
          </div>
        </div>

        <img
          src={chevronRightSmall}
          alt=""
          aria-hidden="true"
          style={{ width: 16, height: 16, opacity: 0.25, flexShrink: 0 }}
        />
      </div>
    </SwipeableRow>
  );
}

function SectionHeader({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '20px 20px 8px',
    }}>
      <img src={icon} alt="" aria-hidden="true" style={{ width: 18, height: 18, opacity: 0.6, flexShrink: 0 }} />
      <span style={{
        flex: 1,
        fontFamily: font,
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.4,
        color: 'var(--ios-dark-90)',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: font,
        fontSize: 13,
        fontWeight: 400,
        color: 'var(--ios-dark-40)',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
      }}>
        {count}
      </span>
    </div>
  );
}

/** Total count of scheduled bookings (upcoming + past) across all resolved
 *  leads — exported so the host filter pill can show the count in its
 *  counter chip without re-partitioning. */
export function bookingsCount(): number {
  let n = 0;
  for (const lead of LEADS) {
    if (lead.status !== 'resolved') continue;
    for (const booking of lead.bookings) {
      if (typeof booking.scheduled_when === 'number') n += 1;
    }
  }
  return n;
}

/** Embeddable "Bookings" content — pure list of Upcoming + Past booking
 *  rows. Renders inline (no header chrome) so the host can place it inside
 *  a tab/filter view (today: the Receptionist tab's `bookings` filter). */
export function BookingsSection({ onLeadClick }: { onLeadClick: (id: string) => void }) {
  const { upcoming, past } = useMemo(() => partition(), []);
  const isEmpty = upcoming.length === 0 && past.length === 0;

  if (isEmpty) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        fontFamily: font,
        fontSize: 14,
        color: 'var(--ios-dark-60)',
        letterSpacing: '0.14px',
      }}>
        No bookings yet.
      </div>
    );
  }

  return (
    <>
      {upcoming.length > 0 && (
        <div>
          <SectionHeader icon={clockCheckIcon} label="Upcoming" count={upcoming.length} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcoming.map((item, i) => (
              <BookingRow
                key={`${item.lead.id}-${item.booking.id}`}
                item={item}
                isLast={i === upcoming.length - 1}
                isPast={false}
                onClick={() => onLeadClick(item.lead.id)}
              />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <SectionHeader icon={clockBackwardIcon} label="Past" count={past.length} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {past.map((item, i) => (
              <BookingRow
                key={`${item.lead.id}-${item.booking.id}`}
                item={item}
                isLast={i === past.length - 1}
                isPast={true}
                onClick={() => onLeadClick(item.lead.id)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
