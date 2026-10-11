// The light tokens live in two places (the [data-theme='light'] block and
// the prefers-color-scheme media block). Fail if they drift apart, or if
// light/dark don't define the same token names.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8');

const declarations = (selector) => {
    const start = css.indexOf(selector);
    if (start === -1) throw new Error(`tokens.css: missing "${selector}"`);
    const end = css.indexOf('}', start);
    return Object.fromEntries(
        [
            ...css
                .slice(start, end)
                .matchAll(/(--tintora-[\w-]+):\s*([^;]+);/g),
        ].map(([, name, value]) => [name, value.replace(/\s+/g, ' ').trim()]),
    );
};

const dark = declarations(":root,\n[data-theme='dark']");
const light = declarations("[data-theme='light'] {");
const auto = declarations(':root:not([data-theme]) {');

const names = (o) => Object.keys(o).sort().join('\n');
if (names(dark) !== names(light))
    throw new Error('tokens.css: dark and light define different tokens');
if (JSON.stringify(light) !== JSON.stringify(auto))
    throw new Error(
        "tokens.css: prefers-color-scheme block differs from [data-theme='light']",
    );
