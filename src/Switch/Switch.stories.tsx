import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Switch } from './Switch';

const meta = {
    title: 'Components/Switch',
    component: Switch,
    tags: ['autodocs'],
    args: { 'aria-label': 'Wi-Fi' },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const On: Story = { args: { defaultChecked: true } };

export const Disabled: Story = {
    render: ({ 'aria-label': label }) => (
        <div style={{ display: 'flex', gap: 16 }}>
            <Switch aria-label={label} disabled />
            <Switch aria-label={label} disabled defaultChecked />
        </div>
    ),
};

export const Controlled: Story = {
    render: ({ 'aria-label': label }) => {
        const [checked, setChecked] = useState(true);
        return (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Switch
                    aria-label={label}
                    checked={checked}
                    onCheckedChange={setChecked}
                />
                <span>{checked ? 'On' : 'Off'}</span>
            </div>
        );
    },
};
