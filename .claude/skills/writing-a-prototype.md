# Writing a prototype

For Claude assisting designers/PMs. The user describes a UI; you compose it from the lib.

## Prerequisites

- A prototype exists at `prototypes/<slug>/index.tsx`. If not, run `pnpm plop prototype --name <slug>` first.
- The dev server is running (`pnpm dev`, port 5173).

## The shape — every prototype looks like this

```tsx
import { Text } from '@/components';
import { PrototypeShell, StatePicker, useStateContext } from '../_shell';

function Body() {
  const { state } = useStateContext();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      {/* section: hero */}
      <Text size="lg" weight="halbfett">Page title</Text>

      {/* section: content */}
      <Text size="sm">State: {state}</Text>
    </div>
  );
}

export default function MyPrototype() {
  return (
    <StatePicker states={['empty', 'loading', 'loaded', 'error']} defaultState="loaded">
      <PrototypeShell title="My prototype">
        <Body />
      </PrototypeShell>
    </StatePicker>
  );
}
```

## Hard rules

1. **ALWAYS wrap in `<PrototypeShell>` + `<StatePicker>`** from `prototypes/_shell`. Both. Even if there's only one state, `<StatePicker states={['default']}>` is correct.
2. **Compose ONLY from `@/components` and `@/icons`.** Never write custom buttons, inputs, cards, pills, etc. If something is missing, see the GAPS rule below.
3. **No CSS files.** Layout via inline `style={{ display: 'flex', gap: 16, padding: 24 }}`. Typography and color come from lib components.
4. **No raw hex.** For inline color overrides: `style={{ color: 'var(--dark-60)' }}`. Use the tokens in `CLAUDE.md`.
5. **Imports use `@/components` and `@/icons`** — the Vite alias. Inside prototypes ONLY (lib code uses relative imports).

## Component is missing → STOP and write GAPS.md

When the user describes something that doesn't exist in `src/components/`:

1. STOP. Do not fake it with raw HTML.
2. Append a description to `prototypes/<slug>/GAPS.md`. Be specific about visual + behavioral characteristics.

   ```md
   - **Gantt bar** — horizontal status indicator with thumbnail + label + colored left edge (status color). Used in campaigns view.
   - **Status pill: New (pink)** — extension to existing StatusPill colors. Color: `var(--status-new)`.
   ```

3. In the JSX, drop a clearly-marked placeholder where the missing component should go:

   ```tsx
   <div style={{ background: 'var(--dark-4)', padding: 8, border: '1px dashed var(--dark-15)' }}>
     TODO: Gantt bar
   </div>
   ```

4. Tell the user: "I couldn't find `<X>` in the lib. I've added it to `prototypes/<slug>/GAPS.md` and used a placeholder. Want me to surface this to eng so it can be added?"

## States

Define states in `<StatePicker states={[...]}>` and branch via `useStateContext()`:

```tsx
function Body() {
  const { state } = useStateContext();
  if (state === 'empty') return <Text>No items yet</Text>;
  if (state === 'loading') return <Text>Loading…</Text>;
  return <ItemList />;
}
```

If the user shows you a single visual but you can tell there are implied states (loading, empty, error), ask: "I see the loaded state. What about loading / empty / error?"

## Layout primitives — inline only

```tsx
{/* row with gap */}
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>...</div>

{/* column with gap */}
<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>...</div>

{/* card-ish surface */}
<div style={{ background: 'var(--light-100)', border: '1px solid var(--dark-8)', borderRadius: 8, padding: 16 }}>...</div>
```

Spacing values: multiples of 4px only (4, 8, 12, 16, 20, 24, 32, 40, 48).

## Splitting a large prototype

If `index.tsx` exceeds ~100 lines, split into local files:

```
prototypes/inbox-v3/
  index.tsx       <- default export, sets up Shell + StatePicker
  Hero.tsx
  Feed.tsx
  EmptyState.tsx
```

Local files stay inside the prototype folder. They never get exported from the lib.

## Local state

`useState` for local concerns. No Redux, no Zustand, no global store. If you need shared state across split files, lift it to `index.tsx` and prop-drill OR use a small local context.

## When unsure, ask

Don't make design decisions silently. If the user says "show a list" but doesn't say what each item looks like, ask. If a token / weight / size choice is ambiguous, ask. Better to interrupt than to guess and rebuild.

## Done checklist

- Wrapped in `<PrototypeShell>` + `<StatePicker>`
- Imports go through `@/components` / `@/icons` / `../_shell`
- No raw hex, no CSS files, no custom buttons
- All "missing component" cases logged to `GAPS.md` with placeholders in JSX
- Renders at `http://localhost:5173/<slug>` — verify in the browser before declaring done
