---
name: m3-theming
description: Use this skill whenever setting up, editing, or reviewing color theming, dark mode, or design tokens in this project — including app/globals.css, any --md-sys-color-* CSS variables, or @material/web component styling. Also use when a component looks unstyled, uses the wrong colors, doesn't respond to system dark mode, or when asked to "theme the app," "add dark mode," or "fix the colors." Trigger even if the user doesn't say "Material" or "M3" explicitly — this project's entire visual system runs on M3 tokens.
---

# M3 Theming for this project

This project uses Material Design 3 (M3) color tokens, consumed automatically by every `@material/web` component. Per the project spec: dark mode is supported from v1, follows system preference only (`prefers-color-scheme`), and there is no manual toggle. Do not build a theme-switcher UI or a React context/provider for theme state — that's explicitly out of scope and adds complexity the spec doesn't call for.

## How token consumption works

`@material/web` components read their colors from CSS custom properties named `--md-sys-color-*` (e.g. `--md-sys-color-primary`, `--md-sys-color-surface`, `--md-sys-color-on-surface`). You do not pass colors as props or inline styles to individual components — you set these variables once, globally, and every component picks them up automatically. If a component looks unstyled or uses browser-default colors, the near-certain cause is that these variables aren't set in scope, not a problem with the component itself.

## Where tokens live

Set both light and dark token sets in `app/globals.css`, at `:root` for light (the default) and inside a `prefers-color-scheme: dark` media query for dark:

```css
:root {
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;
  --md-sys-color-primary-container: #eaddff;
  --md-sys-color-on-primary-container: #21005d;

  --md-sys-color-surface: #fffbfe;
  --md-sys-color-on-surface: #1c1b1f;
  --md-sys-color-surface-variant: #e7e0ec;
  --md-sys-color-on-surface-variant: #49454f;

  --md-sys-color-background: #fffbfe;
  --md-sys-color-on-background: #1c1b1f;

  --md-sys-color-error: #b3261e;
  --md-sys-color-on-error: #ffffff;

  --md-sys-color-outline: #79747e;
}

@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-primary: #d0bcff;
    --md-sys-color-on-primary: #381e72;
    --md-sys-color-primary-container: #4f378b;
    --md-sys-color-on-primary-container: #eaddff;

    --md-sys-color-surface: #1c1b1f;
    --md-sys-color-on-surface: #e6e1e5;
    --md-sys-color-surface-variant: #49454f;
    --md-sys-color-on-surface-variant: #cac4d0;

    --md-sys-color-background: #1c1b1f;
    --md-sys-color-on-background: #e6e1e5;

    --md-sys-color-error: #f2b8b5;
    --md-sys-color-on-error: #601410;

    --md-sys-color-outline: #938f99;
  }
}
```

This is the full mechanism — no JS is needed to switch themes. The browser handles `prefers-color-scheme` automatically and the CSS variables resolve differently based on it, and every `@material/web` component re-renders with the new values without any React state or re-mount.

## Generating an actual token set (don't hand-roll values from scratch)

The example above is illustrative. For a real palette, use Google's Material Theme Builder (material-web.dev / m3.material.io tools) with the project's chosen seed/brand color, export the token set, and paste both light and dark blocks in. Don't invent hex values by hand for a real build — M3's token system is generated from a single seed color via a defined algorithm (tonal palettes), and hand-picked values will drift from what "looks like M3" versus what's actually M3-compliant (correct contrast ratios between `on-*` and base tokens, correct relationships between `-container` variants and their base color, etc).

## Common mistakes to avoid

- **Don't set token values inline per-component.** If you find yourself writing `style={{ '--md-sys-color-primary': '#xyz' }}` on an individual wrapper component, stop — that's overriding the global theme locally instead of using the theme system as intended, and it will silently ignore dark mode for that one component.
- **Don't gate token application behind a client-only mount check.** Since this is pure CSS (no JS-computed theme), there's no hydration mismatch risk here the way there sometimes is with JS-based dark mode — you do not need a `useEffect` + `mounted` guard pattern that's common in other dark-mode implementations. Applying the CSS variables in `globals.css` is sufficient and works correctly during SSR.
- **Don't build a `ThemeProvider` component or React context for this.** There is no theme *state* in this app — it's a static CSS mechanism responding to the OS setting. A provider would be solving a problem that doesn't exist here.
- **Missing `on-*` pairs will hurt accessibility, not just look wrong.** Every base token (e.g. `--md-sys-color-surface`) needs its paired `on-` token (`--md-sys-color-on-surface`) for text/icons that sit on top of it, with sufficient contrast. If a color looks right but text on it is hard to read, check that the `on-*` pairing wasn't skipped or copied from the wrong base color.

## Quick checklist

1. Both light (`:root`) and dark (`prefers-color-scheme: dark`) token blocks are present in `app/globals.css`.
2. Tokens came from Material Theme Builder (or equivalent), not hand-picked hex values, for the real build.
3. No inline per-component token overrides.
4. No `ThemeProvider`, no theme-related React state, no manual toggle UI.
5. Every base token used has its corresponding `on-*` pair defined.
