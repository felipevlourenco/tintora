import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

const meta = {
    title: 'Components/Tag',
    component: Tag,
    tags: ['autodocs'],
    args: { children: 'Tag', variant: 'neutral', size: 'medium' },
} satisfies Meta<typeof Tag>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: 12 } as const;

export const Default: Story = {};

export const Variants: Story = {
    render: (args) => (
        <div style={row}>
            <Tag {...args} variant="neutral">
                Fitness
            </Tag>
            <Tag {...args} variant="success">
                Done
            </Tag>
            <Tag {...args} variant="accent">
                New
            </Tag>
        </div>
    ),
};

export const Sizes: Story = {
    render: (args) => (
        <div style={row}>
            <Tag {...args} size="small">
                Small
            </Tag>
            <Tag {...args} size="medium">
                Medium
            </Tag>
            <Tag {...args} size="large">
                Large
            </Tag>
        </div>
    ),
};

/** The `card` variant is made for cards, which are light in both themes. */
export const OnCard: Story = {
    render: (args) => (
        <div
            style={{
                ...row,
                padding: '12px 14px',
                borderRadius: 'var(--tintora-radius-18)',
                background: 'var(--tintora-surface-card)',
            }}
        >
            <Tag {...args} variant="card" size="large">
                Day 1
            </Tag>
        </div>
    ),
};
