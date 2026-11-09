import { describe, expect, it } from 'vitest';
import { findTypeaheadMatch } from './typeahead';

const labels = ['Edit', 'Duplicate', 'Delete', 'Details', 'Archive'];

describe('findTypeaheadMatch', () => {
    it('finds nothing for an empty buffer or no match', () => {
        expect(findTypeaheadMatch(labels, '', 0)).toBe(-1);
        expect(findTypeaheadMatch(labels, 'z', 0)).toBe(-1);
        expect(findTypeaheadMatch([], 'a', -1)).toBe(-1);
    });

    it('matches the start of a label, ignoring case', () => {
        expect(findTypeaheadMatch(labels, 'a', -1)).toBe(4);
        expect(findTypeaheadMatch(labels, 'ARCH', -1)).toBe(4);
        expect(findTypeaheadMatch(labels, 'ive', -1)).toBe(-1);
    });

    it('moves on from the current item when one letter is typed', () => {
        expect(findTypeaheadMatch(labels, 'd', 1)).toBe(2);
        expect(findTypeaheadMatch(labels, 'd', 2)).toBe(3);
    });

    it('wraps around to find the next match', () => {
        expect(findTypeaheadMatch(labels, 'd', 3)).toBe(1);
        expect(findTypeaheadMatch(labels, 'e', 0)).toBe(0);
    });

    it('cycles through the matches when one letter is repeated', () => {
        expect(findTypeaheadMatch(labels, 'dd', 1)).toBe(2);
        expect(findTypeaheadMatch(labels, 'ddd', 2)).toBe(3);
    });

    it('stays on the current item while it still matches a longer buffer', () => {
        expect(findTypeaheadMatch(labels, 'de', 3)).toBe(3);
        expect(findTypeaheadMatch(labels, 'det', 3)).toBe(3);
    });

    it('moves to the first match when the current item stops matching', () => {
        expect(findTypeaheadMatch(labels, 'de', 1)).toBe(2);
        expect(findTypeaheadMatch(labels, 'det', 2)).toBe(3);
    });

    it('matches a buffer that has a space in it', () => {
        const copy = ['Copy link', 'Copy text'];
        expect(findTypeaheadMatch(copy, 'copy t', 0)).toBe(1);
    });
});
