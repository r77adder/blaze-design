/**
 * SegmentSelector — iOS segmented control.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 5016:16616
 *
 * 358×36, r100, dark-2 bg container.
 * Selected segment: white bg pill, box-shadow 0 2px 20px rgba(0,0,0,0.06).
 * Separators: dark-25 vertical lines, hidden adjacent to selected segment.
 * Text: 14px Söhne Kräftig 500.
 */

export interface SegmentSelectorProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  fullWidth?: boolean;
}

export function SegmentSelector({
  options,
  selected,
  onSelect,
  fullWidth = false,
}: SegmentSelectorProps) {
  const selectedIndex = options.indexOf(selected);

  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        width: fullWidth ? '100%' : 358,
        height: 36,
        background: 'var(--ios-dark-2)',
        borderRadius: 100,
        padding: 3,
        boxSizing: 'border-box',
        gap: 0,
      }}
    >
      {options.map((option, i) => {
        const isSelected = option === selected;
        const showSeparator =
          !isSelected && i > 0 && options[i - 1] !== selected;

        return (
          <div
            key={option}
            style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}
          >
            {/* Separator */}
            {showSeparator && (
              <div
                style={{
                  width: 1,
                  height: 16,
                  background: 'var(--ios-dark-25)',
                  opacity: 0.3,
                  flexShrink: 0,
                }}
              />
            )}

            <button
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelect(option)}
              style={{
                flex: 1,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 99,
                background: isSelected ? 'var(--ios-light-100)' : 'transparent',
                boxShadow: isSelected ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 8px',
                WebkitAppearance: 'none',
                appearance: 'none',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--ios-font)',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: 'var(--ios-dark-90)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {option}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
