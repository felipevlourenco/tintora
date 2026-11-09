import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Alert } from '../Alert/Alert';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import { Rating } from '../Rating/Rating';
import { Slider } from '../Slider/Slider';
import { Switch } from '../Switch/Switch';
import { Tab } from '../Tabs/Tab';
import { Tabs } from '../Tabs/Tabs';
import { Tag } from '../Tag/Tag';
import { TextField } from '../TextField/TextField';

// One screen built from real components. The README picture is a screenshot of
// it (`pnpm readme:hero`), so it also shows how they sit together.
const meta = {
    title: 'Foundations/Showcase',
    parameters: { layout: 'centered' },
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

const column = { display: 'flex', flexDirection: 'column', gap: 16 } as const;
const row = { display: 'flex', alignItems: 'center', gap: 8 } as const;

function Board() {
    const [tab, setTab] = useState('week');
    const [goal, setGoal] = useState(4);
    return (
        <div
            id="showcase"
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                width: 720,
                padding: 24,
            }}
        >
            <div style={column}>
                <Tabs aria-label="Range" value={tab} onValueChange={setTab}>
                    <Tab value="day">Day</Tab>
                    <Tab value="week">Week</Tab>
                    <Tab value="month">Month</Tab>
                </Tabs>
                <TextField label="Search workouts" placeholder="Tempo run" />
                <div style={row}>
                    <Button variant="primary">Start</Button>
                    <Button variant="secondary">Save</Button>
                    <Button variant="outline">Edit</Button>
                    <Button variant="ghost">Skip</Button>
                </div>
                <div style={row}>
                    <Chip selected>Run</Chip>
                    <Chip>Ride</Chip>
                    <Chip>Swim</Chip>
                </div>
                <Alert status="success" title="Plan updated">
                    Your week has 4 sessions.
                </Alert>
            </div>
            <div style={column}>
                <Card>
                    <div style={{ ...column, gap: 12 }}>
                        <div style={row}>
                            <Avatar name="Maya Lopes" />
                            <div style={{ flex: 1 }}>
                                <strong>Maya Lopes</strong>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>
                                    Half marathon plan
                                </div>
                            </div>
                            <Tag variant="accent">Pro</Tag>
                        </div>
                        <Rating value={4.5} />
                    </div>
                </Card>
                <ProgressBar title="Week 6 of 12" progress={50} />
                <div style={{ ...row, justifyContent: 'space-between' }}>
                    <strong>Reminders</strong>
                    <Switch aria-label="Reminders" defaultChecked />
                </div>
                <Slider
                    aria-label="Sessions per week"
                    min={1}
                    max={7}
                    value={goal}
                    onValueChange={setGoal}
                    formatValue={(v) => `${v} / week`}
                />
            </div>
        </div>
    );
}

export const Overview: Story = { render: () => <Board /> };
