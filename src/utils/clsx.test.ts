import { describe, expect, it } from 'vitest';
import { clsx } from './clsx';

describe('clsx', () => {
    it('joins strings with a space', () => {
        expect(clsx('a', 'b', 'c')).toBe('a b c');
    });

    it.each([false, true, 0, 1, null, undefined, ''])('skips %p', (falsy) => {
        expect(clsx('a', falsy, 'b')).toBe('a b');
    });

    it('keeps an object key only when its value is truthy', () => {
        expect(clsx({ a: true, b: false, c: 1, d: 0, e: null })).toBe('a c');
    });

    it('mixes strings, conditions and objects, in order', () => {
        const open = true;
        const loading = false;
        expect(
            clsx('base', open && 'is-open', { 'is-loading': loading }, 'end'),
        ).toBe('base is-open end');
    });

    it('returns an empty string when nothing applies, so `|| undefined` works', () => {
        expect(clsx(false, undefined, {})).toBe('');
        expect(clsx(undefined) || undefined).toBeUndefined();
    });
});
