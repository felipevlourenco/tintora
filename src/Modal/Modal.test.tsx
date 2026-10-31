import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal, type ModalProps } from './Modal';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<ModalProps> = {}) => {
    const onClose = vi.fn();
    const view = render(
        <Modal open onClose={onClose} title="Weekly goal" {...props}>
            <button type="button">Inside</button>
        </Modal>,
    );
    return { onClose, ...view };
};

describe('Modal', () => {
    it('renders a labelled dialog while open', () => {
        setup({ description: 'Pick a number' });
        const dialog = screen.getByRole('dialog', { name: 'Weekly goal' });
        expect(dialog).toHaveAccessibleDescription('Pick a number');
        expect(dialog).toHaveAttribute('open');
    });

    it('is hidden while closed and opens when `open` flips', () => {
        const { rerender, onClose } = setup({ open: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        rerender(<Modal open onClose={onClose} title="Weekly goal" />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        rerender(<Modal open={false} onClose={onClose} title="Weekly goal" />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('supports role="alertdialog"', () => {
        setup({ role: 'alertdialog' });
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('takes a translated close button label', () => {
        setup({ closeLabel: 'Fechar' });
        expect(
            screen.getByRole('button', { name: 'Fechar' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    });

    it('calls onClose from the close button and hides it when asked', async () => {
        const { onClose, rerender } = setup();
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onClose).toHaveBeenCalledTimes(1);
        rerender(
            <Modal open onClose={onClose} title="x" closeButton={false} />,
        );
        expect(
            screen.queryByRole('button', { name: 'Close' }),
        ).not.toBeInTheDocument();
    });

    it('asks to close on Esc but stays open until the parent says so', () => {
        const { onClose } = setup();
        const dialog = screen.getByRole('dialog');
        const notPrevented = fireEvent(
            dialog,
            new Event('cancel', { bubbles: false, cancelable: true }),
        );
        expect(notPrevented).toBe(false);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(dialog).toHaveAttribute('open');
    });

    // jsdom has no layout: give the dialog a box to click outside of.
    const withBox = (dialog: HTMLElement) => {
        dialog.getBoundingClientRect = () =>
            ({ left: 100, right: 500, top: 100, bottom: 400 }) as DOMRect;
        return dialog;
    };

    it('closes on a scrim click, not on a click inside', async () => {
        const { onClose } = setup();
        await userEvent.click(screen.getByRole('button', { name: 'Inside' }));
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.click(withBox(screen.getByRole('dialog')), {
            clientX: 50,
            clientY: 50,
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on a click in its own padding', () => {
        const { onClose } = setup();
        fireEvent.click(withBox(screen.getByRole('dialog')), {
            clientX: 110,
            clientY: 110,
        });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('ignores scrim clicks for an alertdialog', () => {
        const { onClose } = setup({ role: 'alertdialog' });
        fireEvent.click(withBox(screen.getByRole('alertdialog')), {
            clientX: 50,
            clientY: 50,
        });
        expect(onClose).not.toHaveBeenCalled();
    });

    it('focuses the [data-autofocus] element on open', () => {
        render(
            <Modal open onClose={() => {}} title="Delete?">
                <button type="button" data-autofocus>
                    Keep it
                </button>
            </Modal>,
        );
        expect(screen.getByRole('button', { name: 'Keep it' })).toHaveFocus();
    });

    it('renders the icon, actions, size and alignment', () => {
        setup({
            icon: <svg data-testid="icon" />,
            status: 'error',
            actions: <button type="button">Delete</button>,
            size: 'sm',
            align: 'center',
        });
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass(
            'tintora-modal--sm',
            'tintora-modal--center',
        );
        expect(screen.getByTestId('icon').parentElement).toHaveClass(
            'tintora-modal__icon--error',
        );
        expect(
            screen.getByRole('button', { name: 'Delete' }).parentElement,
        ).toHaveClass('tintora-modal__actions');
    });

    it('has no a11y violations', async () => {
        const { baseElement } = setup({
            description: 'Pick a number',
            actions: <button type="button">Save</button>,
        });
        await expectNoA11yViolations(baseElement);
    });
});
