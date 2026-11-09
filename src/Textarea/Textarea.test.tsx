import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Textarea, type TextareaProps } from './Textarea';

const setup = (props: Partial<TextareaProps> = {}) =>
    render(<Textarea label="Message" {...props} />);
const field = () => screen.getByRole('textbox', { name: 'Message' });

describe('Textarea', () => {
    it('is a textarea named by its label', () => {
        setup();
        expect(field().tagName).toBe('TEXTAREA');
    });

    it('shows four rows by default, and takes rows', () => {
        const { unmount } = setup();
        expect(field()).toHaveAttribute('rows', '4');
        unmount();
        setup({ rows: 8 });
        expect(field()).toHaveAttribute('rows', '8');
    });

    it('uses the TextField classes, so the two look alike', () => {
        const { container } = setup();
        expect(container.firstChild).toHaveClass(
            'tintora-textfield',
            'tintora-textarea',
        );
        expect(field()).toHaveClass(
            'tintora-textfield__input',
            'tintora-textarea__field',
        );
    });

    it('keeps the consumer className on the wrapper', () => {
        const { container } = setup({ className: 'custom' });
        expect(container.firstChild).toHaveClass('tintora-textarea', 'custom');
    });

    it('uses the id it is given for the label', () => {
        setup({ id: 'msg' });
        expect(field()).toHaveAttribute('id', 'msg');
        expect(screen.getByText('Message')).toHaveAttribute('for', 'msg');
    });

    it('describes itself with the hint', () => {
        setup({ hint: 'Up to 500 characters.' });
        const hint = screen.getByText('Up to 500 characters.');
        expect(field()).toHaveAccessibleDescription('Up to 500 characters.');
        expect(hint).not.toHaveClass('tintora-textfield__hint--error');
    });

    it('shows the error instead of the hint and marks the field invalid', () => {
        setup({ hint: 'A hint', error: 'Write at least 10 characters.' });
        expect(screen.queryByText('A hint')).toBeNull();
        expect(field()).toHaveAttribute('aria-invalid', 'true');
        expect(field()).toHaveAccessibleDescription(
            'Write at least 10 characters.',
        );
        expect(screen.getByText('Write at least 10 characters.')).toHaveClass(
            'tintora-textfield__hint--error',
        );
    });

    it('keeps a described-by the consumer passes', () => {
        render(
            <>
                <p id="extra">Extra</p>
                <Textarea
                    label="Message"
                    hint="Hint"
                    aria-describedby="extra"
                />
            </>,
        );
        expect(field()).toHaveAccessibleDescription(/Hint.*Extra|Extra.*Hint/);
    });

    it('takes typing and reports changes', async () => {
        const onChange = vi.fn();
        setup({ onChange });
        await userEvent.type(field(), 'Hi');
        expect(field()).toHaveValue('Hi');
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('disables the field and dims the wrapper', () => {
        const { container } = setup({ disabled: true });
        expect(field()).toBeDisabled();
        expect(container.firstChild).toHaveClass('tintora-textfield--disabled');
    });

    it('passes other attributes through', () => {
        setup({ name: 'message', maxLength: 500, placeholder: 'Say hi' });
        expect(field()).toHaveAttribute('name', 'message');
        expect(field()).toHaveAttribute('maxlength', '500');
        expect(field()).toHaveAttribute('placeholder', 'Say hi');
    });

    it('has no accessibility violations', async () => {
        const { container } = setup({ hint: 'Hint' });
        await expectNoA11yViolations(container);
    });

    it('has no accessibility violations with an error', async () => {
        const { container } = setup({ error: 'Required' });
        await expectNoA11yViolations(container);
    });
});
