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
