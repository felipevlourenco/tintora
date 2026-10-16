import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Tag } from '../Tag/Tag';
import { Card, SelectableCard } from './Card';

const meta = {
    title: 'Components/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 320 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof meta>;

const column = { display: 'flex', flexDirection: 'column', gap: 4 } as const;
const title = { fontSize: 14, fontWeight: 700 } as const;
const muted = {
    fontSize: 11,
    lineHeight: 1.45,
    color: 'var(--tintora-card-text-muted)',
} as const;
const disc = {
    flex: '0 0 56px',
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#2b2a2d',
    boxShadow: 'inset 0 0 0 5px #f3efe8',
} as const;

function ContentBody({ name, day }: { name: string; day: string }) {
    return (
        <>
            <div style={{ ...column, minWidth: 0, gap: 6 }}>
                <span style={title}>{name}</span>
                <span style={muted}>High in water content.</span>
                <Tag variant="card" size="large" style={{ alignSelf: 'start' }}>
                    {day}
                </Tag>
            </div>
            <span aria-hidden="true" style={disc} />
        </>
    );
}

/** Stat card: title, a value, and room for a chart in the middle. */
export const Stat: Story = {
    render: () => (
        <Card
            style={{
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 14,
                padding: '16px 18px 18px',
            }}
        >
            <h3 style={{ margin: 0, font: 'var(--tintora-font-label)' }}>
                Calories
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span
                    style={{
                        font: 'var(--tintora-font-stat-value)',
                        color: 'var(--tintora-color-accent-deep)',
                    }}
                >
                    1428
                </span>
                <span style={{ ...muted, fontSize: 11.5 }}>Kcal</span>
            </div>
        </Card>
    ),
};

export const Content: Story = {
    render: () => (
        <Card>
            <ContentBody name="Fruits only" day="Day 1" />
        </Card>
    ),
};

export const Selectable: Story = {
    render: () => {
        const [picked, setPicked] = useState('Day 2');
        return (
            <div style={{ ...column, gap: 16 }}>
                {['Day 1', 'Day 2', 'Day 3'].map((day) => (
                    <SelectableCard
                        key={day}
                        selected={picked === day}
                        onClick={() => setPicked(day)}
                    >
                        <ContentBody name={`Meal plan, ${day}`} day={day} />
                    </SelectableCard>
                ))}
            </div>
        );
    },
};

export const SelectableStates: Story = {
    render: () => (
        <div style={{ ...column, gap: 16 }}>
            <SelectableCard>
                <ContentBody name="Fruits only" day="Day 1" />
            </SelectableCard>
            <SelectableCard selected>
                <ContentBody name="Vegetables only" day="Day 2" />
            </SelectableCard>
            <SelectableCard disabled>
                <ContentBody name="Disabled" day="Day 3" />
            </SelectableCard>
        </div>
    ),
};

/** The "more" button sits outside of any SelectableCard, so a row is a plain Card. */
export const ListRow: Story = {
    render: () => (
        <ul
            style={{
                ...column,
                gap: 12,
                margin: 0,
                padding: 0,
                listStyle: 'none',
            }}
        >
            {[
                { name: 'Cardio Workshop', note: 'Strengthens your muscles' },
                { name: 'Strength Basics', note: 'Builds core stability' },
            ].map(({ name, note }) => (
                <Card as="li" variant="row" key={name}>
                    <Avatar name={name} size="large" />
                    <div style={{ ...column, flex: 1, minWidth: 0, gap: 3 }}>
                        <Tag size="small" style={{ alignSelf: 'start' }}>
                            Fitness
                        </Tag>
                        <h3
                            style={{
                                margin: 0,
                                font: 'var(--tintora-font-label)',
                            }}
                        >
                            {name}
                        </h3>
                        <p
                            style={{
                                margin: 0,
                                font: 'var(--tintora-font-caption)',
                                color: 'var(--tintora-card-text-muted)',
                            }}
                        >
                            {note}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label={`More options for ${name}`}
                    >
                        •••
                    </button>
                </Card>
            ))}
        </ul>
    ),
};
