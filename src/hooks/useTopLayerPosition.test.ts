import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTopLayerPosition } from './useTopLayerPosition';

let popup: HTMLElement;
let inner: HTMLElement;

beforeEach(() => {
    popup = document.createElement('div');
    inner = document.createElement('div');
    popup.append(inner);
    document.body.append(popup);
});
afterEach(() => popup.remove());

const setup = (open = true, deps: unknown[] = []) => {
    const place = vi.fn(() => ({ top: 1, left: 2 }));
    const show = vi.spyOn(popup, 'showPopover');
    const ref = { current: popup };
    const view = renderHook(
        (props: { open: boolean; deps: unknown[] }) =>
            useTopLayerPosition(props.open, ref, place, props.deps),
        { initialProps: { open, deps } },
    );
    return { place, show, ...view };
};

describe('useTopLayerPosition', () => {
    it('shows the popup in the top layer and returns where it goes', () => {
        const { result, show, place } = setup();
        expect(show).toHaveBeenCalledTimes(1);
        expect(place).toHaveBeenCalledTimes(1);
        expect(result.current).toEqual({ top: 1, left: 2 });
    });

    it('returns null and does not place while closed', () => {
        const { result, show, place } = setup(false);
        expect(result.current).toBeNull();
        expect(show).not.toHaveBeenCalled();
        expect(place).not.toHaveBeenCalled();
    });

    it('returns null again when it closes', () => {
        const { result, rerender } = setup();
        rerender({ open: false, deps: [] });
        expect(result.current).toBeNull();
    });

    it('returns null when the popup is not mounted', () => {
        const place = vi.fn(() => 'x');
        const { result } = renderHook(() =>
            useTopLayerPosition(true, { current: null }, place, []),
        );
        expect(result.current).toBeNull();
        expect(place).not.toHaveBeenCalled();
    });

    it('returns null when place has nothing to measure', () => {
        const { result } = renderHook(() =>
            useTopLayerPosition(true, { current: popup }, () => null, []),
        );
        expect(result.current).toBeNull();
    });

    it('places again when the deps change, and only then', () => {
        const { place, rerender } = setup(true, ['a']);
        rerender({ open: true, deps: ['a'] });
        expect(place).toHaveBeenCalledTimes(1);
        rerender({ open: true, deps: ['b'] });
        expect(place).toHaveBeenCalledTimes(2);
    });

    it('places again on window resize', () => {
        const { place } = setup();
        fireEvent(window, new Event('resize'));
        expect(place).toHaveBeenCalledTimes(2);
    });

    it('places again when the page scrolls, but not when the popup does', () => {
        const { place } = setup();
        fireEvent.scroll(document.body);
        expect(place).toHaveBeenCalledTimes(2);
        fireEvent.scroll(inner);
        fireEvent.scroll(popup);
        expect(place).toHaveBeenCalledTimes(2);
    });

    it('stops listening when it closes and on unmount', () => {
        const { place, rerender, unmount } = setup();
        rerender({ open: false, deps: [] });
        fireEvent(window, new Event('resize'));
        expect(place).toHaveBeenCalledTimes(1);
        rerender({ open: true, deps: [] });
        unmount();
        fireEvent(window, new Event('resize'));
        expect(place).toHaveBeenCalledTimes(2);
    });
});
