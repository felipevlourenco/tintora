import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Drawer, type DrawerProps } from './Drawer';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<DrawerProps> = {}) => {
    const onClose = vi.fn();
    const view = render(
        <Drawer open onClose={onClose} aria-label="Filters" {...props}>
            <button type="button">Inside</button>
        </Drawer>,
    );
    return { onClose, ...view };
};

const cancel = (dialog: HTMLElement) =>
    fireEvent(
        dialog,
        new Event('cancel', { bubbles: false, cancelable: true }),
    );

describe('Drawer', () => {
    describe('open', () => {
        it('renders its children in a labelled dialog while open', () => {
            setup();
            const dialog = screen.getByRole('dialog', { name: 'Filters' });
            expect(dialog).toHaveAttribute('open');
            expect(
                screen.getByRole('button', { name: 'Inside' }),
            ).toBeInTheDocument();
        });

        it('is hidden while closed and follows `open`', () => {
            const { rerender, onClose } = setup({ open: false });
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            rerender(<Drawer open onClose={onClose} aria-label="Filters" />);
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            rerender(
                <Drawer open={false} onClose={onClose} aria-label="Filters" />,
            );
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        it('focuses the element marked data-autofocus on open', () => {
            const { rerender, onClose } = setup({ open: false });
            rerender(
                <Drawer open onClose={onClose} aria-label="Filters">
                    <button type="button">First</button>
                    <button type="button" data-autofocus>
                        Second
                    </button>
                </Drawer>,
            );
            expect(
                screen.getByRole('button', { name: 'Second' }),
            ).toHaveFocus();
        });

        it('has no built-in close button', () => {
            render(<Drawer open onClose={() => {}} aria-label="Filters" />);
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });

    describe('dismissing', () => {
        // jsdom has no layout: give the dialog a box to click outside of.
        const withBox = (dialog: HTMLElement) => {
            dialog.getBoundingClientRect = () =>
                ({ left: 100, right: 500, top: 100, bottom: 400 }) as DOMRect;
            return dialog;
        };

        it('calls onClose on a backdrop click', () => {
            const { onClose } = setup();
            fireEvent.click(withBox(screen.getByRole('dialog')), {
                clientX: 50,
                clientY: 50,
            });
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('does not call onClose on a click in its own empty space', () => {
            const { onClose } = setup();
            fireEvent.click(withBox(screen.getByRole('dialog')), {
                clientX: 110,
                clientY: 110,
            });
            expect(onClose).not.toHaveBeenCalled();
        });

        it('does not call onClose on a click inside', () => {
            const { onClose } = setup();
            fireEvent.click(screen.getByRole('button', { name: 'Inside' }));
            expect(onClose).not.toHaveBeenCalled();
        });

        it('asks to close on Esc but stays open until the parent says so', () => {
            const { onClose } = setup();
            const dialog = screen.getByRole('dialog');
            expect(cancel(dialog)).toBe(false); // default prevented
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(dialog).toHaveAttribute('open');
        });
    });

    describe('from', () => {
        it('defaults to the right', () => {
            setup();
            expect(screen.getByRole('dialog')).toHaveClass(
                'tintora-drawer--from-right',
            );
        });

        it.each(['left', 'right', 'top', 'bottom'] as const)(
            'slides in from the %s',
            (from) => {
                setup({ from });
                expect(screen.getByRole('dialog')).toHaveClass(
                    `tintora-drawer--from-${from}`,
                );
            },
        );
    });

    describe('size', () => {
        const style = (name: string) =>
            screen.getByRole('dialog').style.getPropertyValue(name);

        it('turns a number into px', () => {
            setup({ width: 320, height: 480 });
            expect(style('--tintora-drawer-width')).toBe('320px');
            expect(style('--tintora-drawer-height')).toBe('480px');
        });

        it('passes a string through', () => {
            setup({ width: '50vw', height: '60%' });
            expect(style('--tintora-drawer-width')).toBe('50vw');
            expect(style('--tintora-drawer-height')).toBe('60%');
        });

        it('sets no variables when none are given, so the CSS defaults apply', () => {
            setup();
            expect(style('--tintora-drawer-width')).toBe('');
            expect(style('--tintora-drawer-height')).toBe('');
        });

        it('keeps a style passed by the consumer', () => {
            setup({ width: 320, style: { color: 'red' } });
            const dialog = screen.getByRole('dialog');
            expect(dialog.style.color).toBe('red');
            expect(
                dialog.style.getPropertyValue('--tintora-drawer-width'),
            ).toBe('320px');
        });
    });

    describe('props', () => {
        it('merges className and passes other props through', () => {
            setup({ className: 'extra', 'data-testid': 'drawer' } as never);
            expect(screen.getByTestId('drawer')).toHaveClass(
                'tintora-drawer',
                'extra',
            );
        });
    });

    describe('a11y', () => {
        it.each(['left', 'right', 'top', 'bottom'] as const)(
            'has no violations from the %s',
            async (from) => {
                const { container } = setup({ from });
                await expectNoA11yViolations(container);
            },
        );
    });
});
