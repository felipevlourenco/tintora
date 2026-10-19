import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
    title: 'Components/Skeleton',
    component: Skeleton,
    tags: ['autodocs'],
    args: { width: 240, height: 14 },
} satisfies Meta<typeof Skeleton>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Circle: Story = { args: { width: 48, height: 48 } };

/** An avatar and two lines, as in a list row that is still loading. */
export const Row: Story = {
    render: () => (
        <div
            aria-busy="true"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderRadius: 'var(--tintora-radius-20)',
                background: 'var(--tintora-surface-row)',
                border: '1px solid var(--tintora-border-row)',
            }}
        >
            <Skeleton width={48} height={48} />
            <div style={{ flex: 1, display: 'grid', gap: 10 }}>
                <Skeleton width="55%" height={14} />
                <Skeleton width="85%" height={12} />
            </div>
        </div>
    ),
};
