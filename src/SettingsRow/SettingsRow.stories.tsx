import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Radio } from '../Radio/Radio';
import { RadioGroup } from '../Radio/RadioGroup';
import { Switch } from '../Switch/Switch';
import { SettingsRow } from './SettingsRow';

const meta = {
    title: 'Components/SettingsRow',
    component: SettingsRow,
    tags: ['autodocs'],
    args: { title: 'Workout reminders' },
    argTypes: { children: { table: { disable: true } } },
    decorators: [
        (Story) => (
            <div style={{ width: 420 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof SettingsRow>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Title, a line of detail and a switch on the right. */
export const WithSwitch: Story = {
    args: { description: 'Daily at 18:00' },
    render: (args) => (
        <SettingsRow {...args}>
            <Switch aria-label="Workout reminders" defaultChecked />
        </SettingsRow>
    ),
};

/** The title alone, with the options right after it. */
export const WithRadioGroup: Story = {
    args: { title: 'Units', controlPosition: 'start' },
    render: (args) => (
        <SettingsRow {...args}>
            <RadioGroup
                aria-label="Units"
                defaultValue="metric"
                style={{ display: 'flex', gap: 22 }}
            >
                {[
                    ['metric', 'Metric'],
                    ['imperial', 'Imperial'],
                ].map(([value, label]) => (
                    <label
                        key={value}
                        style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                        }}
                    >
                        <Radio value={value} aria-label={label} />
                        {label}
                    </label>
                ))}
            </RadioGroup>
        </SettingsRow>
    ),
};

function StackDemo() {
    const [reminders, setReminders] = useState(true);
    const [sync, setSync] = useState(false);
    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <SettingsRow
                title="Workout reminders"
                description={reminders ? 'Daily at 18:00' : 'Off'}
            >
                <Switch
                    aria-label="Workout reminders"
                    checked={reminders}
                    onCheckedChange={setReminders}
                />
            </SettingsRow>
            <SettingsRow title="Background sync" description="Wi-Fi only">
                <Switch
                    aria-label="Background sync"
                    checked={sync}
                    onCheckedChange={setSync}
                />
            </SettingsRow>
        </div>
    );
}

/** Rows stacked with an 8px gap, as in the design. */
export const Stacked: Story = { render: () => <StackDemo /> };

/** A long title wraps and the control keeps its size. */
export const LongTitle: Story = {
    args: {
        title: 'Send me a reminder for every workout I have scheduled this week',
        description: 'Daily at 18:00',
    },
    render: (args) => (
        <SettingsRow {...args}>
            <Switch aria-label="Reminders" />
        </SettingsRow>
    ),
};
