import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEscapeKey } from './useEscapeKey';

const press = (key: string) => fireEvent.keyDown(document, { key });

describe('useEscapeKey', () => {
    it('calls the handler on Escape while active', () => {
        const onEscape = vi.fn();
        renderHook(() => useEscapeKey(true, onEscape));
        press('Escape');
        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('ignores other keys', () => {
        const onEscape = vi.fn();
        renderHook(() => useEscapeKey(true, onEscape));
        press('Enter');
        expect(onEscape).not.toHaveBeenCalled();
    });

    it('does nothing while inactive, and starts when it becomes active', () => {
        const onEscape = vi.fn();
        const { rerender } = renderHook(
            ({ active }) => useEscapeKey(active, onEscape),
            { initialProps: { active: false } },
        );
        press('Escape');
        expect(onEscape).not.toHaveBeenCalled();
        rerender({ active: true });
        press('Escape');
        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('calls the newest handler without re-subscribing', () => {
        const add = vi.spyOn(document, 'addEventListener');
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = renderHook(
            ({ handler }) => useEscapeKey(true, handler),
            { initialProps: { handler: first } },
        );
        const subscriptions = add.mock.calls.length;
        rerender({ handler: second });
        press('Escape');
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
        expect(add.mock.calls).toHaveLength(subscriptions);
        add.mockRestore();
    });

    it('stops listening on unmount', () => {
        const onEscape = vi.fn();
        const { unmount } = renderHook(() => useEscapeKey(true, onEscape));
        unmount();
        press('Escape');
        expect(onEscape).not.toHaveBeenCalled();
    });
});
