import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { prototypeRoutes, iosPrototypeRoutes } from './router';
import { prototypeRoutes } from './router';
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

function Index() {
  return (
    <main style={{ padding: 40, fontFamily: "'Sohne', sans-serif", maxWidth: 480 }}>
      <h1 style={{ fontFamily: "'Sohne', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--dark-90)', marginBottom: 32, letterSpacing: '-0.3px' }}>Prototypes</h1>
      <Section title="Web" routes={prototypeRoutes} prefix="" />
      <Section title="iOS" routes={iosPrototypeRoutes} prefix="/ios" />
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
