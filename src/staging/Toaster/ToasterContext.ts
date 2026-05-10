import { createContext } from 'react';
import type { ToastContextValue } from './Types';

/**
 * Internal — consumers use the `useToast` hook (./useToast.ts) which
 * subscribes to this and surfaces the imperative `showToast`/`dismissToast`
 * callbacks. Keeping the context unexported from the public surface lets us
 * change the shape without breaking consumers.
 */
export const ToastContext = createContext<ToastContextValue | null>(null);
