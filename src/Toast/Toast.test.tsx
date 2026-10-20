import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast, type ToastProps } from './Toast';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<ToastProps> = {}) => {
    const onDismiss = vi.fn();
    const view = render(
        <Toast onDismiss={onDismiss} {...props}>
            Workout saved
        </Toast>,
    );
    return { onDismiss, ...view };
};

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Toast', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('announces its message politely', () => {
        setup();
        expect(screen.getByRole('status')).toHaveTextContent('Workout saved');
    });

    it('shows a status icon only when there is a status', () => {
        const { container, rerender, onDismiss } = setup();
        // Just the close icon.
        expect(container.querySelectorAll('svg')).toHaveLength(1);
        rerender(
            <Toast onDismiss={onDismiss} status="success">
                Workout saved
            </Toast>,
        );
        expect(container.querySelectorAll('svg')).toHaveLength(2);
    });

    it('calls the action handler', () => {
        const onClick = vi.fn();
        setup({ action: { label: 'Undo', onClick } });
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('has no action button unless asked', () => {
        setup();
        expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('dismisses from the close button', () => {
        const { onDismiss } = setup();
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('buttons do not submit a surrounding form', () => {
        setup({ action: { label: 'Undo', onClick: () => {} } });
        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveAttribute('type', 'button');
        }
    });

    describe('auto-dismiss', () => {
        it('fires after 5s by default, without a timer bar', () => {
            const { onDismiss } = setup();
            advance(4999);
            expect(onDismiss).not.toHaveBeenCalled();
            advance(1);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('uses a custom duration', () => {
            const { onDismiss } = setup({ duration: 1000 });
            advance(1000);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('never fires when duration is 0', () => {
            const { onDismiss } = setup({ duration: 0 });
            advance(60_000);
            expect(onDismiss).not.toHaveBeenCalled();
        });

        it('pauses on hover and resumes with the time that was left', () => {
            const { onDismiss } = setup();
            const toast = screen.getByRole('status');
            advance(2000);
            fireEvent.mouseEnter(toast);
            advance(60_000);
            expect(onDismiss).not.toHaveBeenCalled();
            fireEvent.mouseLeave(toast);
            advance(2999);
            expect(onDismiss).not.toHaveBeenCalled();
            advance(1);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('keeps adding up across several pauses', () => {
            const { onDismiss } = setup();
            const toast = screen.getByRole('status');
            for (let i = 0; i < 4; i++) {
                advance(1000);
                fireEvent.mouseEnter(toast);
                advance(5000);
                fireEvent.mouseLeave(toast);
            }
            expect(onDismiss).not.toHaveBeenCalled();
            advance(1000);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('pauses while focus is inside, even moving between its buttons', () => {
            const { onDismiss } = setup({
                action: { label: 'Undo', onClick: () => {} },
            });
            const undo = screen.getByRole('button', { name: 'Undo' });
            const close = screen.getByRole('button', { name: 'Dismiss' });
            act(() => undo.focus());
            advance(60_000);
            act(() => close.focus());
            advance(60_000);
            expect(onDismiss).not.toHaveBeenCalled();
            act(() => close.blur());
            advance(5000);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('stays paused while hovered even if focus leaves', () => {
            const { onDismiss } = setup();
            const toast = screen.getByRole('status');
            const close = screen.getByRole('button', { name: 'Dismiss' });
            fireEvent.mouseEnter(toast);
            act(() => close.focus());
            act(() => close.blur());
            advance(60_000);
            expect(onDismiss).not.toHaveBeenCalled();
        });

        it('does not restart when the parent passes a new callback', () => {
            const first = vi.fn();
            const second = vi.fn();
            const { rerender } = render(<Toast onDismiss={first}>Hi</Toast>);
            advance(3000);
            rerender(<Toast onDismiss={second}>Hi</Toast>);
            advance(2000);
            expect(first).not.toHaveBeenCalled();
            expect(second).toHaveBeenCalledTimes(1);
        });

        it('restarts from the new duration when it changes', () => {
            const { onDismiss, rerender } = setup({ duration: 1000 });
            advance(500);
            rerender(
                <Toast onDismiss={onDismiss} duration={3000}>
                    Workout saved
                </Toast>,
            );
            advance(2999);
            expect(onDismiss).not.toHaveBeenCalled();
            advance(1);
            expect(onDismiss).toHaveBeenCalledTimes(1);
        });

        it('does not fire after unmount', () => {
            const { onDismiss, unmount } = setup();
            unmount();
            advance(60_000);
            expect(onDismiss).not.toHaveBeenCalled();
        });
    });

    describe('timer bar', () => {
        const bar = (container: HTMLElement) =>
            container.querySelector<HTMLElement>('.tintora-toast__progress');

        it('is hidden unless asked for', () => {
            const { container } = setup();
            expect(bar(container)).not.toBeInTheDocument();
        });

        it('runs for the duration', () => {
            const { container } = setup({ timerBar: true, duration: 2000 });
            expect(
                bar(container)?.style.getPropertyValue(
                    '--tintora-toast-animation-duration',
                ),
            ).toBe('2000ms');
            expect(screen.getByRole('status')).toHaveClass(
                'tintora-toast--timer',
            );
        });

        it('is not drawn when there is no duration', () => {
            const { container } = setup({ timerBar: true, duration: 0 });
            expect(bar(container)).not.toBeInTheDocument();
            expect(screen.getByRole('status')).not.toHaveClass(
                'tintora-toast--timer',
            );
        });

        it('pauses with the timer', () => {
            setup({ timerBar: true });
            const toast = screen.getByRole('status');
            expect(toast).not.toHaveClass('tintora-toast--paused');
            fireEvent.mouseEnter(toast);
            expect(toast).toHaveClass('tintora-toast--paused');
            fireEvent.mouseLeave(toast);
            expect(toast).not.toHaveClass('tintora-toast--paused');
        });
    });

    it('passes other props to the root and keeps its own handlers', () => {
        const onMouseEnter = vi.fn();
        const { onDismiss } = setup({ id: 'saved', onMouseEnter });
        const toast = screen.getByRole('status');
        expect(toast).toHaveAttribute('id', 'saved');
        fireEvent.mouseEnter(toast);
        expect(onMouseEnter).toHaveBeenCalledTimes(1);
        advance(60_000);
        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('has no a11y violations', async () => {
        vi.useRealTimers();
        const { container } = setup({
            status: 'success',
            action: { label: 'Undo', onClick: () => {} },
            timerBar: true,
        });
        await expectNoA11yViolations(container);
    });
});
