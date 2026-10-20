import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPosition, Tooltip, type TooltipProps } from './Tooltip';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<TooltipProps> = {}) =>
    render(
        <Tooltip content="Heart rate" {...props}>
            <button type="button">Hover me</button>
        </Tooltip>,
    );

const trigger = () => screen.getByRole('button', { name: 'Hover me' });

describe('Tooltip', () => {
    it('is closed until the trigger is hovered or focused', () => {
        setup();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(trigger()).not.toHaveAttribute('aria-describedby');
    });

    it('opens on hover and closes shortly after the pointer leaves', async () => {
        setup();
        await userEvent.hover(trigger());
        expect(screen.getByRole('tooltip')).toHaveTextContent('Heart rate');
        await userEvent.unhover(trigger());
        await waitFor(() =>
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
        );
    });

    it('stays open when the pointer moves onto the tooltip itself', async () => {
        setup();
        await userEvent.hover(trigger());
        const tooltip = screen.getByRole('tooltip');
        await userEvent.unhover(trigger());
        await userEvent.hover(tooltip);
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('opens on keyboard focus and closes on blur', async () => {
        setup();
        await userEvent.tab();
        expect(trigger()).toHaveFocus();
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        await userEvent.tab();
        await waitFor(() =>
            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
        );
    });

    it('closes on Escape without moving focus', async () => {
        setup();
        await userEvent.tab();
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
    });

    it('describes the trigger while open, without replacing its name', async () => {
        setup();
        await userEvent.hover(trigger());
        const tooltip = screen.getByRole('tooltip');
        expect(trigger()).toHaveAttribute('aria-describedby', tooltip.id);
        expect(trigger()).toHaveAccessibleName('Hover me');
        expect(trigger()).toHaveAccessibleDescription('Heart rate');
    });

    it("keeps the trigger's own aria-describedby", async () => {
        render(
            <>
                <span id="hint">Existing hint</span>
                <Tooltip content="Heart rate">
                    <button type="button" aria-describedby="hint">
                        Hover me
                    </button>
                </Tooltip>
            </>,
        );
        expect(trigger()).toHaveAttribute('aria-describedby', 'hint');
        await userEvent.hover(trigger());
        const ids = trigger().getAttribute('aria-describedby')!.split(' ');
        expect(ids).toContain('hint');
        expect(ids).toContain(screen.getByRole('tooltip').id);
    });

    it('does not add a wrapper box around the trigger', () => {
        const { container } = setup();
        expect(container.firstElementChild).toHaveClass('tintora-tooltip');
        expect(container.firstElementChild).toContainElement(trigger());
    });

    describe('content', () => {
        it('renders a shortcut as a kbd chip', async () => {
            setup({ shortcut: 'Ctrl K' });
            await userEvent.hover(trigger());
            const kbd = screen.getByText('Ctrl K');
            expect(kbd.tagName).toBe('KBD');
            expect(screen.getByRole('tooltip')).not.toHaveClass(
                'tintora-tooltip__content--rich',
            );
        });

        it('renders the rich variant when there is a title', async () => {
            setup({ title: 'Heart rate zone', content: 'Last 7 workouts.' });
            await userEvent.hover(trigger());
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toHaveClass('tintora-tooltip__content--rich');
            expect(tooltip).toHaveTextContent('Heart rate zone');
            expect(tooltip).toHaveTextContent('Last 7 workouts.');
        });

        it('defaults to top and applies the given placement and className', async () => {
            // jsdom has no layout: put the trigger mid-screen so nothing flips.
            const room = () =>
                vi
                    .spyOn(trigger(), 'getBoundingClientRect')
                    .mockReturnValue(new DOMRect(400, 400, 60, 40));
            const { unmount } = setup();
            room();
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).toHaveClass(
                'tintora-tooltip__content--top',
            );
            unmount();
            setup({ placement: 'left', className: 'custom' });
            room();
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).toHaveClass(
                'tintora-tooltip__content--left',
                'custom',
            );
        });
    });

    describe('placement', () => {
        afterEach(() => vi.restoreAllMocks());

        it('is placed from the trigger and tooltip sizes', async () => {
            vi.spyOn(
                HTMLElement.prototype,
                'offsetWidth',
                'get',
            ).mockReturnValue(100);
            vi.spyOn(
                HTMLElement.prototype,
                'offsetHeight',
                'get',
            ).mockReturnValue(30);
            setup({ placement: 'bottom' });
            vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(
                new DOMRect(200, 100, 60, 40),
            );
            await userEvent.hover(trigger());
            // centred under the trigger, 10px below it
            expect(screen.getByRole('tooltip')).toHaveStyle({
                top: '150px',
                left: '180px',
            });
        });
    });

    it('has no accessibility violations while open', async () => {
        const { container } = setup();
        await userEvent.hover(trigger());
        await expectNoA11yViolations(container);
    });
});

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
