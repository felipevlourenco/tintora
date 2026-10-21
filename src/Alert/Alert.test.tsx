import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert, type AlertProps } from './Alert';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<AlertProps> = {}) =>
    render(
        <Alert title="Sync available" {...props}>
            3 workouts ready.
        </Alert>,
    );

describe('Alert', () => {
    describe('content', () => {
        it('renders the title and the body', () => {
            setup();
            expect(screen.getByText('Sync available')).toBeInTheDocument();
            expect(screen.getByText('3 workouts ready.')).toBeInTheDocument();
        });

        it('does not render an empty title or body', () => {
            const { container } = render(<Alert status="info" />);
            expect(
                container.querySelector('.tintora-alert__content__title'),
            ).toBeNull();
            expect(
                container.querySelector('.tintora-alert__content__sub-title'),
            ).toBeNull();
        });

        it('merges a custom className and passes other props through', () => {
            setup({ className: 'extra', 'data-testid': 'alert' } as never);
            const el = screen.getByTestId('alert');
            expect(el).toHaveClass('tintora-alert', 'extra');
        });
    });

    describe('status', () => {
        it.each(['info', 'success', 'warning', 'error'] as const)(
            'applies the %s class and shows an icon',
            (status) => {
                const { container } = setup({ status });
                expect(container.firstElementChild).toHaveClass(
                    `tintora-alert--${status}`,
                );
                expect(container.querySelector('svg')).toHaveAttribute(
                    'aria-hidden',
                    'true',
                );
            },
        );

        it('defaults to info', () => {
            const { container } = setup();
            expect(container.firstElementChild).toHaveClass(
                'tintora-alert--info',
            );
        });

        it('uses a different icon for each status', () => {
            const paths = (
                ['info', 'success', 'warning', 'error'] as const
            ).map((status) => {
                const { container, unmount } = setup({ status });
                const d = container.querySelector('path')?.getAttribute('d');
                unmount();
                return d;
            });
            expect(new Set(paths).size).toBe(4);
        });
    });

    describe('roles', () => {
        it.each(['info', 'success', 'warning'] as const)(
            'announces %s politely as a status',
            (status) => {
                setup({ status });
                expect(screen.getByRole('status')).toBeInTheDocument();
            },
        );

        it('announces an error as an alert', () => {
            setup({ status: 'error' });
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Sync available',
            );
            expect(screen.queryByRole('status')).toBeNull();
        });

        it('keeps the announcement a status, whatever the status', () => {
            setup({ variant: 'announcement', status: 'error' });
            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).toBeNull();
        });
    });

    describe('action', () => {
        it('renders nothing when there is no action', () => {
            setup();
            expect(screen.queryByRole('button', { name: /try/i })).toBeNull();
        });

        it('calls onClick', () => {
            const onClick = vi.fn();
            setup({ action: { label: 'Try again', onClick } });
            fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
            expect(onClick).toHaveBeenCalledOnce();
        });

        it('is a plain button, so it does not submit a parent form', () => {
            setup({ action: { label: 'Try again', onClick: () => {} } });
            expect(
                screen.getByRole('button', { name: 'Try again' }),
            ).toHaveAttribute('type', 'button');
        });

        it('takes the colour of the status', () => {
            setup({
                status: 'warning',
                action: { label: 'Remind me', onClick: () => {} },
            });
            expect(
                screen.getByRole('button', { name: 'Remind me' }),
            ).toHaveClass('tintora-alert__content__action--warning');
        });
    });

    describe('dismiss', () => {
        it('is hidden without onDismiss', () => {
            setup();
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('calls onDismiss from a button named Dismiss', () => {
            const onDismiss = vi.fn();
            setup({ onDismiss });
            fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
            expect(onDismiss).toHaveBeenCalledOnce();
        });

        it('is a plain button, so it does not submit a parent form', () => {
            setup({ onDismiss: () => {} });
            expect(
                screen.getByRole('button', { name: 'Dismiss' }),
            ).toHaveAttribute('type', 'button');
        });
    });

    describe('announcement', () => {
        const announcement: Partial<AlertProps> = {
            variant: 'announcement',
            title: undefined,
            action: { label: 'Reload', onClick: () => {} },
        };

        it('has the announcement class and no status class', () => {
            const { container } = setup(announcement);
            expect(container.firstElementChild).toHaveClass(
                'tintora-alert--announcement',
            );
            expect(container.firstElementChild).not.toHaveClass(
                'tintora-alert--info',
            );
        });

        it('has no icon', () => {
            const { container } = setup(announcement);
            expect(container.querySelector('svg')).toBeNull();
        });

        it('has no dismiss button, even with onDismiss', () => {
            setup({ ...announcement, onDismiss: () => {} });
            expect(
                screen.queryByRole('button', { name: 'Dismiss' }),
            ).toBeNull();
        });

        it('keeps the inline action', () => {
            const onClick = vi.fn();
            setup({ ...announcement, action: { label: 'Reload', onClick } });
            fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
            expect(onClick).toHaveBeenCalledOnce();
        });
    });

    describe('a11y', () => {
        it.each(['alert', 'announcement'] as const)(
            'has no violations as %s',
            async (variant) => {
                const { container } = setup({
                    variant,
                    status: 'warning',
                    action: { label: 'Remind me later', onClick: () => {} },
                    onDismiss: () => {},
                });
                await expectNoA11yViolations(container);
            },
        );
    });
});
