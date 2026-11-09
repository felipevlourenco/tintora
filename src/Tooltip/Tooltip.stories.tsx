import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonHTMLAttributes } from 'react';
import { Tooltip } from './Tooltip';

// Passes aria-describedby (and any other prop) on to the button, as a trigger must.
const Trigger = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        type="button"
        style={{
            width: 96,
            height: 36,
            padding: 0,
            border: '1px solid transparent',
            borderRadius: 'var(--tintora-radius-pill)',
            font: 'var(--tintora-font-label)',
            color: 'var(--tintora-text)',
            background: 'var(--tintora-fill-subtle)',
            // After the defaults, so a story can size or place its trigger.
            ...props.style,
        }}
    >
        {props.children ?? 'Hover me'}
    </button>
);

const meta = {
    title: 'Components/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    args: { content: 'Heart rate', children: <Trigger /> },
} satisfies Meta<typeof Tooltip>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A dashed 260×120 zone, as in the design, with room on every side. */
const Zone = ({
    children,
    width = 260,
    height = 120,
}: {
    children: React.ReactNode;
    width?: number;
    height?: number;
}) => (
    <div
        style={{
            display: 'grid',
            placeItems: 'center',
            width,
            height,
            boxSizing: 'border-box',
            border: '1px dashed var(--tintora-line-strong)',
            borderRadius: 'var(--tintora-radius-16)',
        }}
    >
        {children}
    </div>
);

export const Default: Story = {
    render: (args) => (
        <Zone>
            <Tooltip {...args} />
        </Zone>
    ),
};

export const Placements: Story = {
    render: (args) => (
        <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
            {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
                <Zone key={placement}>
                    <Tooltip {...args} placement={placement} />
                </Zone>
            ))}
        </div>
    ),
};

export const WithShortcut: Story = {
    args: { content: 'Search', shortcut: 'Ctrl K', placement: 'bottom' },
    render: Default.render,
};

export const Rich: Story = {
    args: {
        title: 'Heart rate zone',
        content: 'Average over your last 7 workouts.',
        placement: 'right',
    },
    render: Default.render,
};

/**
 * Opens every tooltip on the page, as hovering would: a focusin, not .focus(),
 * so it works without window focus. It waits for the fonts first: an open
 * tooltip is not placed again when a late font changes its width.
 */
const openAll = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await document.fonts.ready;
    canvasElement
        .querySelectorAll('button')
        .forEach((button) =>
            button.dispatchEvent(new FocusEvent('focusin', { bubbles: true })),
        );
};

/**
 * Where along the trigger's edge the tooltip sits. `top-start` lines up with
 * the trigger's left edge, `top-end` with its right; beside the trigger,
 * `-start` is the top edge and `-end` the bottom. The arrow still points at
 * the trigger. All eight are open here.
 */
export const Alignments: Story = {
    parameters: {
        docs: { story: { inline: false, height: '600px' } },
    },
    play: openAll,
    render: (args) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 300px)',
                gap: 24,
            }}
        >
            {(
                ['top-start', 'top-end', 'bottom-start', 'bottom-end'] as const
            ).map((placement) => (
                <Zone key={placement} width={300} height={120}>
                    <Tooltip {...args} placement={placement}>
                        <Trigger style={{ width: 200 }}>{placement}</Trigger>
                    </Tooltip>
                </Zone>
            ))}
            {(
                ['left-start', 'left-end', 'right-start', 'right-end'] as const
            ).map((placement) => (
                <Zone key={placement} width={300} height={120}>
                    <Tooltip {...args} placement={placement}>
                        <Trigger style={{ height: 96 }}>{placement}</Trigger>
                    </Tooltip>
                </Zone>
            ))}
        </div>
    ),
};

/**
 * `tone` fixes the tooltip's own colour. Switch the Storybook theme: only
 * "Auto" follows it (a tooltip is dark on a light page and light on a dark
 * one), "Light" and "Dark" stay as they are. For a tooltip over a surface that
 * does not follow the page theme, such as a photo or a card.
 */
export const Tones: Story = {
    parameters: { docs: { story: { inline: false, height: '200px' } } },
    play: openAll,
    render: (args) => (
        <div style={{ display: 'flex', gap: 16 }}>
            {(['auto', 'light', 'dark'] as const).map((tone) => (
                <Zone key={tone}>
                    <Tooltip
                        {...args}
                        tone={tone}
                        content={tone[0].toUpperCase() + tone.slice(1)}
                    />
                </Zone>
            ))}
        </div>
    ),
};

const Info = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
    </svg>
);

/** A decorative icon before the text. It is hidden from screen readers. */
export const WithIcon: Story = {
    args: {
        content: 'Syncs every 15 minutes',
        icon: <Info />,
        placement: 'bottom',
    },
    parameters: { docs: { story: { inline: false, height: '200px' } } },
    play: openAll,
    render: Default.render,
};

/** In the rich variant the icon sits beside the whole stack. */
export const RichWithIcon: Story = {
    args: {
        icon: <Info />,
        title: 'Heart rate zone',
        content: 'Average over your last 7 workouts.',
        shortcut: 'Ctrl H',
        placement: 'right',
    },
    parameters: { docs: { story: { inline: false, height: '240px' } } },
    play: openAll,
    render: Default.render,
};

/** Without an arrow it sits closer to the trigger. */
export const NoArrow: Story = {
    args: { arrow: false, placement: 'bottom' },
    parameters: { docs: { story: { inline: false, height: '200px' } } },
    play: openAll,
    render: Default.render,
};

/**
 * Edge cases. Each story pins a trigger to a viewport edge, asks for the side
 * that does not fit, and opens the tooltip on load.
 * `Flips*` should open on the opposite side; `Clamps*` stay on the requested
 * side but are shifted back inside the screen, with the arrow still on the trigger.
 */
const edgeStory = (
    placement: 'top' | 'bottom' | 'left' | 'right',
    position: React.CSSProperties,
    expected: string,
): Story => ({
    name: expected,
    parameters: {
        layout: 'fullscreen',
        docs: { story: { inline: false, height: '260px' } },
    },
    args: { placement, content: 'Heart rate zone' },
    render: (args) => (
        <div style={{ position: 'fixed', inset: 0 }}>
            <Tooltip
                {...args}
                // The trigger is positioned by the story, not by a wrapper.
            >
                <Trigger style={{ position: 'absolute', ...position }} />
            </Tooltip>
        </div>
    ),
    play: ({ canvasElement }) => {
        // A focusin event, not .focus(): it opens the tooltip even when the
        // browser window itself does not have focus.
        canvasElement
            .querySelector('button')
            ?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    },
});

// Not enough room on the requested side: flips to the opposite one.
export const FlipsTopToBottom = edgeStory(
    'top',
    { top: 8, left: 200 },
    'top, at the top edge: flips to bottom',
);
export const FlipsBottomToTop = edgeStory(
    'bottom',
    { bottom: 8, left: 200 },
    'bottom, at the bottom edge: flips to top',
);
export const FlipsLeftToRight = edgeStory(
    'left',
    { top: 120, left: 8 },
    'left, at the left edge: flips to right',
);
export const FlipsRightToLeft = edgeStory(
    'right',
    { top: 120, right: 8 },
    'right, at the right edge: flips to left',
);

// Enough room on the requested side: must not flip.
export const StaysTop = edgeStory(
    'top',
    { top: 200, left: 200 },
    'top, with room above: stays top',
);

// Cross axis: stays on the requested side, shifted inside the screen.
export const ClampsAtLeftEdge = edgeStory(
    'top',
    { top: 200, left: 0 },
    'top, trigger at the left edge: shifted right, arrow on the trigger',
);
export const ClampsAtRightEdge = edgeStory(
    'bottom',
    { top: 120, right: 0 },
    'bottom, trigger at the right edge: shifted left, arrow on the trigger',
);

/**
 * The tooltip is fixed to the viewport, so it is placed again when the page
 * scrolls. It opens on load: scroll the page and it stays on its trigger, and
 * flips to the other side when the trigger nears the top.
 */
export const FollowsScroll: Story = {
    name: 'Scrolling the page: stays on its trigger',
    parameters: {
        layout: 'fullscreen',
        docs: { story: { inline: false, height: '260px' } },
    },
    args: { placement: 'top', content: 'Heart rate zone' },
    render: (args) => (
        <div style={{ height: '200vh', padding: '40vh 0 0 200px' }}>
            <p
                style={{
                    margin: '0 0 24px',
                    font: 'var(--tintora-font-body)',
                    color: 'var(--tintora-text-muted)',
                }}
            >
                Scroll down: the trigger moves up and the tooltip follows.
            </p>
            <Tooltip {...args}>
                <Trigger />
            </Tooltip>
        </div>
    ),
    play: FlipsTopToBottom.play,
};
