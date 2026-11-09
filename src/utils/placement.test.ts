import { describe, expect, it } from 'vitest';
import { dropdownTop, getPosition } from './placement';

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

    describe('alignment', () => {
        // The trigger is 60 wide and 40 tall; the tooltip 100 wide and 30 tall,
        // so lining up with one edge or the other gives different numbers.
        it.each([
            ['top', 'start', { top: 60, left: 200 }],
            ['top', 'end', { top: 60, left: 160 }],
            ['bottom', 'start', { top: 150, left: 200 }],
            ['bottom', 'end', { top: 150, left: 160 }],
            ['left', 'start', { top: 100, left: 90 }],
            ['left', 'end', { top: 110, left: 90 }],
            ['right', 'start', { top: 100, left: 270 }],
            ['right', 'end', { top: 110, left: 270 }],
        ] as const)(
            'lines up %s-%s with the trigger edge',
            (placement, align, expected) => {
                expect(
                    getPosition(anchor, tooltip, placement, viewport, {
                        align,
                    }),
                ).toMatchObject({ ...expected, placement });
            },
        );

        it('centres when no alignment is given, or when it is "center"', () => {
            const centred = getPosition(anchor, tooltip, 'top', viewport);
            expect(
                getPosition(anchor, tooltip, 'top', viewport, {
                    align: 'center',
                }),
            ).toEqual(centred);
            expect(centred.left).toBe(180);
        });

        it('keeps the alignment when it flips to the other side', () => {
            const nearTop = new DOMRect(200, 20, 60, 40);
            expect(
                getPosition(nearTop, tooltip, 'top', viewport, {
                    align: 'end',
                }),
            ).toMatchObject({ placement: 'bottom', left: 160 });
        });

        it('is still kept inside the viewport', () => {
            // End-aligned to a trigger at the left edge would start at -40.
            const atEdge = new DOMRect(0, 400, 60, 40);
            expect(
                getPosition(atEdge, tooltip, 'top', viewport, { align: 'end' })
                    .left,
            ).toBe(8);
        });

        it('points the arrow at the trigger centre', () => {
            // Centre of the trigger is x=230: 30 from the left edge of a
            // start-aligned tooltip, 70 from an end-aligned one.
            expect(
                getPosition(anchor, tooltip, 'top', viewport, {
                    align: 'start',
                }).arrowOffset,
            ).toBe(30);
            expect(
                getPosition(anchor, tooltip, 'top', viewport, { align: 'end' })
                    .arrowOffset,
            ).toBe(70);
        });

        it('keeps the arrow on the tooltip when the trigger is much wider', () => {
            // The trigger centre is 150 from the tooltip's edge, past its 100
            // width, so the arrow stops 12 short of the end.
            const wide = new DOMRect(200, 100, 300, 40);
            expect(
                getPosition(wide, tooltip, 'top', viewport, { align: 'start' })
                    .arrowOffset,
            ).toBe(88);
        });
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

describe('dropdownTop', () => {
    const below = { top: 60, bottom: 100 };
    const nearBottom = { top: 700, bottom: 740 };

    it('opens below the trigger when it fits', () => {
        expect(dropdownTop(below, 200, 768)).toBe(104);
    });

    it('opens above the trigger when it does not fit below but fits above', () => {
        expect(dropdownTop(nearBottom, 200, 768)).toBe(496);
    });

    it('opens below when it fits neither way, where the page can scroll to it', () => {
        expect(dropdownTop({ top: 100, bottom: 140 }, 300, 200)).toBe(144);
    });

    it('counts an exact fit as fitting', () => {
        expect(dropdownTop({ top: 400, bottom: 440 }, 324, 768)).toBe(444);
        expect(dropdownTop({ top: 204, bottom: 740 }, 200, 768)).toBe(0);
    });

    it('takes the gap as an option', () => {
        expect(dropdownTop(below, 200, 768, 10)).toBe(110);
    });
});
