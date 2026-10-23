import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Switch } from '../Switch/Switch';
import { expectNoA11yViolations } from '../test-utils';
import { SettingsRow, type SettingsRowProps } from './SettingsRow';

const setup = (props: Partial<SettingsRowProps> = {}) =>
    render(
        <SettingsRow title="Workout reminders" {...props}>
            <Switch aria-label="Workout reminders" />
        </SettingsRow>,
    );

describe('SettingsRow', () => {
    it('renders the title and the control', () => {
        setup();
        expect(screen.getByText('Workout reminders')).toBeInTheDocument();
        expect(
            screen.getByRole('switch', { name: 'Workout reminders' }),
        ).toBeInTheDocument();
    });

    it('renders the description only when given', () => {
        const { container, rerender } = setup();
        expect(
            container.querySelector('.tintora-settings-row__description'),
        ).toBeNull();
        rerender(
            <SettingsRow
                title="Workout reminders"
                description="Daily at 18:00"
            />,
        );
        expect(screen.getByText('Daily at 18:00')).toBeInTheDocument();
    });

    it('marks a row with a description, which is taller', () => {
        const { container, rerender } = setup();
        expect(container.firstElementChild).not.toHaveClass(
            'tintora-settings-row--described',
        );
        rerender(<SettingsRow title="Reminders" description="Daily" />);
        expect(container.firstElementChild).toHaveClass(
            'tintora-settings-row--described',
        );
    });

    it('puts the control at the end by default, and takes a start position', () => {
        const { container, rerender } = setup();
        expect(container.firstElementChild).toHaveClass(
            'tintora-settings-row--control-end',
        );
        rerender(
            <SettingsRow title="Units" controlPosition="start">
                <Switch aria-label="Units" />
            </SettingsRow>,
        );
        expect(container.firstElementChild).toHaveClass(
            'tintora-settings-row--control-start',
        );
    });

    it('merges className and passes other props through', () => {
        setup({ className: 'extra', 'data-testid': 'row' } as never);
        expect(screen.getByTestId('row')).toHaveClass(
            'tintora-settings-row',
            'extra',
        );
    });

    it('leaves the control working', async () => {
        setup();
        const toggle = screen.getByRole('switch');
        await userEvent.click(toggle);
        expect(toggle).toBeChecked();
    });

    it('has no a11y violations', async () => {
        const { container } = setup({ description: 'Daily at 18:00' });
        await expectNoA11yViolations(container);
    });
});
