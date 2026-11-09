import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Tooltip, type TooltipProps } from './Tooltip';
import { expectNoA11yViolations } from '../test-utils';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Tooltip.css'), 'utf8');

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

    describe('alignment', () => {
        afterEach(() => vi.restoreAllMocks());

        // A 100x30 tooltip next to a 60x40 trigger whose corner is (200, 100).
        const place = async (placement: TooltipProps['placement']) => {
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
            setup({ placement });
            vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(
                new DOMRect(200, 100, 60, 40),
            );
            await userEvent.hover(trigger());
            return screen.getByRole('tooltip');
        };

        it('lines up with the start of the trigger', async () => {
            expect(await place('bottom-start')).toHaveStyle({
                top: '150px',
                left: '200px',
            });
        });

        it('lines up with the end of the trigger', async () => {
            expect(await place('bottom-end')).toHaveStyle({
                top: '150px',
                left: '160px',
            });
        });

        it('lines up top, not left, on a tooltip beside the trigger', async () => {
            expect(await place('right-end')).toHaveStyle({
                top: '110px',
                left: '270px',
            });
        });

        it('keeps the side as its class, so the arrow is on the right edge', async () => {
            expect(await place('top-end')).toHaveClass(
                'tintora-tooltip__content--top',
            );
        });
    });

    describe('tone', () => {
        it('follows the page theme by default', async () => {
            setup();
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).not.toHaveAttribute(
                'data-theme',
            );
        });

        it('is the same as "auto" when that is given', async () => {
            setup({ tone: 'auto' });
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).not.toHaveAttribute(
                'data-theme',
            );
        });

        // A tooltip is the inverse of its page: dark on a light page, light on
        // a dark one, so its light colours are in the dark theme's tokens.
        it.each([
            ['light', 'dark'],
            ['dark', 'light'],
        ] as const)(
            'tone "%s" takes the tooltip colours of the %s theme, whatever the page theme',
            async (tone, theme) => {
                setup({ tone });
                await userEvent.hover(trigger());
                expect(screen.getByRole('tooltip')).toHaveAttribute(
                    'data-theme',
                    theme,
                );
            },
        );
    });

    describe('icon', () => {
        const icon = <svg data-testid="icon" />;

        it('shows before the text, hidden from assistive tech', async () => {
            setup({ icon });
            await userEvent.hover(trigger());
            const tooltip = screen.getByRole('tooltip');
            const box = screen.getByTestId('icon').parentElement;
            expect(box).toHaveClass('tintora-tooltip__icon');
            expect(box).toHaveAttribute('aria-hidden', 'true');
            expect(tooltip.firstElementChild).toBe(box);
            expect(tooltip).toHaveClass('tintora-tooltip__content--with-icon');
        });

        it('does not change what describes the trigger', async () => {
            setup({
                icon: (
                    <svg data-testid="icon">
                        <title>Info</title>
                    </svg>
                ),
            });
            await userEvent.hover(trigger());
            expect(trigger()).toHaveAccessibleDescription('Heart rate');
        });

        it('sits beside the title and text in the rich variant', async () => {
            setup({ icon, title: 'Heart rate zone', content: 'Last 7 days.' });
            await userEvent.hover(trigger());
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip).toHaveClass(
                'tintora-tooltip__content--rich',
                'tintora-tooltip__content--with-icon',
            );
            expect(tooltip.firstElementChild).toHaveClass(
                'tintora-tooltip__icon',
            );
        });

        it('adds nothing without an icon', async () => {
            setup();
            await userEvent.hover(trigger());
            const tooltip = screen.getByRole('tooltip');
            expect(tooltip.querySelector('.tintora-tooltip__icon')).toBeNull();
            expect(tooltip).not.toHaveClass(
                'tintora-tooltip__content--with-icon',
            );
        });
    });

    describe('arrow', () => {
        afterEach(() => vi.restoreAllMocks());

        it('has one by default', async () => {
            setup();
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).not.toHaveClass(
                'tintora-tooltip__content--no-arrow',
            );
        });

        it('is removed with arrow={false}', async () => {
            setup({ arrow: false });
            await userEvent.hover(trigger());
            expect(screen.getByRole('tooltip')).toHaveClass(
                'tintora-tooltip__content--no-arrow',
            );
            expect(css).toMatch(
                /\.tintora-tooltip__content--no-arrow::before\s*\{\s*display:\s*none/,
            );
        });

        it('sits closer to the trigger without it, since no arrow needs the room', async () => {
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
            setup({ placement: 'bottom', arrow: false });
            vi.spyOn(trigger(), 'getBoundingClientRect').mockReturnValue(
                new DOMRect(200, 100, 60, 40),
            );
            await userEvent.hover(trigger());
            // With the arrow it is 10px below the trigger (see "placement").
            expect(screen.getByRole('tooltip')).toHaveStyle({ top: '146px' });
        });
    });

    it('has no accessibility violations while open', async () => {
        const { container } = setup();
        await userEvent.hover(trigger());
        await expectNoA11yViolations(container);
    });
});
