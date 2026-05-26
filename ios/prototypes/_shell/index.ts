// iOS prototype shell — parallel to prototypes/_shell/
// Provides the phone frame chrome used by all ios/prototypes/<slug>/ entries.
// State management is re-exported from the web shell (StatePicker is platform-agnostic).

export { PhoneFrame } from './PhoneFrame';
export type { PhoneFrameProps } from './PhoneFrame';
export { StatusBar } from './StatusBar';
export type { StatusBarProps } from './StatusBar';

// Re-export generic state primitives from the web shell for convenience so that
// ios/prototypes/<slug>/index.tsx only needs one _shell import.
export { StatePicker, useStateContext } from '../../../prototypes/_shell';
