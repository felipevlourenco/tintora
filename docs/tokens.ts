// Reads src/tokens.css so the docs can't drift from the real tokens.
import css from '../src/tokens.css?raw';

export type Token = { name: string; value: string; note?: string };

const block = (selector: string) => {
    const start = css.indexOf(selector);
    return css.slice(start, css.indexOf('\n}', start));
};

const parse = (text: string): Token[] =>
    [
        ...text.matchAll(
            /(--tintora-[\w-]+):\s*([^;]+);(?:[ \t]*\/\*\s*(.*?)\s*\*\/)?/g,
        ),
    ].map(([, name, value, note]) => ({
        name,
        value: value.replace(/\s+/g, ' ').trim(),
        note,
    }));

/** Same in every theme. */
export const constants = parse(block(':root {'));
/** Defined per theme (dark block; light must define the same names). */
export const themed = parse(block(":root,\n[data-theme='dark'] {"));

export const lightThemed = parse(block("[data-theme='light'] {"));

export const withPrefix = (tokens: Token[], prefix: string) =>
    tokens.filter((t) => t.name.startsWith(`--tintora-${prefix}`));

export const shortName = (name: string) => name.replace('--tintora-', '');
