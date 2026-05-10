import { useEffect, useRef, type ForwardedRef } from 'react';

/**
 * Bridges a forwarded ref into a local ref.
 *
 * Ported 1:1 from `apps/blaze/src/hooks/useForwardRef.ts`. Returns a stable
 * `useRef` and (on every commit) writes its current value into the forwarded
 * ref so consumers see the same node the parent does.
 */
export const useForwardRef = <T>(
  ref: ForwardedRef<T>,
  initialValue: T | null = null,
) => {
  const targetRef = useRef<T>(initialValue as T);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(targetRef.current);
    } else {
      ref.current = targetRef.current;
    }
  }, [ref]);

  return targetRef;
};
