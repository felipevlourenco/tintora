// A React Server Component cannot call hooks or createContext, so every
// component file that does must start with 'use client'. Without it, importing
// the library from a Server Component throws. Fail on any file that forgot.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const src = new URL('../src/', import.meta.url).pathname;
const skip = /\.(test|stories)\.tsx?$|test-(setup|utils)\.ts$/;
// `useX(` or `useX<`, and createContext. src/hooks/ is only used by client files.
const needsClient = /\buse[A-Z]\w*[<(]|createContext/;
const hasDirective = /^\s*(['"])use client\1/;

const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
    );

const missing = walk(src).filter(
    (f) =>
        /\.tsx?$/.test(f) &&
        !skip.test(f) &&
        !f.includes('/hooks/') &&
        needsClient.test(readFileSync(f, 'utf8')) &&
        !hasDirective.test(readFileSync(f, 'utf8')),
);

if (missing.length)
    throw new Error(
        `Missing 'use client' (uses hooks or createContext):\n${missing
            .map((f) => `  ${f.replace(src, 'src/')}`)
            .join('\n')}`,
    );
