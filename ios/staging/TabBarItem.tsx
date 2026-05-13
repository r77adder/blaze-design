/**
 * TabBarItem — single tab button used inside TabBar.
 *
 * Figma: EYf7EUoL3nmIKfMsOcHaG5, node 4404:17962
 *
 * Renders a 55 px tall flex-col button with a 24 px icon and a 10 px label.
 * The selected state adds a Dark-4 pill background (borderRadius 99).
 * Icon opacity is 0.4 inactive → 1.0 active; pass iconActive for a filled
 * variant (Home, Calendar, Brand Kit all have one).
 *
 * Used directly by TabBar but also exported so screens can render a tab item
 * in isolation (e.g. hero mock, design specs).
 */

export interface TabBarItemProps {
  /** Unique tab identifier — forwarded to onClick. */
  id: string;
  /** Label rendered below the icon. */
  label: string;
  /** SVG/PNG URL for the inactive state. */
  icon: string;
  /** SVG/PNG URL for the active (filled) state. Falls back to `icon`. */
  iconActive?: string;
  /** Whether this item is currently selected. */
  selected?: boolean;
  /** Called when the button is tapped. */
  onClick?: () => void;
}

export function TabBarItem({
  id,
  label,
  icon,
  iconActive,
  selected = false,
  onClick,
}: TabBarItemProps) {
  const iconSrc = selected && iconActive ? iconActive : icon;

  return (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      onClick={onClick}
      style={{
        flex: 1,
        height: 55,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        paddingTop: 6,
        paddingBottom: 7,
        paddingLeft: 8,
        paddingRight: 8,
        border: 'none',
        borderRadius: 99,
        background: selected ? 'var(--ios-dark-4)' : 'transparent',
        cursor: 'pointer',
        minWidth: 0,
        // Reset browser button defaults
        WebkitAppearance: 'none',
        appearance: 'none',
      }}
    >
      <img
        src={iconSrc}
        alt=""
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          opacity: 1,
        }}
      />
      <span
        style={{
          fontFamily: 'var(--ios-font)',
          fontSize: 10,
          fontWeight: 500, // Söhne Kräftig
          lineHeight: 1.4,
          letterSpacing: '0.1px',
          color: 'var(--ios-dark-90)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}
