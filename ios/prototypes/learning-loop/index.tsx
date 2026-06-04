// The Learning Loop flow has been merged into the unified `mobile-app`
// prototype. This route stays as a deep-link alias so existing links
// continue to work — it renders the same prototype.
//
// The Learning Loop screens themselves (LandingScreen, LearningsScreen,
// NotifyMeModal, IOSAlert, LockScreen) still live in this folder as a
// feature module and are imported by `mobile-app/index.tsx`.
export { default } from '../mobile-app';
export type { LLDataState } from '../mobile-app/HomeScreen';
