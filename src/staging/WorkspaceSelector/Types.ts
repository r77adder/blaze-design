// Replaces the standalone <Logo> at the top of the sidebar. Mirrors prod's
// WorkspaceDropdown trigger (redesign-mode shape only — no dropdown menu yet,
// just the trigger affordance).
import type { HTMLAttributes } from 'react';

export interface WorkspaceSelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Workspace name shown next to the logo button. Required. */
  workspaceName: string;
  /** Optional URL for the workspace's brand image. */
  workspaceLogoSrc?: string;
  /** Initials/character to show inside the brand-mark square if no src.
   *  Defaults to first letter of workspaceName uppercased. */
  workspaceLogoFallback?: string;
  /** Background color for the fallback brand-mark square. Defaults to
   *  var(--brand) (yellow). */
  workspaceLogoBg?: string;
  /** Fires when the selector is clicked or activated via Enter/Space. */
  onPress?: () => void;
}
