import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Play3 from '@/icons/20/Play3';
import Pause from '@/icons/20/Pause';
import Volume05 from '@/icons/20/Volume05';
import VolumeOff from '@/icons/20/VolumeOff';

/**
 * Reel player for the Growth Engine Review video creative. If a real `src` is
 * supplied it renders a native <video> with the browser's own controls; with
 * no clip on hand it simulates playback, a slow Ken Burns zoom over the still
 * while a functional control bar (play/pause, seekable scrubber, running time,
 * volume) advances across a fixed timeline. Swap in an mp4 later by passing
 * `src` and the simulation drops out.
 */

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function ReelPlayer({
  poster, src, duration = 12, autoPlay = false, radius = 8,
}: { poster: string; src?: string; duration?: number; autoPlay?: boolean; radius?: number }) {
  if (src) {
    return (
      <video
        src={src}
        poster={poster}
        controls
        autoPlay={autoPlay}
        playsInline
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: radius, background: '#1a1a1a' }}
      />
    );
  }
  return <SimulatedReel poster={poster} duration={duration} autoPlay={autoPlay} radius={radius} />;
}

function SimulatedReel({ poster, duration, autoPlay, radius }: { poster: string; duration: number; autoPlay: boolean; radius: number }) {
  const [playing, setPlaying] = useState(autoPlay);
  const [t, setT] = useState(0);
  const [vol, setVol] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showVol, setShowVol] = useState(false);
  const raf = useRef(0);
  const last = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seeking = useRef(false);

  useEffect(() => {
    if (!playing) { last.current = null; cancelAnimationFrame(raf.current); return; }
    const loop = (ts: number) => {
      if (last.current == null) last.current = ts;
      const dt = (ts - last.current) / 1000; last.current = ts;
      setT((prev) => { const n = prev + dt; if (n >= duration) { setPlaying(false); return duration; } return n; });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, duration]);

  const play = () => { if (t >= duration) setT(0); setPlaying(true); };
  const toggle = () => { if (playing) setPlaying(false); else play(); };

  const seekTo = (clientX: number) => {
    const el = trackRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setT(ratio * duration);
  };
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    seeking.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => { if (seeking.current) seekTo(e.clientX); };
  const onTrackUp = (e: ReactPointerEvent<HTMLDivElement>) => { seeking.current = false; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ } };

  const progress = duration ? t / duration : 0;
  // Controls appear once playback has started (not on mere hover) so they never
  // collide with the card's own hover actions.
  const barsVisible = playing || t > 0;
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <div
      onMouseLeave={() => setShowVol(false)}
      onClick={(e) => { if (playing) { stop(e); setPlaying(false); } }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: radius }}
    >
      <img
        src={poster}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: `scale(${1 + 0.14 * progress})`, transformOrigin: '50% 45%', transition: seeking.current ? 'none' : 'transform 80ms linear' }}
      />

      {/* center play button (idle) */}
      {!playing && (
        <button
          type="button"
          aria-label="Play"
          onClick={(e) => { stop(e); play(); }}
          style={{ position: 'absolute', inset: 0, margin: 'auto', width: 56, height: 56, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          <span style={{ marginLeft: 3, display: 'inline-flex' }}><Play3 size={22} color="#fff" /></span>
        </button>
      )}

      {/* control bar */}
      <div
        onClick={stop}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 10px 8px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))',
          opacity: barsVisible ? 1 : 0, transition: 'opacity 150ms ease', pointerEvents: barsVisible ? 'auto' : 'none',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}
      >
        {/* scrubber */}
        <div
          ref={trackRef}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          style={{ height: 14, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', width: '100%', height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.35)' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, borderRadius: 99, background: '#fff' }} />
            <div style={{ position: 'absolute', left: `${progress * 100}%`, top: '50%', width: 11, height: 11, borderRadius: 99, background: '#fff', transform: 'translate(-50%,-50%)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
          </div>
        </div>

        {/* transport row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={(e) => { stop(e); toggle(); }} style={iconBtn}>
            {playing ? <Pause size={17} color="#fff" /> : <Play3 size={17} color="#fff" />}
          </button>
          <span style={{ fontSize: 11.5, color: '#fff', fontFamily: "'Sohne', sans-serif", fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1px' }}>
            {fmt(t)} / {fmt(duration)}
          </span>
          <div
            onMouseEnter={() => setShowVol(true)}
            onMouseLeave={() => setShowVol(false)}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {showVol && (
              <input
                type="range" min={0} max={1} step={0.01} value={muted ? 0 : vol}
                onChange={(e) => { const v = Number(e.target.value); setVol(v); setMuted(v === 0); }}
                onClick={stop}
                style={{ width: 56, accentColor: '#fff', cursor: 'pointer' }}
              />
            )}
            <button type="button" aria-label="Volume" onClick={(e) => { stop(e); setMuted((m) => !m); }} style={iconBtn}>
              {muted || vol === 0 ? <VolumeOff size={17} color="#fff" /> : <Volume05 size={17} color="#fff" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtn = { appearance: 'none' as const, border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
