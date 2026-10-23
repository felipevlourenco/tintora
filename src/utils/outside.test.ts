import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { isOutsideElementClicked } from './outside';

// The element sits at 100..500 x 100..400.
const box = { left: 100, right: 500, top: 100, bottom: 400 };

const click = (
    point: { clientX: number; clientY: number },
    { onChild = false } = {},
) => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => box as DOMRect;
    const target = onChild ? document.createElement('button') : element;
    const callback = vi.fn();
    isOutsideElementClicked(
        { ...point, target, currentTarget: element } as unknown as MouseEvent,
        callback,
    );
    return callback;
};

describe('isOutsideElementClicked', () => {
    it.each([
        ['left of', { clientX: 99, clientY: 200 }],
        ['right of', { clientX: 501, clientY: 200 }],
        ['above', { clientX: 300, clientY: 99 }],
        ['below', { clientX: 300, clientY: 401 }],
    ])('calls back for a click %s the box', (_, point) => {
        expect(click(point)).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['inside', { clientX: 300, clientY: 200 }],
        ['on the left edge', { clientX: 100, clientY: 200 }],
        ['on the bottom right corner', { clientX: 500, clientY: 400 }],
    ])('ignores a click %s the box', (_, point) => {
        expect(click(point)).not.toHaveBeenCalled();
    });

    it('ignores a click that landed on a child, even outside the box', () => {
        expect(
            click({ clientX: 50, clientY: 50 }, { onChild: true }),
        ).not.toHaveBeenCalled();
    });

    it('ignores a keyboard click, which reports 0,0 on the button', () => {
        expect(
            click({ clientX: 0, clientY: 0 }, { onChild: true }),
        ).not.toHaveBeenCalled();
    });
});
