import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
    title: 'Components/Spinner',
    component: Spinner,
    tags: ['autodocs'],
    args: { size: 'medium', color: 'accent' },
} satisfies Meta<typeof Spinner>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
    render: (args) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {(['small', 'medium', 'large'] as const).map((size) => (
                <Spinner key={size} {...args} size={size} />
            ))}
        </div>
    ),
};

export const CurrentColor: Story = {
    args: { color: 'current' },
    render: (args) => (
        <div style={{ color: 'var(--tintora-text-muted)' }}>
            <Spinner {...args} />
        </div>
    ),
};
