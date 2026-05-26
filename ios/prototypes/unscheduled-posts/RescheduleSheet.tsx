import { useState } from 'react';
import xIcon from '@ios/icons/x-02.svg';
import chevronLeftIcon from '@ios/icons/chevron-left.svg';
import chevronRightIcon from '@ios/icons/chevron-right.svg';
import clockIcon from '@ios/icons/clock-check.svg';
import checkIcon from '@ios/icons/check-02.svg';

const font = 'var(--ios-font)';
const TODAY = 17;

// September 2026 starts on Tuesday (col index 2)
const SEPTEMBER_DAYS: Array<number | null> = [
  null, null, 1,  2,  3,  4,  5,
  6,   7,    8,  9,  10, 11, 12,
  13,  14,   15, 16, 17, 18, 19,
  20,  21,   22, 23, 24, 25, 26,
  27,  28,   29, 30, null, null, null,
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function RescheduleSheet({ onBack, onClose, onConfirm }: Props) {
  const [selected, setSelected] = useState(18);

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 40 }} />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'white', borderRadius: '28px 28px 0 0',
        boxShadow: '0 -4px 60px rgba(0,0,0,0.18)',
        zIndex: 50, overflow: 'hidden',
      }}>
        {/* Drag handle */}
        <div style={{ width: 58, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.08)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ height: 60, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button" onClick={onBack}
            style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img src={chevronLeftIcon} alt="Back" style={{ width: 18, height: 18 }} />
          </button>
          <span style={{ fontFamily: font, fontSize: 18, fontWeight: 400, color: 'var(--ios-dark-90)' }}>Schedule</span>
          <button
            type="button" onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(0,0,0,0.06)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img src={xIcon} alt="Close" style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Calendar */}
        <div style={{ padding: '0 16px 8px', borderTop: '1px solid var(--ios-dark-4)' }}>
          {/* Month nav */}
          <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={chevronLeftIcon} alt="Prev month" style={{ width: 18, height: 18, opacity: 0.4 }} />
            </button>
            <span style={{ fontFamily: font, fontSize: 17, fontWeight: 500, color: 'var(--ios-dark-90)' }}>September 2026</span>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={chevronRightIcon} alt="Next month" style={{ width: 18, height: 18, opacity: 0.4 }} />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
            {DAY_LABELS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', paddingBottom: 4 }}>
                <span style={{ fontFamily: font, fontSize: 11, color: 'var(--ios-dark-40)', letterSpacing: '0.5px' }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {SEPTEMBER_DAYS.map((day, i) => {
              if (day === null) return <div key={i} style={{ height: 38 }} />;
              const isToday    = day === TODAY;
              const isSelected = day === selected;
              const isPast     = day < TODAY;
              return (
                <div
                  key={i}
                  onClick={() => !isPast && setSelected(day)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 38, cursor: isPast ? 'default' : 'pointer' }}
                >
                  <div style={{
                    width: 34, height: 34, borderRadius: 99,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'var(--ios-dark-90)' : 'transparent',
                    border: isToday && !isSelected ? '1.5px solid var(--ios-dark-90)' : 'none',
                  }}>
                    <span style={{
                      fontFamily: font, fontSize: 15,
                      color: isSelected ? 'white' : isPast ? 'var(--ios-dark-40)' : 'var(--ios-dark-90)',
                      fontWeight: isToday ? 500 : 400,
                    }}>
                      {day}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time row */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ios-dark-4)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={clockIcon} alt="" aria-hidden="true" style={{ width: 18, height: 18 }} />
          </div>
          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 400, color: 'var(--ios-dark-90)', flex: 1 }}>2:00 PM CT</span>
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
            <path d="M1 1l6 6-6 6" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 36px', display: 'flex', gap: 10 }}>
          <button
            type="button"
            style={{
              flex: 1, height: 52, borderRadius: 99,
              background: 'transparent',
              border: '1.5px solid var(--ios-dark-90)',
              cursor: 'pointer',
              fontFamily: font, fontSize: 16, fontWeight: 500, color: 'var(--ios-dark-90)',
            }}
          >
            Post now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, height: 52, borderRadius: 99,
              background: 'var(--ios-dark-90)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <img src={checkIcon} alt="" aria-hidden="true" style={{ width: 16, height: 16, filter: 'invert(1)' }} />
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 500, color: 'white' }}>Confirm schedule</span>
          </button>
        </div>
      </div>
    </>
  );
}
