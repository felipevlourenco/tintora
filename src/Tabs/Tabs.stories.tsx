import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tab } from './Tab';
import { Tabs } from './Tabs';

const meta = {
    title: 'Components/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    args: { 'aria-label': 'Range', defaultValue: 'weekly', children: null },
    argTypes: {
        value: { table: { disable: true } },
        children: { table: { disable: true } },
    },
    // Without a render function, Storybook passes no children.
    render: (args) => (
        <Tabs {...args}>
            <Tab value="daily">Daily</Tab>
            <Tab value="weekly">Weekly</Tab>
            <Tab value="yearly">Yearly</Tab>
        </Tabs>
    ),
} satisfies Meta<typeof Tabs>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A pill on a tray, the selected tab filled with the accent. */
export const Segmented: Story = { args: { variant: 'segmented' } };

/** A bar under the selected tab, on the row's own line. */
export const Underline: Story = {
    args: {
        variant: 'underline',
        'aria-label': 'Section',
        defaultValue: 'activity',
    },
    render: (args) => (
        <Tabs {...args}>
            <Tab value="activity">Activity</Tab>
            <Tab value="nutrition">Nutrition</Tab>
            <Tab value="sleep">Sleep</Tab>
        </Tabs>
    ),
};

/** A disabled tab is skipped by the arrow keys and cannot be selected. */
export const WithDisabledTab: Story = {
    render: (args) => (
        <Tabs {...args}>
            <Tab value="daily">Daily</Tab>
            <Tab value="weekly">Weekly</Tab>
            <Tab value="yearly" disabled>
                Yearly
            </Tab>
        </Tabs>
    ),
};

const PANELS = {
    activity: 'Steps, distance and active minutes.',
    nutrition: 'Calories and macros for the day.',
    sleep: 'Last night, in stages.',
} as const;

function ControlledDemo(props: { variant?: 'segmented' | 'underline' }) {
    const [value, setValue] = useState<keyof typeof PANELS>('activity');
    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <Tabs
                {...props}
                style={{ justifySelf: 'start' }}
                aria-label="Section"
                value={value}
                onValueChange={(next) => setValue(next as keyof typeof PANELS)}
            >
                <Tab value="activity">Activity</Tab>
                <Tab value="nutrition">Nutrition</Tab>
                <Tab value="sleep">Sleep</Tab>
            </Tabs>
            <p role="tabpanel">{PANELS[value]}</p>
        </div>
    );
}

/** Controlled: the parent keeps the value and renders the matching panel. */
export const Controlled: Story = {
    render: (args) => <ControlledDemo variant={args.variant} />,
};
