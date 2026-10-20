import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useOutsidePress } from './useOutsidePress';

let inside: HTMLElement;
let child: HTMLElement;
let outside: HTMLElement;

beforeEach(() => {
    inside = document.createElement('div');
    child = document.createElement('button');
    inside.append(child);
    outside = document.createElement('div');
    document.body.append(inside, outside);
});
afterEach(() => {
    inside.remove();
    outside.remove();
});

const setup = (active = true) => {
    const onPress = vi.fn();
    const ref = { current: inside };
    const view = renderHook(
        ({ active }) => useOutsidePress(active, ref, onPress),
        { initialProps: { active } },
    );
    return { onPress, ...view };
};

describe('useOutsidePress', () => {
    it('calls the handler for a press outside the element', () => {
        const { onPress } = setup();
        fireEvent.pointerDown(outside);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('ignores presses on the element and its descendants', () => {
        const { onPress } = setup();
        fireEvent.pointerDown(inside);
        fireEvent.pointerDown(child);
        expect(onPress).not.toHaveBeenCalled();
    });

    it('does nothing while inactive, and starts when it becomes active', () => {
        const { onPress, rerender } = setup(false);
        fireEvent.pointerDown(outside);
        expect(onPress).not.toHaveBeenCalled();
        rerender({ active: true });
        fireEvent.pointerDown(outside);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('treats every press as outside when the ref is empty', () => {
        const onPress = vi.fn();
        renderHook(() => useOutsidePress(true, { current: null }, onPress));
        fireEvent.pointerDown(inside);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('stops listening on unmount', () => {
        const { onPress, unmount } = setup();
        unmount();
        fireEvent.pointerDown(outside);
        expect(onPress).not.toHaveBeenCalled();
    });
});
