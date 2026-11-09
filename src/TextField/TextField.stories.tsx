import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta = {
    title: 'Components/TextField',
    component: TextField,
    tags: ['autodocs'],
    args: { label: 'Full name', hint: 'As shown on your profile' },
} satisfies Meta<typeof TextField>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = { args: { defaultValue: 'Alex Moreno' } };

export const WithPlaceholder: Story = {
    args: { placeholder: 'Your name', hint: undefined },
};

/**
 * `type="date"` is the date picker: the browser draws the calendar, in the
 * user's language, with the keyboard and screen reader support it already has.
 * `min` and `max` limit the choice.
 */
export const DateInput: Story = {
    args: {
        label: 'Delivery date',
        type: 'date',
        hint: 'We deliver on weekdays',
        min: '2026-01-01',
        max: '2026-12-31',
    },
};

export const Error: Story = {
    args: { defaultValue: 'A', error: 'Use at least 2 characters' },
};

export const Disabled: Story = {
    args: { defaultValue: 'Alex Moreno', disabled: true },
};

/** Every state, like the design. Hover and focus are forced. */
export const States: Story = {
    parameters: {
        pseudo: {
            hover: '.is-hover input',
            focusVisible: '.is-focus input',
        },
    },
    render: (args) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 240px)',
                gap: 24,
            }}
        >
            <TextField {...args} defaultValue="Alex Moreno" />
            <TextField
                {...args}
                defaultValue="Alex Moreno"
                className="is-hover"
            />
            <TextField
                {...args}
                defaultValue="Alex Moreno"
                className="is-focus"
            />
            <TextField
                {...args}
                defaultValue="A"
                error="Use at least 2 characters"
            />
            <TextField {...args} defaultValue="Alex Moreno" disabled />
            <TextField {...args} placeholder="Your name" hint={undefined} />
        </div>
    ),
};
