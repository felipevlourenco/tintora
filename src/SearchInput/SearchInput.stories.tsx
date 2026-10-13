import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from './SearchInput';

const meta = {
    title: 'Components/SearchInput',
    component: SearchInput,
    tags: ['autodocs'],
    args: { 'aria-label': 'Search', placeholder: 'Search something here...' },
} satisfies Meta<typeof SearchInput>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = { args: { defaultValue: 'cardio' } };

export const Disabled: Story = { args: { disabled: true } };

/** Every state, like the design. Hover and focus are forced. */
export const States: Story = {
    parameters: {
        pseudo: { hover: '.is-hover', focusWithin: '.is-focus' },
    },
    render: (args) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 260px)',
                gap: 24,
            }}
        >
            <SearchInput {...args} aria-label="Empty" />
            <SearchInput {...args} aria-label="Hover" className="is-hover" />
            <SearchInput
                {...args}
                aria-label="Focus"
                className="is-focus"
                defaultValue="cardio"
            />
            <SearchInput {...args} aria-label="Filled" defaultValue="cardio" />
            <SearchInput {...args} aria-label="Disabled" disabled />
        </div>
    ),
};
