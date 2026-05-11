import { renderHook, act } from '@testing-library/react';
import { useResponsiveDesign } from './useResponsiveDesign';

interface MockMQL {
  matches: boolean;
  media: string;
  onchange: null;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  addListener: jest.Mock;
  removeListener: jest.Mock;
  dispatchEvent: jest.Mock;
}

function installMatchMedia(initialMatches: boolean) {
  let listener: ((e: { matches: boolean }) => void) | null = null;
  const mql: MockMQL = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addEventListener: jest.fn((_: string, cb: (e: { matches: boolean }) => void) => {
      listener = cb;
    }),
    removeEventListener: jest.fn(() => {
      listener = null;
    }),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn(() => mql),
  });
  return {
    fire: (matches: boolean) => {
      mql.matches = matches;
      listener?.({ matches });
    },
  };
}

describe('useResponsiveDesign', () => {
  it('returns isMobile=false when matchMedia does not match', () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useResponsiveDesign());
    expect(result.current.isMobile).toBe(false);
  });

  it('returns isMobile=true when matchMedia matches', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useResponsiveDesign());
    expect(result.current.isMobile).toBe(true);
  });

  it('updates when the media query change event fires', () => {
    const mq = installMatchMedia(false);
    const { result } = renderHook(() => useResponsiveDesign());
    expect(result.current.isMobile).toBe(false);
    act(() => mq.fire(true));
    expect(result.current.isMobile).toBe(true);
  });
});
