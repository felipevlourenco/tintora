import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tag } from '../Tag/Tag';
import {
    MediaCarousel,
    type MediaCarouselItem,
    type MediaCarouselProps,
} from './MediaCarousel';

// Storybook's types cannot take the controlled/uncontrolled union, so the
// stories are typed on the uncontrolled half; `Controlled` has its own demo.
type StoryProps = Extract<MediaCarouselProps, { value?: never }>;

// One lamp drawn four ways (zoom and offset), so each picture is different.
const views = [
    { id: 'front', label: 'Front view', box: '0 0 200 160' },
    { id: 'close', label: 'Close-up', box: '60 10 90 72' },
    { id: 'base', label: 'Base', box: '40 90 120 96' },
    { id: 'wide', label: 'Wide', box: '-40 -30 280 224' },
];

const Lamp = ({ box, label }: { box: string; label: string }) => (
    <svg
        viewBox={box}
        // A thumbnail sits in a button that is already named: hide it.
        {...(label
            ? { role: 'img', 'aria-label': label }
            : { 'aria-hidden': true })}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
    >
        <rect x="-100" y="-100" width="500" height="400" fill="#eeeceb" />
        <ellipse cx="100" cy="140" rx="30" ry="7" fill="#1d1c1c" />
        <path
            d="M100 138V92l24-26"
            stroke="#1d1c1c"
            strokeWidth="5"
            fill="none"
        />
        <rect
            x="104"
            y="38"
            width="48"
            height="28"
            transform="rotate(28 128 52)"
            fill="#1d1c1c"
        />
    </svg>
);

const items: MediaCarouselItem[] = views.map(({ id, label, box }) => ({
    id,
    label,
    media: <Lamp box={box} label={`Alder desk lamp, ${label.toLowerCase()}`} />,
    thumbnail: <Lamp box={box} label="" />,
}));

const meta = {
    title: 'Components/MediaCarousel',
    component: MediaCarousel,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: 'min(520px, 100%)' }}>
                <Story />
            </div>
        ),
    ],
    args: {
        items,
        badge: <Tag variant="accent">New</Tag>,
    },
} satisfies Meta<StoryProps>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const StartsOnThirdPicture: Story = {
    args: { defaultValue: 'base' },
};

export const SinglePicture: Story = {
    args: { items: [items[0]], badge: undefined },
};

export const Square: Story = { args: { mediaAspectRatio: '1 / 1' } };

function ControlledDemo() {
    const [value, setValue] = useState('close');
    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <MediaCarousel
                items={items}
                value={value}
                onValueChange={setValue}
            />
            <p style={{ margin: 0, font: 'var(--tintora-font-body)' }}>
                Selected: {value}
            </p>
        </div>
    );
}

/** The parent owns the value, so it can show it or change it elsewhere. */
export const Controlled: Story = { render: () => <ControlledDemo /> };
