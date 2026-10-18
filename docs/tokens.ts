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

/**
 * Show a token that is just `var(--other)` as the value it points to.
 * Longer values (font shorthands) are left alone.
 */
const resolveAliases = (tokens: Token[], scope: Token[] = []) => {
    const env = new Map([...scope, ...tokens].map((t) => [t.name, t.value]));
    const resolve = (value: string, depth = 0): string => {
        const ref = value.match(/^var\((--[\w-]+)\)$/)?.[1];
        const next = ref && depth < 10 ? env.get(ref) : undefined;
        return next === undefined ? value : resolve(next, depth + 1);
    };
    return tokens.map((t) => ({ ...t, value: resolve(t.value) }));
};

/** Same in every theme. */
export const constants = resolveAliases(parse(block(':root {')));
/** Defined per theme (dark block; light must define the same names). */
export const themed = resolveAliases(
    parse(block(":root,\n[data-theme='dark'] {")),
    constants,
);

export const lightThemed = resolveAliases(
    parse(block("[data-theme='light'] {")),
    constants,
);

export const withPrefix = (tokens: Token[], prefix: string) =>
    tokens.filter((t) => t.name.startsWith(`--tintora-${prefix}`));

export const shortName = (name: string) => name.replace('--tintora-', '');
