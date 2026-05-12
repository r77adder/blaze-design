import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { prototypeRoutes } from './router';
import '../tokens/colors.css';
import '../tokens/fonts.scss';
import '../tokens/reset.css';

function Index() {
  if (prototypeRoutes.length === 0) {
    return (
      <main style={{ padding: 24, fontFamily: "'Sohne', sans-serif" }}>
        <h1>No prototypes yet</h1>
        <p>
          Tell Claude: <code>/new-prototype hello-world</code>
        </p>
      </main>
    );
  }
  return (
    <main style={{ padding: 24, fontFamily: "'Sohne', sans-serif" }}>
      <h1>Prototypes</h1>
      <ul>
        {prototypeRoutes.map((r) => (
          <li key={r.slug}>
            <Link to={`/${r.slug}`}>{r.slug}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Index />} />
        {prototypeRoutes.map(({ slug, Component }) => (
          <Route key={slug} path={`/${slug}/*`} element={<Component />} />
        ))}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
