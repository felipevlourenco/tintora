import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Popover, type PopoverProps } from './Popover';

const css = readFileSync(
    join(process.cwd(), 'src/Popover/Popover.css'),
    'utf8',
);

type Props = Partial<Omit<PopoverProps, 'trigger'>> & {
    triggerProps?: Record<string, unknown>;
};

const setup = ({ triggerProps, ...props }: Props = {}) => {
    const onOpenChange = vi.fn();
    const view = render(
        <Popover
            open
            onOpenChange={onOpenChange}
            title="Daily step goal"
            trigger={
                <button type="button" {...triggerProps}>
                    Edit goal
                </button>
            }
            {...props}
        >
            <button type="button">8,000</button>
            <button type="button">10,000</button>
        </Popover>,
    );
    return { onOpenChange, ...view };
};

/** The parent owns `open`, as it does in real use. */
function Harness(props: Partial<PopoverProps>) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button">Elsewhere</button>
            <Popover
                title="Daily step goal"
                {...props}
                open={open}
                onOpenChange={setOpen}
                trigger={<button type="button">Edit goal</button>}
            >
                <button type="button">8,000</button>
                <button type="button">10,000</button>
            </Popover>
        </>
    );
}

const trigger = () => screen.getByRole('button', { name: 'Edit goal' });
const panel = () => screen.getByRole('dialog');

/**
 * jsdom has no layout, so give the trigger a rect and the panel a size. The
 * viewport is jsdom's default 1024 x 768. Anything inside the panel gets a
 * different rect, so measuring the wrong element shows up as a wrong position.
 */
function mockLayout(anchor: DOMRect, panelSize = { width: 300, height: 150 }) {
    const inPanel = (el: Element) => el.closest('.tintora-popover') !== null;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function (this: Element) {
            return inPanel(this) ? new DOMRect(10, 10, 50, 20) : anchor;
        },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
        function (this: HTMLElement) {
            return this.classList.contains('tintora-popover')
                ? panelSize.width
                : 0;
        },
    );
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
        function (this: HTMLElement) {
            return this.classList.contains('tintora-popover')
                ? panelSize.height
                : 0;
        },
    );
}

afterEach(() => vi.restoreAllMocks());

describe('Popover', () => {
    describe('open and closed', () => {
        it('renders no panel while closed', () => {
            setup({ open: false });
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('renders the panel and its content while open', () => {
            setup();
            expect(panel()).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: '8,000' }),
            ).toBeInTheDocument();
        });

        it('is a manual popover, so Esc and outside presses are the parent’s', () => {
            setup();
            expect(panel()).toHaveAttribute('popover', 'manual');
        });

        it('shows the panel in the top layer once per open', () => {
            const show = vi.spyOn(HTMLElement.prototype, 'showPopover');
            setup();
            expect(show).toHaveBeenCalledTimes(1);
        });
    });

    describe('the trigger', () => {
        it('says whether the popover is open, and what it opens', () => {
            const { rerender, onOpenChange } = setup({ open: false });
            expect(trigger()).toHaveAttribute('aria-haspopup', 'dialog');
            expect(trigger()).toHaveAttribute('aria-expanded', 'false');
            expect(trigger()).not.toHaveAttribute('aria-controls');
            rerender(
                <Popover
                    open
                    onOpenChange={onOpenChange}
                    title="Daily step goal"
                    trigger={<button type="button">Edit goal</button>}
                >
                    x
                </Popover>,
            );
            expect(trigger()).toHaveAttribute('aria-expanded', 'true');
            expect(trigger()).toHaveAttribute('aria-controls', panel().id);
        });

        it('asks to open when pressed while closed', async () => {
            const { onOpenChange } = setup({ open: false });
            await userEvent.click(trigger());
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it('asks to close when pressed while open', async () => {
            const { onOpenChange } = setup();
            await userEvent.click(trigger());
            expect(onOpenChange).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('keeps the trigger’s own onClick', async () => {
            const onClick = vi.fn();
            const { onOpenChange } = setup({
                open: false,
                triggerProps: { onClick },
            });
            await userEvent.click(trigger());
            expect(onClick).toHaveBeenCalledTimes(1);
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it('keeps the trigger’s own ref', () => {
            const ref = createRef<HTMLButtonElement>();
            setup({ triggerProps: { ref } });
            expect(ref.current).toBe(trigger());
        });

        it('does not toggle when the trigger’s onClick prevents default', async () => {
            const { onOpenChange } = setup({
                open: false,
                triggerProps: { onClick: (e: Event) => e.preventDefault() },
            });
            await userEvent.click(trigger());
            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('the panel', () => {
        it('is named by `title`', () => {
            setup({ title: 'Daily step goal' });
            expect(
                screen.getByRole('dialog', { name: 'Daily step goal' }),
            ).toBeInTheDocument();
        });

        it('supports role="alertdialog"', () => {
            setup({ role: 'alertdialog' });
            expect(screen.getByRole('alertdialog')).toBeInTheDocument();
        });

        it('has the md size by default, and takes sm and a className', () => {
            const { rerender, onOpenChange } = setup();
            expect(panel()).toHaveClass('tintora-popover--md');
            rerender(
                <Popover
                    open
                    onOpenChange={onOpenChange}
                    title="t"
                    size="sm"
                    className="mine"
                    trigger={<button type="button">Edit goal</button>}
                >
                    x
                </Popover>,
            );
            expect(panel()).toHaveClass('tintora-popover--sm', 'mine');
        });

        it('never carries an "undefined" modifier class', () => {
            setup();
            expect(panel().className).not.toMatch(/undefined/);
        });
    });

    describe('closing', () => {
        it('asks to close on Esc', async () => {
            const { onOpenChange } = setup();
            await userEvent.keyboard('{Escape}');
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('does not listen for Esc while closed', async () => {
            const { onOpenChange } = setup({ open: false });
            await userEvent.keyboard('{Escape}');
            expect(onOpenChange).not.toHaveBeenCalled();
        });

        it('asks to close on a press outside', () => {
            const { onOpenChange } = setup();
            fireEvent.pointerDown(document.body);
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });

        it('stays open for a press inside the panel', () => {
            const { onOpenChange } = setup();
            fireEvent.pointerDown(
                screen.getByRole('button', { name: '8,000' }),
            );
            expect(onOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('focus', () => {
        it('moves into the panel, to the first focusable element', async () => {
            render(<Harness />);
            await userEvent.click(trigger());
            expect(screen.getByRole('button', { name: '8,000' })).toHaveFocus();
        });

        it('prefers the element marked data-autofocus', async () => {
            render(
                <Popover
                    open
                    onOpenChange={() => {}}
                    title="Delete"
                    role="alertdialog"
                    trigger={<button type="button">Delete</button>}
                >
                    <button type="button">Delete it</button>
                    <button type="button" data-autofocus>
                        Keep
                    </button>
                </Popover>,
            );
            expect(screen.getByRole('button', { name: 'Keep' })).toHaveFocus();
        });

        it('skips disabled controls', () => {
            render(
                <Popover
                    open
                    onOpenChange={() => {}}
                    title="t"
                    trigger={<button type="button">Edit goal</button>}
                >
                    <button type="button" disabled>
                        Off
                    </button>
                    <button type="button">On</button>
                </Popover>,
            );
            expect(screen.getByRole('button', { name: 'On' })).toHaveFocus();
        });

        it('falls back to the panel when nothing in it can take focus', () => {
            render(
                <Popover
                    open
                    onOpenChange={() => {}}
                    title="t"
                    trigger={<button type="button">Edit goal</button>}
                >
                    <p>Just text</p>
                </Popover>,
            );
            expect(panel()).toHaveFocus();
        });

        it('is visible when focus moves in', () => {
            // Placement hides the panel until it is measured; a hidden element
            // cannot take focus in a real browser, so focus must wait for it.
            const original = HTMLElement.prototype.focus;
            const seen: string[] = [];
            vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(
                function (this: HTMLElement, ...args) {
                    const host = this.closest<HTMLElement>('.tintora-popover');
                    if (host) seen.push(getComputedStyle(host).visibility);
                    original.apply(this, args);
                },
            );
            render(<Harness />);
            fireEvent.click(trigger());
            expect(seen.length).toBeGreaterThan(0);
            expect(seen).not.toContain('hidden');
        });

        it('does not pull focus back when the panel is placed again', async () => {
            // Scrolling and resizing re-place the panel; that must not touch focus.
            render(<Harness />);
            await userEvent.click(trigger());
            const second = screen.getByRole('button', { name: '10,000' });
            act(() => second.focus());
            fireEvent(window, new Event('resize'));
            fireEvent.scroll(document.body);
            expect(second).toHaveFocus();
        });

        it('returns to the trigger when Esc closes it', async () => {
            render(<Harness />);
            await userEvent.click(trigger());
            await userEvent.keyboard('{Escape}');
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(trigger()).toHaveFocus();
        });

        it('returns to the trigger when a button inside closes it', async () => {
            function Closing() {
                const [open, setOpen] = useState(false);
                return (
                    <Popover
                        open={open}
                        onOpenChange={setOpen}
                        title="t"
                        trigger={<button type="button">Edit goal</button>}
                    >
                        <button type="button" onClick={() => setOpen(false)}>
                            Save
                        </button>
                    </Popover>
                );
            }
            render(<Closing />);
            await userEvent.click(trigger());
            await userEvent.click(screen.getByRole('button', { name: 'Save' }));
            expect(trigger()).toHaveFocus();
        });

        it('does not take focus back from the control that was pressed outside', async () => {
            render(<Harness />);
            await userEvent.click(trigger());
            await userEvent.click(
                screen.getByRole('button', { name: 'Elsewhere' }),
            );
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Elsewhere' }),
            ).toHaveFocus();
        });
    });

    describe('placement', () => {
        const anchor = new DOMRect(400, 300, 100, 36);

        it('opens below the trigger by default', () => {
            mockLayout(anchor);
            setup();
            expect(panel()).toHaveClass('tintora-popover--bottom');
            expect(parseFloat(panel().style.top)).toBeGreaterThan(
                anchor.bottom,
            );
        });

        it('leaves 12px between the trigger and the panel', () => {
            mockLayout(anchor);
            setup({ placement: 'bottom' });
            expect(parseFloat(panel().style.top)).toBe(anchor.bottom + 12);
        });

        it.each([
            ['top', 'top'],
            ['left', 'left'],
            ['right', 'right'],
        ] as const)('opens on the %s when asked', (placement, side) => {
            mockLayout(anchor);
            setup({ placement });
            expect(panel()).toHaveClass(`tintora-popover--${side}`);
        });

        it('flips above when there is no room below', () => {
            mockLayout(new DOMRect(400, 740, 100, 36));
            setup({ placement: 'bottom' });
            expect(panel()).toHaveClass('tintora-popover--top');
        });

        it('points the arrow at the trigger', () => {
            mockLayout(new DOMRect(0, 300, 40, 36));
            setup({ placement: 'bottom' });
            // Shifted inside the screen, the panel is not centred on the
            // trigger, so the arrow moves to stay on it.
            const offset = panel().style.getPropertyValue(
                '--tintora-popover-arrow-offset',
            );
            expect(parseFloat(offset)).toBeLessThan(150);
        });
    });

    describe('stylesheet', () => {
        // jsdom applies no CSS, so these read the source. The component places
        // the panel with viewport coordinates, and sizes come from the design.
        it('fixes the panel to the viewport', () => {
            expect(css).toMatch(/\.tintora-popover\s*\{[^}]*position:\s*fixed/);
        });

        it('has no leftover hard-coded offsets', () => {
            expect(css).not.toMatch(
                /\.tintora-popover\s*\{[^}]*(top:\s*48px|left:\s*0)/,
            );
        });
    });

    it('is exported from the package', async () => {
        const lib = await import('../index');
        expect(lib).toHaveProperty('Popover');
    });

    it('has no a11y violations', async () => {
        const { container } = setup();
        await expectNoA11yViolations(container);
    });
});
