---
version: "alpha"
name: "Design system"
description: "Design system as the Status board codebase renders it, from the manifest root /beacon."
packageId: "7ddb3452-fcda-583d-8fdf-f0341c8ab251"
colors:
  background: "oklch(0.985 0 0)"
  surface: "oklch(1 0 0)"
  foreground: "oklch(0.21 0.006 265)"
  muted: "oklch(0.48 0.01 265)"
  danger: "oklch(0.53 0.2 27)"
  on-danger: "oklch(0.99 0 0)"
  success: "oklch(0.5 0.13 150)"
  on-success: "oklch(0.99 0 0)"
  border: "oklch(0.9 0.005 265)"
  ring: "oklch(0.55 0.15 260)"
rounded:
  lg: "0.25rem"
spacing:
  base: "0.25rem"
---

# Design system — Status board

Light and dark facets. Light is the default in `:root`; dark applies from the OS preference or the header toggle (`data-theme`). In dark, `--neutral`/`--on-neutral` map to the dark secondary/on-secondary roles. The full revision values are mirrored as custom properties in
`styles.css` (colour roles, `--text-*`/`--leading-*`, `--spacing*`, `--radius*`,
`--elevation-*`, `--duration-*`/`--ease-*`). Drive every styled property off those
tokens; do not hardcode a value a token covers.

## Colors (light)

```css
--background: oklch(0.985 0 0);
--surface: oklch(1 0 0);
--elevated: oklch(1 0 0);
--foreground: oklch(0.21 0.006 265);
--muted: oklch(0.48 0.01 265);
--primary: oklch(0.45 0.15 260);
--on-primary: oklch(0.99 0 0);
--secondary: oklch(0.55 0.02 265);
--on-secondary: oklch(0.99 0 0);
--accent: oklch(0.56 0.13 60);
--on-accent: oklch(0.99 0 0);
--danger: oklch(0.53 0.2 27);
--on-danger: oklch(0.99 0 0);
--warning: oklch(0.66 0.14 70);
--on-warning: oklch(0.18 0.02 70);
--success: oklch(0.5 0.13 150);
--on-success: oklch(0.99 0 0);
--info: oklch(0.5 0.12 245);
--on-info: oklch(0.99 0 0);
--border: oklch(0.9 0.005 265);
--input: oklch(0.86 0.005 265);
--ring: oklch(0.55 0.15 260);
```

## Colors (dark)

```css
--background: oklch(0.18 0.005 265);
--surface: oklch(0.22 0.005 265);
--foreground: oklch(0.96 0.003 265);
--muted: oklch(0.72 0.01 265);
--danger: oklch(0.68 0.18 25);
--on-danger: oklch(0.16 0.03 25);
--success: oklch(0.72 0.15 150);
--on-success: oklch(0.16 0.03 150);
--neutral: oklch(0.6 0.02 265);
--on-neutral: oklch(0.15 0.005 265);
--border: oklch(0.32 0.006 265);
--ring: oklch(0.72 0.13 255);
--elevation-sm: 0 0 3px rgb(0 0 0 / 0.28);
```

## Typography

Families: display, body and mono are System (use a system font stack).

```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

## Layout

```css
--spacing: 0.25rem;
--spacing-1: calc(var(--spacing) * 1);
--spacing-2: calc(var(--spacing) * 2);
--spacing-3: calc(var(--spacing) * 3);
--spacing-4: calc(var(--spacing) * 4);
--spacing-6: calc(var(--spacing) * 6);
--spacing-8: calc(var(--spacing) * 8);
--spacing-12: calc(var(--spacing) * 12);
```

## Elevation & Depth

```css
--elevation-2xs: none;
--elevation-xs: 0 1px 1px rgb(0 0 0 / 0.04);
--elevation-sm: 0 1px 2px rgb(0 0 0 / 0.05);
--elevation-md: 0 1px 3px rgb(0 0 0 / 0.06);
--elevation-lg: 0 2px 4px rgb(0 0 0 / 0.06);
--elevation-xl: 0 2px 6px rgb(0 0 0 / 0.07);
--elevation-2xl: 0 4px 8px rgb(0 0 0 / 0.08);
```

## Shapes

```css
--radius: 0.25rem;
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
--radius-xl: calc(var(--radius) + 4px);
--radius-2xl: calc(var(--radius) + 8px);
--radius-3xl: calc(var(--radius) + 12px);
--radius-4xl: calc(var(--radius) + 16px);
```

## Motion

```css
--duration-fast: 120ms;
--duration-base: 180ms;
--duration-slow: 240ms;
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-entrance: cubic-bezier(0, 0, 0.2, 1);
--ease-exit: cubic-bezier(0.4, 0, 1, 1);
```
