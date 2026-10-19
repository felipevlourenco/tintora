import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const meta = {
    title: 'Components/Radio',
    component: RadioGroup,
    subcomponents: { Radio },
    tags: ['autodocs'],
    args: { 'aria-label': 'Units' },
    render: (args) => (
        <RadioGroup {...args} style={{ display: 'grid', gap: 12 }}>
            {['Metric', 'Imperial', 'Nautical'].map((unit) => (
                <label key={unit} style={{ display: 'flex', gap: 12 }}>
                    <Radio value={unit} aria-label={unit} />
                    {unit}
                </label>
            ))}
        </RadioGroup>
    ),
} satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { defaultValue: 'Imperial' } };

export const Disabled: Story = {
    args: { defaultValue: 'Imperial', disabled: true },
};

export const Controlled: Story = {
    render: (args) => {
        const [value, setValue] = useState<string | null>('Metric');
        return (
            <>
                <RadioGroup
                    aria-label={args['aria-label']}
                    value={value}
                    onValueChange={setValue}
                    style={{ display: 'flex', gap: 16 }}
                >
                    {['Metric', 'Imperial'].map((unit) => (
                        <label key={unit} style={{ display: 'flex', gap: 8 }}>
                            <Radio value={unit} aria-label={unit} />
                            {unit}
                        </label>
                    ))}
                </RadioGroup>
                <p>Selected: {value}</p>
            </>
        );
    },
};
