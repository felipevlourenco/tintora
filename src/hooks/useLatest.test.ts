import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useLatest } from './useLatest';

describe('useLatest', () => {
    it('starts with the first value', () => {
        const { result } = renderHook(() => useLatest('a'));
        expect(result.current.current).toBe('a');
    });

    it('holds the newest value and keeps the same ref', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useLatest(value),
            { initialProps: { value: 'a' } },
        );
        const ref = result.current;
        rerender({ value: 'b' });
        expect(result.current).toBe(ref);
        expect(ref.current).toBe('b');
    });
});
