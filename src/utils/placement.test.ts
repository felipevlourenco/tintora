import { describe, expect, it } from 'vitest';
import { getPosition } from './placement';

describe('getPosition', () => {
    // A trigger and a tooltip with different heights, so mixing them up shows.
    const anchor = new DOMRect(200, 100, 60, 40);
    const tooltip = { width: 100, height: 30 };
    const viewport = { width: 1000, height: 800 };

    it.each([
        ['top', { top: 60, left: 180 }],
        ['bottom', { top: 150, left: 180 }],
        ['left', { top: 105, left: 90 }],
        ['right', { top: 105, left: 270 }],
    ] as const)('places %s, 10px away and centred', (placement, expected) => {
        expect(getPosition(anchor, tooltip, placement, viewport)).toMatchObject(
            { ...expected, placement },
        );
    });

    describe('flipping to the opposite side', () => {
        const side = (
            rect: DOMRect,
            placement: 'top' | 'bottom' | 'left' | 'right',
            vp = viewport,
        ) => getPosition(rect, tooltip, placement, vp).placement;

        it.each([
            ['top', new DOMRect(200, 20, 60, 40), 'bottom'],
            ['bottom', new DOMRect(200, 740, 60, 40), 'top'],
            ['left', new DOMRect(20, 300, 60, 40), 'right'],
            ['right', new DOMRect(920, 300, 60, 40), 'left'],
        ] as const)(
            'flips %s when it does not fit',
            (placement, rect, flipped) => {
                expect(side(rect, placement)).toBe(flipped);
            },
        );

        it.each(['top', 'bottom', 'left', 'right'] as const)(
            'keeps %s when there is room',
            (placement) => {
                expect(side(new DOMRect(400, 400, 60, 40), placement)).toBe(
                    placement,
                );
            },
        );

        it('keeps the viewport margin: exactly tooltip + gap is not enough', () => {
            // 40px above the trigger = 30 (tooltip) + 10 (gap), no margin left
            expect(side(new DOMRect(200, 40, 60, 40), 'top')).toBe('bottom');
            expect(side(new DOMRect(200, 48, 60, 40), 'top')).toBe('top');
        });

        it('keeps the requested side when neither side fits', () => {
            const small = { width: 1000, height: 50 };
            expect(side(new DOMRect(200, 5, 60, 40), 'top', small)).toBe('top');
        });

        it('does not flip to a side with less room', () => {
            // 30px above, 20px below: neither fits, below is worse
            const short = { width: 1000, height: 90 };
            expect(side(new DOMRect(200, 30, 60, 40), 'top', short)).toBe(
                'top',
            );
        });
    });

    describe('clamping along the cross axis', () => {
        it('keeps a top tooltip inside the left edge, and moves the arrow', () => {
            const edge = new DOMRect(0, 100, 40, 40);
            const result = getPosition(edge, tooltip, 'top', viewport);
            expect(result.left).toBe(8);
            // trigger centre (20) minus tooltip left (8)
            expect(result.arrowOffset).toBe(12);
        });

        it('keeps a bottom tooltip inside the right edge', () => {
            const edge = new DOMRect(960, 100, 40, 40);
            const result = getPosition(edge, tooltip, 'bottom', viewport);
            expect(result.left).toBe(1000 - 100 - 8);
            // trigger centre (980) minus tooltip left (892)
            expect(result.arrowOffset).toBe(88);
        });

        it('keeps a left tooltip inside the top edge', () => {
            const edge = new DOMRect(500, 0, 40, 20);
            const result = getPosition(edge, tooltip, 'left', viewport);
            expect(result.top).toBe(8);
        });

        it('centres the arrow when nothing is clamped', () => {
            expect(
                getPosition(anchor, tooltip, 'top', viewport).arrowOffset,
            ).toBe(50);
        });
    });
});
