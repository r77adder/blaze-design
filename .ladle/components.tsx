import type { GlobalProvider } from '@ladle/react';
import '../src/tokens/colors.css';
import '../src/tokens/fonts.scss';
import '../src/tokens/reset.css';

export const Provider: GlobalProvider = ({ children }) => (
  <div style={{ fontFamily: "'Sohne', sans-serif", padding: 24 }}>{children}</div>
);
