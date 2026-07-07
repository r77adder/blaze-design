import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { prototypeRoutes, iosPrototypeRoutes, type PrototypeRoute } from './router';
import { CommentOverlay } from '../../prototypes/_shell/CommentOverlay';
import '../tokens/colors.css';
import '../tokens/fonts.scss';
import '../tokens/reset.css';
import '../../ios/tokens/colors.css';
import '../../ios/tokens/spacing.css';
import '../../ios/tokens/typography.css';

const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 };
const linkStyle: React.CSSProperties = { fontFamily: "'Sohne', sans-serif", fontSize: 14, color: 'var(--dark-90)', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, display: 'inline-block' };

function Section({ title, routes, prefix = '' }: { title: string; routes: typeof prototypeRoutes; prefix?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: "'Sohne', sans-serif", fontSize: 11, fontWeight: 500, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>{title}</div>
      {routes.length === 0 ? (
        <p style={{ fontFamily: "'Sohne', sans-serif", fontSize: 13, color: 'var(--dark-40)', margin: 0 }}>No prototypes yet.</p>
      ) : (
        <ul style={listStyle}>
          {routes.map((r) => (
            <li key={r.slug}>
              <Link to={`${prefix}/${r.slug}`} style={linkStyle}>{r.slug}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const FONT_STACK = "'Sohne', sans-serif";

/** Friendly relative timestamp ("3h ago", "2d ago"). Mirrors the H2 SDR
 *  helper but lives here so the index has no dependency on prototype code. */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'unknown';
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

/** Title-case a slug for display: "hello-world" → "Hello world". */
function slugToTitle(slug: string): string {
  if (!slug) return slug;
  const spaced = slug.replace(/[-_]/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function Card({ route, prefix = '' }: { route: PrototypeRoute; prefix?: string }) {
  const title = route.title ?? slugToTitle(route.slug);
  return (
    <Link
      to={`${prefix}/${route.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--light-100)',
        border: '1px solid var(--dark-8)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 120ms, box-shadow 120ms, transform 120ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-15)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--dark-8)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          padding: '16px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--dark-90)',
            letterSpacing: '0.2px',
          }}
        >
          {title}
        </div>
        {route.description && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--dark-80)',
            }}
          >
            {route.description}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 12,
            color: 'var(--dark-60)',
            marginTop: 4,
          }}
        >
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            {prefix}/{route.slug}
          </span>
          {route.lastModified && (
            <span title={new Date(route.lastModified).toLocaleString()}>
              Updated {formatRelative(route.lastModified)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Index() {
  // Body background — applied only while the index is mounted so prototypes
  // keep their own (white) surface.
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = '#ECEFF2';
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  if (prototypeRoutes.length === 0 && iosPrototypeRoutes.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: FONT_STACK }}>
        <h1>No prototypes yet</h1>
        <p>
          Tell Claude: <code>/new-prototype hello-world</code>
        </p>
      </main>
    );
  }
  return (
    <main
      style={{
        padding: '40px 32px 80px',
        fontFamily: FONT_STACK,
        minHeight: '100vh',
        background: '#ECEFF2',
        color: 'var(--dark-90)',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <header style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 500,
              letterSpacing: '0.32px',
              margin: 0,
            }}
          >
            Prototypes
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              color: 'var(--dark-60)',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {prototypeRoutes.length + iosPrototypeRoutes.length} prototype{prototypeRoutes.length + iosPrototypeRoutes.length === 1 ? '' : 's'} ·
            sorted by most recently updated
          </p>
        </header>
        {(() => {
          const gridStyle: React.CSSProperties = {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 40,
          };
          const labelStyle: React.CSSProperties = { fontFamily: FONT_STACK, fontSize: 11, fontWeight: 500, color: 'var(--dark-40)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 };
          // 'mobile-app' (the unified iOS prototype) sorts first within iOS.
          const iosSorted = [...iosPrototypeRoutes].sort((a, b) =>
            a.slug === 'mobile-app' ? -1 : b.slug === 'mobile-app' ? 1 : a.slug.localeCompare(b.slug));
          const webActive = prototypeRoutes.filter((r) => !r.archived);
          const webArchived = prototypeRoutes.filter((r) => r.archived);
          const iosActive = iosSorted.filter((r) => !r.archived);
          const iosArchived = iosSorted.filter((r) => r.archived);
          const section = (label: string, routes: typeof prototypeRoutes, prefix?: string, dimmed?: boolean) =>
            routes.length > 0 ? (
              <>
                <div style={labelStyle}>{label}</div>
                <div style={dimmed ? { ...gridStyle, opacity: 0.6 } : gridStyle}>
                  {routes.map((r) => <Card key={r.slug} route={r} prefix={prefix} />)}
                </div>
              </>
            ) : null;
          // Active sections first (Web, then iOS), then the archived groups.
          return (
            <>
              {section('Web', webActive)}
              {section('iOS', iosActive, '/ios')}
              {section('Web · Archived', webArchived, undefined, true)}
              {section('iOS · Archived', iosArchived, '/ios', true)}
            </>
          );
        })()}
      </div>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CommentOverlay />
      <Routes>
        <Route path="/" element={<Index />} />
        {prototypeRoutes.map(({ slug, Component }) => (
          <Route key={slug} path={`/${slug}/*`} element={<Component />} />
        ))}
        {iosPrototypeRoutes.map(({ slug, Component }) => (
          <Route key={slug} path={`/ios/${slug}/*`} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
