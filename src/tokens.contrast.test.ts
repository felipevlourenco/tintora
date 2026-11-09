// Guards the colour pairs that sit directly on each other (text on a fill) by
// computing their WCAG contrast from tokens.css, in both themes. jsdom has no
// CSS, so axe cannot do this in the unit tests; the Storybook a11y panel does,
// but only when someone looks. A pair that drops below its minimum fails here.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
    join(import.meta.dirname, 'tokens.css'),
    'utf8',
).replace(/\/\*[\s\S]*?\*\//g, ''); // comments hold braces and colons

// `selector { ...declarations }` at the top level (the file has no nesting
// outside the @media block, which this skips).
function blocks(source: string) {
    const out: Record<string, Record<string, string>> = {};
    for (const [, selector, body] of source.matchAll(
        /^([^@{}\n/][^{}]*)\{([^{}]*)\}/gm,
    )) {
        const key = selector.replace(/\s+/g, ' ').trim();
        out[key] = { ...out[key] };
        for (const [, name, value] of body.matchAll(
            /(--[\w-]+)\s*:\s*([^;]+);/g,
        )) {
            out[key][name] = value.trim();
        }
    }
    return out;
}

const all = blocks(css);
const constants = all[':root'] ?? {};
const themes = {
    dark: { ...constants, ...all[":root, [data-theme='dark']"] },
    light: { ...constants, ...all["[data-theme='light']"] },
};

function resolve(
    tokens: Record<string, string>,
    name: string,
    depth = 0,
): string | undefined {
    const value = tokens[name];
    if (value === undefined || depth > 8) return undefined;
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    return ref ? resolve(tokens, ref[1], depth + 1) : value;
}

function luminance(hex: string) {
    const [r, g, b] = [1, 3, 5]
        .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

// [foreground token, background token, minimum]. 4.5 is body text, 3 is large
// text or a graphic. Only opaque hex colours: a translucent one has no fixed
// ratio until it is over a background.
const pairs: [string, string, number][] = [
    ['--tintora-color-on-accent', '--tintora-color-accent', 4.5],
    ['--tintora-color-on-accent-deep', '--tintora-color-accent-deep', 4.5],
    ['--tintora-control-on-fill', '--tintora-control-fill', 4.5],
    ['--tintora-text-on-card-muted', '--tintora-surface-card', 4.5],
    ['--tintora-color-ink', '--tintora-surface-card', 4.5],
    ['--tintora-text-on-toast', '--tintora-surface-toast', 4.5],
    ['--tintora-text-on-toast-muted', '--tintora-surface-toast', 4.5],
    ['--tintora-toast-action', '--tintora-surface-toast', 4.5],
    ['--tintora-color-ink', '--tintora-menu-bg', 4.5],
    ['--tintora-menu-item-destructive', '--tintora-menu-bg', 4.5],
    ['--tintora-text-on-card-muted', '--tintora-menu-bg', 4.5],
    ['--tintora-chip-fg', '--tintora-chip-bg', 4.5],
    ['--tintora-chip-selected-fg', '--tintora-chip-selected-bg', 4.5],
];

describe('token contrast', () => {
    it('parses both themes', () => {
        expect(themes.dark['--tintora-surface-toast']).toBeDefined();
        expect(themes.light['--tintora-surface-card']).toBeDefined();
    });

    for (const [theme, tokens] of Object.entries(themes)) {
        for (const [fg, bg, min] of pairs) {
            const a = resolve(tokens, fg);
            const b = resolve(tokens, bg);
            // Skip a pair a theme does not define as opaque hex colours.
            const hex = /^#[0-9a-f]{6}$/i;
            if (!a || !b || !hex.test(a) || !hex.test(b)) continue;

            it(`${theme}: ${fg} on ${bg} is at least ${min}:1`, () => {
                expect(contrast(a, b)).toBeGreaterThanOrEqual(min);
            });
        }
    }
});
