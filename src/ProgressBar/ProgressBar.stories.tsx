import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta = {
    title: 'Components/ProgressBar',
    component: ProgressBar,
    tags: ['autodocs'],
    args: { title: 'Weekly ring', progress: 80 },
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomValue: Story = {
    args: { title: 'Daily steps', progress: 40, valueLabel: '4,000 / 10,000' },
};

export const Complete: Story = {
    args: { title: 'Goal complete', progress: 100 },
};

export const Indeterminate: Story = {
    args: { title: 'Syncing', progress: undefined, indeterminate: true },
};

export const WithoutTitle: Story = {
    args: { title: undefined, 'aria-label': 'Upload', progress: 60 },
};
