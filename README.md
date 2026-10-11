# Tintora

Tintora is a lightweight React component library for building polished interfaces with a clean, modern default style. It is designed for fast prototyping and production-ready UI composition, with a small API surface and TypeScript support.

**[Live Storybook →](https://felipevlourenco.github.io/tintora/)**

## Features

- React component library
- TypeScript-first development
- Vite-based build output
- [Storybook](https://felipevlourenco.github.io/tintora/) for component exploration
- Simple, reusable styling

## Installation

Using pnpm:

```bash
pnpm add tintora
```

Using npm:

```bash
npm install tintora
```

Using yarn:

```bash
yarn add tintora
```

## Usage

```tsx
import { Button } from 'tintora';

export function Example() {
    return (
        <Button onClick={() => alert('Hello from Tintora!')}>Click me</Button>
    );
}
```

If your build setup supports CSS imports, you can also import the library stylesheet:

```tsx
import 'tintora/style.css';
```

## Available Components

### Button

The current component library includes a simple `Button` component with a clean dark base style and support for standard HTML button props.

```tsx
<Button type="button" disabled={false}>
    Submit
</Button>
```

## Development

Install dependencies:

```bash
pnpm install
```

Run Storybook:

```bash
pnpm storybook
```

Build the library:

```bash
pnpm build
```

Run type checking:

```bash
pnpm typecheck
```

Run linting:

```bash
pnpm lint
```

## Project Structure

```text
src/
  Button/
    Button.tsx
    Button.css
  index.ts
```

## License

MIT

## Repository

https://github.com/felipevlourenco/tintora
