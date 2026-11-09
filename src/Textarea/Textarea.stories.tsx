import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
    title: 'Components/Textarea',
    component: Textarea,
    tags: ['autodocs'],
    args: { label: 'Message', placeholder: 'Tell us more' },
    decorators: [
        (Story) => (
            <div style={{ width: 'min(360px, 100%)', display: 'flex' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Textarea>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * `required` adds a `*` after the label. Screen readers hear "required" from
 * the input, not the asterisk, so tell sighted users what it means, e.g.
 * "* Required" above the form.
 */
export const Required: Story = { args: { required: true } };

export const WithHint: Story = { args: { hint: 'Up to 500 characters.' } };

export const WithError: Story = {
    args: { error: 'Write at least 10 characters.', defaultValue: 'Hi' },
};

export const Disabled: Story = { args: { disabled: true } };

export const TallerRows: Story = { args: { rows: 8 } };
