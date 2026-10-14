import { describe, expect, it } from 'vitest';
import { getCapitalFirstLetters } from './utils';

// Spec: first letter of the first and last word, uppercased.
// One word gives one letter, no words gives ''. Middle words are ignored.
describe('getCapitalFirstLetters', () => {
    describe('two words', () => {
        it('returns both initials', () => {
            expect(getCapitalFirstLetters('Felipe Lourenco')).toBe('FL');
        });

        it('uppercases lowercase names', () => {
            expect(getCapitalFirstLetters('felipe lourenco')).toBe('FL');
        });

        it('handles mixed case', () => {
            expect(getCapitalFirstLetters('fELIPE lOURENCO')).toBe('FL');
        });

        it('handles single-letter words', () => {
            expect(getCapitalFirstLetters('A B')).toBe('AB');
        });
    });

    describe('one word', () => {
        it('returns a single initial', () => {
            expect(getCapitalFirstLetters('Felipe')).toBe('F');
        });

        it('uppercases it', () => {
            expect(getCapitalFirstLetters('felipe')).toBe('F');
        });

        it('ignores surrounding whitespace', () => {
            expect(getCapitalFirstLetters('  Felipe  ')).toBe('F');
        });
    });

    describe('more than two words', () => {
        it('uses the first and last word', () => {
            expect(getCapitalFirstLetters('Felipe Vieira Lourenco')).toBe('FL');
        });

        it('ignores every middle word', () => {
            expect(getCapitalFirstLetters('Ana Maria da Silva Santos')).toBe(
                'AS',
            );
        });
    });

    describe('whitespace', () => {
        it('returns an empty string for an empty name', () => {
            expect(getCapitalFirstLetters('')).toBe('');
        });

        it('returns an empty string for a whitespace-only name', () => {
            expect(getCapitalFirstLetters('   ')).toBe('');
        });

        it('trims leading and trailing spaces', () => {
            expect(getCapitalFirstLetters('  Felipe Lourenco  ')).toBe('FL');
        });

        it('collapses repeated spaces between words', () => {
            expect(getCapitalFirstLetters('Felipe    Lourenco')).toBe('FL');
        });

        it('splits on tabs and newlines', () => {
            expect(getCapitalFirstLetters('Felipe\tLourenco')).toBe('FL');
            expect(getCapitalFirstLetters('Felipe\nLourenco')).toBe('FL');
        });

        it('treats a non-breaking space as a separator', () => {
            expect(getCapitalFirstLetters('Felipe Lourenco')).toBe('FL');
        });

        it('does not let a trailing space hide the last word', () => {
            expect(getCapitalFirstLetters('Felipe Vieira Lourenco ')).toBe(
                'FL',
            );
        });
    });

    describe('punctuation', () => {
        it('uses the first letter of a hyphenated word only', () => {
            expect(getCapitalFirstLetters('Mary-Jane Watson')).toBe('MW');
        });

        it('keeps apostrophes inside a word', () => {
            expect(getCapitalFirstLetters("Conan O'Brien")).toBe('CO');
        });

        it('skips leading punctuation to find the first letter', () => {
            expect(getCapitalFirstLetters('"Felipe" (Lourenco)')).toBe('FL');
        });

        it('skips words that have no letters', () => {
            expect(getCapitalFirstLetters('Felipe - Lourenco')).toBe('FL');
        });

        it('ignores a trailing number with no letters', () => {
            expect(getCapitalFirstLetters('Felipe Lourenco 3')).toBe('FL');
        });

        it('skips special characters and numbers to find each initial', () => {
            expect(getCapitalFirstLetters('@Felipe123 Lourenco!45')).toBe('FL');
        });
    });

    describe('unicode', () => {
        it('uppercases accented letters', () => {
            expect(getCapitalFirstLetters('élodie àlvarez')).toBe('ÉÀ');
        });

        it('supports non-latin scripts', () => {
            expect(getCapitalFirstLetters('Иван Петров')).toBe('ИП');
            expect(getCapitalFirstLetters('山田 太郎')).toBe('山太');
        });

        it('ignores emoji', () => {
            expect(getCapitalFirstLetters('😀 Smith')).toBe('S');
        });

        it('keeps a base letter together with its combining mark', () => {
            // "e" + U+0301 (combining acute) must stay one initial
            expect(getCapitalFirstLetters('élodie Alvarez')).toBe('ÉA');
        });
    });

    describe('does not throw', () => {
        it.each(['', ' ', '  ', 'A', 'A ', ' A', '\n', '-', '😀'])(
            'for %j',
            (name) => {
                expect(() => getCapitalFirstLetters(name)).not.toThrow();
            },
        );
    });

    it('never returns more than two initials', () => {
        const initials = getCapitalFirstLetters('One Two Three Four Five Six');
        expect([...initials]).toHaveLength(2);
    });
});
