import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
} satisfies Meta<typeof Button>;
export default meta;

export const Default: StoryObj<typeof meta> = { args: { children: 'Button' } };
export const Disabled: StoryObj<typeof meta> = {
    args: { children: 'Button', disabled: true },
};
