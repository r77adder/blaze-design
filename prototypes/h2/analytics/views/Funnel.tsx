import { useState } from 'react';
import type { AttributionMode } from '../types';
import { FunnelStages } from '../components/FunnelStages';
import { SourceByStageTable } from '../components/SourceByStageTable';

/**
 * Funnel — Visitor → Lead → Client with source attribution. The funnel totals
 * are attribution-independent; the First/Last-touch toggle redistributes which
 * channel gets credit in the source-by-stage table.
 */
export function Funnel() {
  const [mode, setMode] = useState<AttributionMode>('last_touch');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <FunnelStages />
      <SourceByStageTable mode={mode} onModeChange={setMode} />
    </div>
  );
}
