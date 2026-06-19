import { useState } from 'react';
import { Check as CheckSm } from '@/icons/16';
import ChevronDown from '@/icons/16/ChevronDown';
import PenEdit from '@/icons/16/PenEdit';
import { AUSTIN_LOCATIONS, photoUrl } from './locations';

/**
 * Location switcher — the demo account manages several Google Business
 * Profiles that all share one name, so the dropdown leads with the
 * neighborhood and street to tell them apart. Switching swaps which location
 * the surrounding view renders. Each row carries a pencil that fires `onEdit`
 * for the picked location (edits the selected profile).
 *
 * Shared by the steady-state Profile tab (OrganicProfile) and the cold-state
 * review step (MapRankingBody › ConfirmStep).
 */
export function LocationSwitcher({
  value,
  onChange,
  onEdit,
}: {
  value: string;
  onChange: (id: string) => void;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const current = AUSTIN_LOCATIONS.find((l) => l.id === value) ?? AUSTIN_LOCATIONS[0];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: open ? 'var(--dark-4)' : 'var(--light-100)',
          border: '1px solid var(--dark-8)',
          borderRadius: 8,
          padding: '5px 10px 5px 6px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <img
          src={photoUrl(current, 64, 64)}
          alt=""
          style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--dark-8)', background: 'var(--dark-4)' }}
        />
        <span style={{ fontSize: 14, color: 'var(--dark-90)', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 500 }}>{current.neighborhood}</span>
          <span style={{ color: 'var(--dark-40)', margin: '0 6px' }}>·</span>
          <span style={{ color: 'var(--dark-60)' }}>{current.street}</span>
        </span>
        <ChevronDown size={16} color="var(--dark-60)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 41,
              minWidth: 320,
              background: 'var(--light-100)',
              border: '1px solid var(--dark-8)',
              borderRadius: 12,
              boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              padding: 4,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--dark-40)', padding: '8px 10px 6px' }}>
              {AUSTIN_LOCATIONS.length} locations connected
            </div>
            {AUSTIN_LOCATIONS.map((loc) => {
              const isSelected = loc.id === value;
              return (
                <div
                  key={loc.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onChange(loc.id);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      onChange(loc.id);
                      setOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    background: isSelected ? 'var(--dark-2)' : 'transparent',
                    borderRadius: 8,
                    padding: '8px 8px 8px 10px',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={photoUrl(loc, 80, 80)}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--dark-8)', background: 'var(--dark-4)' }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)', lineHeight: 1.35 }}>
                      {loc.neighborhood}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--dark-60)', lineHeight: 1.35 }}>
                      {loc.street}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--dark-40)', lineHeight: 1.35 }}>
                      {loc.cityState}
                    </span>
                  </div>
                  <button
                    aria-label={`Edit ${loc.neighborhood} profile`}
                    title="Edit this profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(loc.id);
                      setOpen(false);
                      onEdit();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <PenEdit size={14} color="var(--dark-40)" />
                  </button>
                  {isSelected && <CheckSm size={16} color="var(--dark-90)" style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
