import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Link } from '../Link/Link';
import { Tag } from '../Tag/Tag';
import { MediaCard } from './MediaCard';

const Lamp = () => (
    <svg
        viewBox="0 0 200 160"
        role="img"
        aria-label="Desk lamp"
        style={{ width: '100%', height: '100%', display: 'block' }}
    >
        <rect width="200" height="160" fill="#eeeceb" />
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

const Heart = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
    >
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />
    </svg>
);

const Plus = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const meta = {
    title: 'Components/MediaCard',
    component: MediaCard,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: 280 }}>
                <Story />
            </div>
        ),
    ],
    args: {
        media: <Lamp />,
        badge: <Tag variant="accent">New</Tag>,
        action: (
            <IconButton
                aria-label="Add to favourites"
                icon={<Heart />}
                variant="round"
            />
        ),
        eyebrow: 'Lighting',
        title: (
            <Link href="#alder" variant="transparent">
                Alder desk lamp
            </Link>
        ),
        meta: '★ 4.8 (212)',
        footer: (
            <>
                <span>
                    <strong>$54.00</strong> <s>$62.00</s>
                </span>
                <Button variant="secondary" size="small" leadingIcon={<Plus />}>
                    Add
                </Button>
            </>
        ),
    },
} satisfies Meta<typeof MediaCard>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The shop item: every slot filled, the title link stretched over the card. */
export const Default: Story = {};

/** Only the required `media` and `title`. */
export const Minimal: Story = {
    args: {
        badge: undefined,
        action: undefined,
        eyebrow: undefined,
        meta: undefined,
        footer: undefined,
        title: 'Alder desk lamp',
    },
};

export const Square: Story = { args: { mediaAspectRatio: '1 / 1' } };

/** Cards as `li` items of a list, in a responsive grid. */
export const Grid: Story = {
    decorators: [
        (Story) => (
            <div style={{ width: 'min(900px, 100%)' }}>
                <Story />
            </div>
        ),
    ],
    render: (args) => (
        <ul
            style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gap: 16,
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            }}
        >
            {['Alder desk lamp', 'Birch floor lamp', 'Cedar wall light'].map(
                (name) => (
                    <MediaCard
                        key={name}
                        {...args}
                        as="li"
                        title={
                            <Link href={`#${name}`} variant="transparent">
                                {name}
                            </Link>
                        }
                    />
                ),
            )}
        </ul>
    ),
};
