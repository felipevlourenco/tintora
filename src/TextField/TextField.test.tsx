import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { TextField, type TextFieldProps } from './TextField';

const setup = (props: Partial<TextFieldProps> = {}) =>
    render(<TextField label="Full name" {...props} />);

describe('TextField', () => {
    it('labels the input with its visible label', () => {
        setup();
        expect(screen.getByLabelText('Full name')).toBeInstanceOf(
            HTMLInputElement,
        );
    });

    it('gives every field its own id, so labels never cross-link', () => {
        render(
            <>
                <TextField label="First name" />
                <TextField label="Last name" />
            </>,
        );
        const first = screen.getByLabelText('First name');
        const last = screen.getByLabelText('Last name');
        expect(first.id).not.toBe(last.id);
    });

    it('uses a consumer id when given', () => {
        setup({ id: 'name' });
        expect(screen.getByLabelText('Full name')).toHaveAttribute(
            'id',
            'name',
        );
    });

    it('describes the input with the hint', () => {
        setup({ hint: 'As shown on your profile' });
        expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription(
            'As shown on your profile',
        );
    });

    it('shows the error instead of the hint and marks the input invalid', () => {
        setup({ hint: 'A hint', error: 'Use at least 2 characters' });
        const input = screen.getByLabelText('Full name');
        expect(input).toBeInvalid();
        expect(input).toHaveAccessibleDescription('Use at least 2 characters');
        expect(screen.queryByText('A hint')).not.toBeInTheDocument();
        expect(screen.getByText('Use at least 2 characters')).toHaveClass(
            'tintora-textfield__hint--error',
        );
    });

    it('is valid when there is no error', () => {
        setup({ hint: 'A hint' });
        expect(screen.getByLabelText('Full name')).toBeValid();
    });

    it('keeps a consumer aria-describedby alongside the hint', () => {
        setup({ hint: 'A hint', 'aria-describedby': 'extra' });
        const describedBy = screen
            .getByLabelText('Full name')
            .getAttribute('aria-describedby');
        expect(describedBy?.split(' ')).toHaveLength(2);
        expect(describedBy).toContain('extra');
    });

    it('has no description when there is no hint or error', () => {
        setup();
        expect(screen.getByLabelText('Full name')).not.toHaveAttribute(
            'aria-describedby',
        );
    });

    it('accepts native input props and lets the user type', async () => {
        const onChange = vi.fn();
        setup({ type: 'email', placeholder: 'you@example.com', onChange });
        const input = screen.getByLabelText('Full name');
        expect(input).toHaveAttribute('type', 'email');
        expect(input).toHaveAttribute('placeholder', 'you@example.com');
        await userEvent.type(input, 'ab');
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(input).toHaveValue('ab');
    });

    it('puts className on the wrapper, not the input', () => {
        const { container } = setup({ className: 'custom' });
        expect(container.firstElementChild).toHaveClass(
            'tintora-textfield',
            'custom',
        );
        expect(screen.getByLabelText('Full name')).not.toHaveClass('custom');
    });

    it('disables the input and dims the whole field', () => {
        const { container } = setup({ disabled: true });
        expect(screen.getByLabelText('Full name')).toBeDisabled();
        expect(container.firstElementChild).toHaveClass(
            'tintora-textfield--disabled',
        );
    });

    describe('accessibility (axe)', () => {
        it.each([
            { name: 'default', props: {} },
            { name: 'with hint', props: { hint: 'A hint' } },
            { name: 'with error', props: { error: 'Required' } },
            { name: 'disabled', props: { disabled: true } },
            { name: 'with placeholder', props: { placeholder: 'Name' } },
        ])('has no violations: $name', async ({ props }) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });

    it('requires a label', () => {
        // @ts-expect-error a text field is always labeled
        const props: TextFieldProps = {};
        expect(props).toBeDefined();
    });
});
