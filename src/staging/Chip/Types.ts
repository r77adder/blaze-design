// Interactive selectable + deletable chip — extracted from prod's
// apps/blaze/src/components/Chip/Chip.tsx. Prod uses react-aria's
// useToggleButton + useToggleState; we hand-roll a controlled/uncontrolled
// `selected` pattern to keep the lib dependency-light. If a future need
// requires fuller a11y-press semantics, port the react-aria hooks then.
import type { ButtonHTMLAttributes, ComponentType } from 'react';

export type ChipVariant = 'default' | 'add';
export type ChipSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ChipIconProps {
  size?: number;
  color?: string;
}

export interface ChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ComponentType<ChipIconProps>;
  /**
   * Controlled selected state. If omitted, the chip manages its own
   * selection state internally (uncontrolled mode, like an unmanaged
   * checkbox).
   */
  selected?: boolean;
  /** Called with the new selected value whenever the chip toggles. */
  onSelectionChange?: (selected: boolean) => void;
  /** When true, renders an inline × that fires `onDelete` when clicked. */
  deletable?: boolean;
  onDelete?: () => void;
}
