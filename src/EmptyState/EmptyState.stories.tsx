import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { EmptyState } from './EmptyState';

const Cart = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H6" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="17" cy="20" r="1.4" />
    </svg>
);

const meta = {
    title: 'Components/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    args: {
        icon: <Cart />,
        title: 'Your cart is empty',
        description: 'Add something you like and it will show up here.',
        action: <Button variant="primary">Browse the shop</Button>,
    },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
    args: { icon: undefined, description: undefined, action: undefined },
};

export const NoResults: Story = {
    args: {
        title: 'No results for "lamp"',
        description: 'Try a different word, or clear the filters.',
        action: <Button variant="outline">Clear filters</Button>,
    },
};
