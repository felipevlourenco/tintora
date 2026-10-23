import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
    BottomSheet,
    BottomSheetOption,
    type BottomSheetProps,
} from './BottomSheet';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<BottomSheetProps> = {}) => {
    const onClose = vi.fn();
    const view = render(
        <BottomSheet open onClose={onClose} title="Sort workouts" {...props}>
            <BottomSheetOption selected>Newest first</BottomSheetOption>
            <BottomSheetOption>Most calories</BottomSheetOption>
        </BottomSheet>,
    );
    return { onClose, ...view };
};

describe('BottomSheet', () => {
    it('renders a dialog named by its title, sliding up from the bottom', () => {
        setup();
        const dialog = screen.getByRole('dialog', { name: 'Sort workouts' });
        expect(dialog).toHaveClass(
            'tintora-bottom-sheet',
            'tintora-drawer--from-bottom',
        );
        expect(screen.getByText('Sort workouts')).toBeInTheDocument();
    });

    it('is hidden while closed', () => {
        setup({ open: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('hides the grabber from assistive tech', () => {
        const { container } = setup();
        expect(
            container.querySelector('.tintora-bottom-sheet__grabber'),
        ).toHaveAttribute('aria-hidden', 'true');
    });

    it('asks to close on Esc and on a scrim click', () => {
        const { onClose } = setup();
        const dialog = screen.getByRole('dialog');
        fireEvent(
            dialog,
            new Event('cancel', { bubbles: false, cancelable: true }),
        );
        expect(onClose).toHaveBeenCalledTimes(1);

        // jsdom has no layout: give the dialog a box to click outside of.
        dialog.getBoundingClientRect = () =>
            ({ left: 0, right: 400, top: 300, bottom: 600 }) as DOMRect;
        fireEvent.click(dialog, { clientX: 200, clientY: 100 });
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('merges className', () => {
        setup({ className: 'extra' });
        expect(screen.getByRole('dialog')).toHaveClass(
            'tintora-bottom-sheet',
            'extra',
        );
    });

    it('has no a11y violations', async () => {
        const { container } = setup();
        await expectNoA11yViolations(container);
    });
});

describe('BottomSheetOption', () => {
    it('reports its selection with aria-pressed', () => {
        setup();
        expect(
            screen.getByRole('button', { name: 'Newest first' }),
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByRole('button', { name: 'Most calories' }),
        ).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onClick', () => {
        const onClick = vi.fn();
        render(<BottomSheetOption onClick={onClick}>Pick</BottomSheetOption>);
        fireEvent.click(screen.getByRole('button', { name: 'Pick' }));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('is a plain button, so it does not submit a parent form', () => {
        render(<BottomSheetOption>Pick</BottomSheetOption>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
});
