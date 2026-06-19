import { useState } from 'react';
import { Modal } from '@/components';
import type { StackModalProps } from '@/components';
import CheckboxLight from '@/icons/20/CheckboxLight';
import CheckboxChecked from '@/icons/20/CheckboxChecked';
import { AUSTIN_LOCATIONS, photoUrl, regionLine, fullAddress } from './locations';
import type { BusinessLocation } from './locations';

/**
 * Location picker — shown on the Local SEO cold state right after the user
 * presses "Connect Google Business Profile", before the auditing/loading
 * state. Google returned multiple Business Profiles under this account; they
 * all share the same business name, so the address is the only thing that
 * tells them apart. The user checks the ones Blaze should manage, then
 * confirms — which kicks off the audit.
 *
 * Open via:
 *   openModal(LocationPickerModal, { onConfirm: () => setView('auditing') })
 */

/** Profile photo thumbnail for a location. */
function LocationThumb({ photo, alt }: { photo: string; alt: string }) {
  return (
    <img
      src={photo}
      alt={alt}
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        objectFit: 'cover',
        flexShrink: 0,
        border: '1px solid var(--dark-8)',
        background: 'var(--dark-4)',
      }}
    />
  );
}

interface LocationPickerModalProps {
  locations?: BusinessLocation[];
  /** Fired when the user confirms their selection. Receives the chosen ids. */
  onConfirm: (selectedIds?: string[]) => void;
}

export function LocationPickerModal({
  close,
  locations = AUSTIN_LOCATIONS,
  onConfirm,
}: StackModalProps & LocationPickerModalProps) {
  // Default to everything selected — the common "we found these, untick any
  // you don't want" pattern.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(locations.map((l) => l.id)),
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const count = selected.size;

  return (
    <Modal.Root size="md" aria-labelledby="location-picker-title" data-testid="location-picker-modal">
      <Modal.Header
        title="Select your locations"
        id="location-picker-title"
        onClose={close}
        compact={false}
      />
      <Modal.Content compact={false}>
        <span style={{ display: 'block', fontSize: 14, color: 'var(--dark-90)', lineHeight: 1.55, marginBottom: 18 }}>
          We found {locations.length} Google Business Profiles under this account. They share the
          same name — pick the ones you&apos;d like Blaze to manage.
        </span>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--dark-8)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {locations.map((loc, i) => {
            const isChecked = selected.has(loc.id);
            return (
              <div
                key={loc.id}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => toggle(loc.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggle(loc.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--dark-4)',
                  background: isChecked ? 'var(--dark-2)' : 'var(--light-100)',
                  cursor: 'pointer',
                }}
              >
                {isChecked ? (
                  <CheckboxChecked size={20} color="var(--dark-90)" />
                ) : (
                  <CheckboxLight size={20} color="var(--dark-40)" />
                )}
                <LocationThumb photo={photoUrl(loc, 96, 96)} alt={`${loc.name} — ${regionLine(loc)}`} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--dark-90)' }}>
                    {loc.name}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--dark-60)', lineHeight: 1.4 }}>
                    {fullAddress(loc)} · {loc.neighborhood}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal.Content>
      <Modal.Footer>
        <Modal.FooterContent slot="left">
          <Modal.FooterButton variant="ghost" onPress={close}>
            Cancel
          </Modal.FooterButton>
        </Modal.FooterContent>
        <Modal.FooterContent slot="right">
          <Modal.FooterButton
            variant="primary"
            isDisabled={count === 0}
            onPress={() => {
              onConfirm([...selected]);
              close();
            }}
          >
            {count === 0
              ? 'Select a location'
              : `Connect ${count} location${count === 1 ? '' : 's'}`}
          </Modal.FooterButton>
        </Modal.FooterContent>
      </Modal.Footer>
    </Modal.Root>
  );
}
