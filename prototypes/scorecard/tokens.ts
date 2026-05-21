export type Status = 'bad' | 'warn' | 'good';

export function statusColor(s: Status): string {
  if (s === 'bad') return 'var(--red-70)';
  if (s === 'warn') return 'var(--status-review)';
  return 'var(--status-approved)';
}

/** Faint tinted track behind the ring arc (matches PR #22 scoreTone.track). */
export function statusTrack(s: Status): string {
  if (s === 'bad') return 'rgba(188, 1, 11, 0.10)';
  if (s === 'warn') return 'rgba(237, 182, 44, 0.16)';
  return 'rgba(4, 175, 0, 0.12)';
}

/** Faded disk fill inside the ring — visual weight on neutral backgrounds. */
export function statusDisk(s: Status): string {
  if (s === 'bad') return 'rgba(188, 1, 11, 0.05)';
  if (s === 'warn') return 'rgba(237, 182, 44, 0.07)';
  return 'rgba(4, 175, 0, 0.06)';
}

export function statusSoft(s: Status): string {
  if (s === 'bad') return 'rgba(188, 1, 11, 0.08)';
  if (s === 'warn') return 'rgba(237, 182, 44, 0.12)';
  return 'rgba(4, 175, 0, 0.08)';
}

export function statusLabel(s: Status): string {
  if (s === 'bad') return 'Poor';
  if (s === 'warn') return 'Fair';
  return 'Good';
}
