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
            const { unmount } = setup();
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).toHaveClass(
                'tintora-tooltip__content--top',
            );
            unmount();
            setup({ placement: 'left', className: 'custom' });
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

    it.each([
        ['top', { top: 60, left: 180 }],
        ['bottom', { top: 150, left: 180 }],
        ['left', { top: 105, left: 90 }],
        ['right', { top: 105, left: 270 }],
    ] as const)('places %s, 10px away and centred', (placement, expected) => {
        expect(getPosition(anchor, tooltip, placement)).toEqual(expected);
    });
});
