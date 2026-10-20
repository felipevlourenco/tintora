import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCheckedState, type CheckedStateProps } from './useCheckedState';

const change = (checked: boolean) =>
    ({ target: { checked } }) as ChangeEvent<HTMLInputElement>;

const setup = (props: CheckedStateProps) =>
    renderHook((p: CheckedStateProps) => useCheckedState(p), {
        initialProps: props,
    });

describe('useCheckedState', () => {
    describe('uncontrolled', () => {
        it('is off by default', () => {
            const { result } = setup({});
            expect(result.current.checked).toBe(false);
        });

        it('starts from defaultChecked', () => {
            const { result } = setup({ defaultChecked: true });
            expect(result.current.checked).toBe(true);
        });

        it('keeps its own state when changed', () => {
            const { result } = setup({});
            act(() => result.current.onChange(change(true)));
            expect(result.current.checked).toBe(true);
            act(() => result.current.onChange(change(false)));
            expect(result.current.checked).toBe(false);
        });

        it('reports each change', () => {
            const onCheckedChange = vi.fn();
            const { result } = setup({ onCheckedChange });
            act(() => result.current.onChange(change(true)));
            expect(onCheckedChange).toHaveBeenCalledWith(true);
        });

        it('ignores later defaultChecked changes', () => {
            const { result, rerender } = setup({ defaultChecked: false });
            rerender({ defaultChecked: true });
            expect(result.current.checked).toBe(false);
        });
    });

    describe('controlled', () => {
        it('follows the `checked` prop', () => {
            const { result, rerender } = setup({
                checked: false,
                onCheckedChange: () => {},
            });
            expect(result.current.checked).toBe(false);
            rerender({ checked: true, onCheckedChange: () => {} });
            expect(result.current.checked).toBe(true);
        });

        it('does not change until the parent says so', () => {
            const onCheckedChange = vi.fn();
            const { result } = setup({ checked: false, onCheckedChange });
            act(() => result.current.onChange(change(true)));
            expect(onCheckedChange).toHaveBeenCalledWith(true);
            expect(result.current.checked).toBe(false);
        });

        it('treats an explicit false as controlled', () => {
            const { result } = setup({
                checked: false,
                onCheckedChange: () => {},
            });
            act(() => result.current.onChange(change(true)));
            expect(result.current.checked).toBe(false);
        });
    });
});
