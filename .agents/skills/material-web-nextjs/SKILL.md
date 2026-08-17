---
name: material-web-nextjs
description: Use this skill whenever writing, editing, or reviewing UI code in this Next.js project that uses @material/web (M3 web components) — any file involving md-* elements, component wrappers in components/ui/, forms, buttons, chips, dialogs, or theming. Also use when a Next.js build/hydration error mentions custom elements, "not defined", ref forwarding, or web component properties, since these are almost always @material/web integration issues covered here. Trigger even if the user just says "build the form" or "add a button" without mentioning @material/web by name — this project uses it for all interactive UI.
---

# @material/web in Next.js (App Router)

`@material/web` ships Lit-based web components, not React components. Next.js App Router defaults to Server Components. These two facts cause almost all bugs in this stack. This skill exists to prevent them.

## The core rule

**Every file that renders or imports an `md-*` element must start with `'use client'`.** Web components rely on browser APIs (custom element registry, shadow DOM) that don't exist during server rendering. Forgetting this directive is the single most common failure mode — if you see a hydration mismatch, a "customElements is not defined" error, or a component that renders inert/unstyled on first load, check this first.

## Never use raw `md-*` elements directly in pages/features

Do not write `<md-filled-button>` inline in a page or feature component. Always go through the typed wrapper components in `components/ui/`. If a wrapper doesn't exist yet for the element you need, create it there first, following the pattern below — do not special-case one usage.

Why: raw web components in JSX have three recurring problems that the wrapper pattern solves once, centrally:
1. React passes primitive values as HTML attributes by default; many `@material/web` component states (e.g. `value` on `md-outlined-text-field`, `selected` on `md-chip`) need to be set as JS **properties**, not attributes, or they silently don't update on re-render.
2. Custom events (e.g. `input`, `change`, `close-menu`) don't map to React's synthetic `onX` props. You must attach real DOM listeners.
3. TypeScript doesn't know about `md-*` JSX elements out of the box.

## The wrapper pattern

Every wrapper component in `components/ui/` follows this shape:

```tsx
'use client';

import { useRef, useEffect } from 'react';
import '@material/web/textfield/outlined-text-field.js';

type TextFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  required?: boolean;
};

export function TextField({ value, onValueChange, label, required }: TextFieldProps) {
  const ref = useRef<HTMLElement & { value: string }>(null);

  // Property binding: set .value as a JS property, not a JSX attribute.
  // JSX attributes on custom elements become HTML attributes (strings only)
  // and won't reflect updates the way React expects for non-string state.
  useEffect(() => {
    if (ref.current && ref.current.value !== value) {
      ref.current.value = value;
    }
  }, [value]);

  // Event forwarding: attach a real DOM listener, don't use onInput/onChange in JSX —
  // @material/web fires native 'input' events, which JSX onInput does NOT
  // automatically wire to custom elements the way it does to <input>.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => onValueChange((e.target as HTMLInputElement).value);
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onValueChange]);

  return (
    // @ts-expect-error -- md-outlined-text-field is a custom element, see types/material-web.d.ts
    <md-outlined-text-field
      ref={ref}
      label={label}
      required={required}
    />
  );
}
```

Apply this same three-part shape (ref → property-sync effect → event-listener effect) to every wrapper: buttons, chips, dialogs, selects, checkboxes. Buttons are the exception — they only need event forwarding (for `click`), not property syncing, since they don't hold editable state.

## TypeScript setup (do once, at project start)

Create `types/material-web.d.ts`:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    'md-outlined-text-field': any;
    'md-filled-button': any;
    'md-outlined-button': any;
    'md-text-button': any;
    'md-chip-set': any;
    'md-filter-chip': any;
    'md-dialog': any;
    'md-outlined-select': any;
    'md-select-option': any;
    'md-checkbox': any;
    // add each md-* tag as it's introduced in a new wrapper
  }
}
```

Without this, every `md-*` tag in the wrapper files causes a TS error. Extend this file, don't recreate it, as new wrappers are added.

## Import pattern

Import each component's specific module, not a barrel/index import:

```ts
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
```

Put these imports inside the wrapper component file itself (as in the example above), not in a shared top-level file — this keeps bundles scoped to what's actually used on each page, consistent with how `@material/web` is designed to be consumed.

## Dialogs specifically

`md-dialog` uses an imperative `.show()` / `.close()` API, not a `open` boolean prop that works the way you'd expect from a typical React modal. The wrapper should expose `open: boolean` as a prop but internally call `.show()`/`.close()` via a ref in a `useEffect`, mirroring the property-sync pattern above — do not just pass `open` as a JSX attribute and expect it to behave like conditional rendering.

## Forms

Do not wrap `md-*` form elements in a native `<form>` and rely on native form submission — this project's convention (see project conventions) is to use controlled state + explicit `onClick` handlers on submit buttons, not native form submit events, since custom elements don't participate in native form data collection (`FormData`) without additional `ElementInternals` wiring that adds complexity not needed here.

## Theming (dark mode)

M3 tokens are CSS custom properties (`--md-sys-color-*`). Set them at the `:root` level in `app/globals.css`, with a `prefers-color-scheme: dark` media query providing the dark token values — do not build a JS-based theme toggle/provider for v1, per the project spec (dark mode follows system preference only, no manual toggle). `@material/web` components read these tokens automatically; no per-component theming code is needed once the CSS variables are set globally.

## Quick checklist when adding a new UI element

1. Does a wrapper already exist in `components/ui/`? Use it. Don't inline `md-*`.
2. If not, create one: `'use client'` directive, ref, property-sync effect (if it holds state), event-listener effect (if it emits events).
3. Add the tag to `types/material-web.d.ts` if it's not already there.
4. Import the specific `@material/web` module inside the wrapper file.
5. If it's a dialog or anything with imperative open/close behavior, wire that through a ref + effect, not a plain prop.
