# Writing a lib component

For engineers adding a new component to `src/components/`. Follows TDD: failing tests first, verify they fail, then implement.

The canonical reference is `src/components/Text/`. Anything new should match that shape.

## Prerequisites

- You've run `pnpm plop component --name <Name>`. That created the file skeleton:
  - `<Name>.tsx` — the component
  - `<Name>.module.scss` — co-located styles
  - `<Name>.test.tsx` — tests (4 contract tests pre-written)
  - `<Name>.stories.tsx` — Ladle story
  - `Types.ts` — props interface
  - `index.ts` — barrel
  - And appended an explicit named export to `src/components/index.ts`.

## The 4 contract tests (Plop generates these — keep them, don't replace)

Every component MUST pass these:

1. **Renders children** — `render(<X>hi</X>)` puts `hi` in the DOM.
2. **Forwards `...rest`** — `data-testid` + `aria-label` reach the rendered element.
3. **Merges consumer `className`** — both the base class (e.g. `root`) and the consumer's class are present.
4. **Forwards `ref`** — `ref.current` is the expected HTMLElement subclass.

These four are the contract. Add component-specific tests on top.

## TDD flow

1. Look at the component's responsibilities (from the user's spec or the design doc).
2. Write the failing tests for the new behavior FIRST. Add them to the generated test file.
3. Run `pnpm test -- <Name>` and confirm the new tests fail (the contract tests pass because Plop scaffolded a working stub).
4. Implement: edit `<Name>.tsx`, `Types.ts`, and `<Name>.module.scss` until tests pass.
5. Run the full test suite: `pnpm test`. Everything must stay green.

## Component shape (canonical)

```tsx
import { forwardRef } from 'react';
import type { XProps } from './Types';
import styles from './X.module.scss';

export const X = forwardRef<HTMLDivElement, XProps>(
  ({ /* destructure props with defaults */, className, children, ...rest }, ref) => {
    const classes = [styles.root, /* variant classes */, className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);
X.displayName = 'X';
```

Key requirements:

- `forwardRef` always.
- `displayName` always — easier debugging in React DevTools.
- Spread `...rest` AFTER the explicit attrs so consumers can override (or AFTER if you want defaults to win — pick one and document).
- Accept and merge `className`.
- Use relative imports (`./Types`, `./X.module.scss`) — the `@/*` alias is Vite-only and isn't in the lib's tsconfig.

## Props interface

In `Types.ts`:

```ts
import type { HTMLAttributes } from 'react';

export type XSize = 'sm' | 'md' | 'lg';

export interface XProps extends HTMLAttributes<HTMLDivElement> {
  size?: XSize;
  /* ...other component-specific props */
}
```

- Extend native HTML attrs (`HTMLAttributes<HTMLDivElement>`, `ButtonHTMLAttributes<HTMLButtonElement>`, etc.) so consumers can pass `onClick`, `aria-*`, `data-*`, `id`, etc.
- Variant unions (`'sm' | 'md' | 'lg'`) over booleans.

**NEVER add a `color: string` prop.** This is a deliberate constraint. For one-off color overrides, designers use `style={{ color: 'var(--dark-60)' }}`. An unconstrained color prop was dropped during the Text review. If a component has semantic color variants (e.g. `intent: 'primary' | 'destructive'`), that's fine — but no free-form color string.

## Styles

In `<Name>.module.scss`:

```scss
@use '../../tokens/typography' as *;

.root {
  /* base styles */
}

.size-sm {
  @include sm-sohne;
}

.size-md {
  @include md-sohne;
}
```

- Use `@use '../../tokens/typography' as *;` — relative path (NOT `@/tokens/...`).
- Reference colors via `var(--dark-90)`, `var(--brand)`, etc. — never raw hex.
- Spacing: multiples of 4px only (`4, 8, 12, 16, 20, 24, 32, 40, 48`).

## Barrel exports

Plop has already done this, but verify:

- `src/components/<Name>/index.ts` re-exports the component and its props type.
- `src/components/index.ts` has an explicit named export appended (`export { X } from './X';` and `export type { XProps } from './X';`).

**Never use `export * from`.** The barrel is the public API surface — keep it auditable in one file.

## Ladle story

Plop scaffolds a `Default` story. At minimum keep that. Add more stories if the component has interesting variants — one per variant is the rule of thumb.

```tsx
import type { Story, StoryDefault } from '@ladle/react';
import { X } from './X';

export default { title: 'Components / X' } as StoryDefault;

export const Default: Story = () => <X>Default</X>;
export const Large: Story = () => <X size="lg">Large</X>;
```

Run `pnpm ladle` to view.

## Done checklist

- `pnpm test` green (the 4 contract tests + your new ones)
- `pnpm typecheck` green
- `pnpm build` succeeds (produces `lib/` and `module/`)
- Story renders correctly in `pnpm ladle`
- Public API surface (`src/components/index.ts`) updated with explicit named export

## Reference

`src/components/Text/Text.tsx` is the canonical example. Read it before starting.
