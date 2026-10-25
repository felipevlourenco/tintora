<h1 align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg" />
        <img src="docs/assets/logo-light.svg" alt="Tintora" height="72" />
    </picture>
</h1>

<p align="center">
    A lightweight React component library with a glassy, dark-first style.<br />
    Small API surface, accessible by default, TypeScript included.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/tintora"><img alt="npm version" src="https://img.shields.io/npm/v/tintora?color=c94e0c&labelColor=2a2726" /></a>
    <a href="https://github.com/felipevlourenco/tintora/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/felipevlourenco/tintora/ci.yml?branch=main&label=CI&labelColor=2a2726" /></a>
    <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/npm/l/tintora?color=c94e0c&labelColor=2a2726" /></a>
    <a href="https://felipevlourenco.github.io/tintora/"><img alt="Storybook" src="https://img.shields.io/badge/Storybook-live-c94e0c?labelColor=2a2726" /></a>
</p>

**[Live Storybook →](https://felipevlourenco.github.io/tintora/)**

## Features

- **25+ components**: buttons, form controls, feedback and overlays.
- **Accessible by default**: real roles and labels, keyboard support, focus handling, reduced motion respected, covered by axe checks in the tests.
- **Dark and light themes** from one set of design tokens, following the OS or forced with an attribute.
- **TypeScript-first**: every component exports its props type.
- **Native platform features** where they exist: `<dialog>` for modals and drawers, the top layer for popovers, CSS for animation.
- **Self-contained styles**: the ESM build imports its own CSS.

## Installation

```bash
pnpm add tintora
# or: npm install tintora
# or: yarn add tintora
```

Requires React 18 or newer.

## Usage

```tsx
import { Button } from 'tintora';

export function Example() {
    return (
        <Button variant="primary" onClick={() => alert('Hello from Tintora!')}>
            Click me
        </Button>
    );
}
```

The ESM build imports its own stylesheet, so a bundler with CSS support (Vite, Next.js, webpack with `css-loader`) needs nothing else. The CommonJS build does not; add this line there:

```tsx
import 'tintora/style.css';
```

### Theming

Tintora is dark by default and follows the OS preference. Force a theme with `data-theme` on `<html>` or on any wrapper:

```html
<html data-theme="light"></html>
```

Colours, radii, type and shadows are CSS custom properties prefixed `--tintora-`, so you can override them in your own CSS.

### Server Components

Components that use hooks or context ship with `'use client'`, and the rest (`Alert`, `Button`, `Card`, `Chip`, `Dot`, `IconButton`, `Link`, `SearchInput`, `SettingsRow`, `Skeleton`, `Spinner`, `Tag`) are plain. So you can import any of them in a Next.js Server Component without adding the directive yourself:

```tsx
// app/loading.tsx, a Server Component
import { Spinner } from 'tintora';

export default function Loading() {
    return <Spinner />;
}
```

Props passed from a Server Component must be serialisable, so event handlers (`onClick`, `onClose`) belong in a Client Component.

### Controlled overlays

Modal, Drawer, BottomSheet and Popover are controlled: your state owns `open`.

```tsx
import { useState } from 'react';
import { Button, Modal } from 'tintora';

export function DeleteWorkout() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                Delete
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Delete this workout?"
                description="This cannot be undone."
                actions={
                    <>
                        <Button variant="ghost" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary">Delete</Button>
                    </>
                }
            />
        </>
    );
}
```

## Components

Every component has a story with all its variants in the [Storybook](https://felipevlourenco.github.io/tintora/).

### Actions

| Component    | What it is                                                                     |
| ------------ | ------------------------------------------------------------------------------ |
| `Button`     | `primary`, `secondary`, `outline` and `ghost`, with icons and a loading state. |
| `IconButton` | A round, field or nav button with an icon and a required `aria-label`.         |
| `Link`       | An `<a>`, or any component via `as` (e.g. Next's `Link`), in Tintora's style.  |
| `Chip`       | A pill button, or a toggle when `selected` is set.                             |
| `Toggle`     | A two-option segmented control (`ToggleItem`), such as light and dark.         |
| `Tabs`       | A tab list (`Tab`), as a segmented pill or an underline. Arrow-key navigation. |

### Forms

| Component     | What it is                                                           |
| ------------- | -------------------------------------------------------------------- |
| `TextField`   | A labelled input with hint and error messages.                       |
| `SearchInput` | A search field with a search icon and a required `aria-label`.       |
| `Select`      | A select with a listbox popup that can submit with a form.           |
| `Switch`      | An on/off switch.                                                    |
| `Checkbox`    | A checkbox with an indeterminate state.                              |
| `Radio`       | A radio, grouped with `RadioGroup`.                                  |
| `SettingsRow` | A row for one setting: title, description and a control on the side. |

### Display

| Component | What it is                                                               |
| --------- | ------------------------------------------------------------------------ |
| `Avatar`  | An image with an initials fallback.                                      |
| `Card`    | A surface or list-row card, and a selectable variant (`SelectableCard`). |
| `Tag`     | A small label in `neutral`, `success`, `accent` or `card`.               |
| `Dot`     | An unread, read or section-tick marker.                                  |

### Feedback

| Component     | What it is                                                            |
| ------------- | --------------------------------------------------------------------- |
| `Alert`       | An inline status message, or a full-width announcement bar.           |
| `Toast`       | A short-lived message with an action, a timer bar and pause on hover. |
| `ProgressBar` | Determinate or indeterminate progress.                                |
| `Spinner`     | A loading indicator in three sizes.                                   |
| `Skeleton`    | A shimmering placeholder.                                             |

### Overlays

| Component     | What it is                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| `Tooltip`     | A hint on hover and focus, with an optional title and keyboard shortcut.         |
| `Popover`     | A small floating panel anchored to a trigger. Flips at the viewport edge.        |
| `Modal`       | A dialog on native `<dialog>`: focus trap, Esc, scrim click, scroll lock.        |
| `Drawer`      | A panel that slides in from any edge. A scrim click or Esc closes it.            |
| `BottomSheet` | A `Drawer` from the bottom with a grabber, a title and `BottomSheetOption` rows. |

## Development

```bash
pnpm install       # dependencies
pnpm storybook     # Storybook on http://localhost:6006
pnpm test          # unit tests (Vitest, Testing Library, axe)
pnpm lint          # ESLint and token check
pnpm typecheck     # TypeScript
pnpm build         # library build in dist/
```

### Project structure

```text
src/
  <Component>/
    <Component>.tsx          the component
    <Component>.css          its styles
    <Component>.stories.tsx  Storybook stories
    <Component>.test.tsx     tests
  hooks/                     shared hooks (outside press, escape key, ...)
  utils/                     shared helpers
  tokens.css                 design tokens, dark and light
  index.ts                   public exports
docs/                        Storybook documentation pages and assets
```

### Contributing

Commits follow [Conventional Commits](https://www.conventionalcommits.org/), checked by a hook. `main` is protected, so work on a branch and open a pull request.

## Releases

Versions are published automatically on every merge to `main` with [semantic-release](https://semantic-release.gitbook.io/), from the commit messages:

| Commit                                  | Release |
| --------------------------------------- | ------- |
| `fix:`, `perf:`, `refactor:`, `revert:` | patch   |
| `feat:`                                 | minor   |
| `BREAKING CHANGE:` footer, or `feat!:`  | major   |
| `docs:`, `chore:`, `style:`, `test:`    | none    |

## License

[MIT](LICENSE)
