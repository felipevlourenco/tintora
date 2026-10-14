import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

// Inline image so the story needs no network.
const photo = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f97316"/><circle cx="32" cy="25" r="11" fill="#fff"/><path d="M10 64c2-16 12-24 22-24s20 8 22 24z" fill="#fff"/></svg>',
)}`;

const meta = {
    title: 'Components/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    args: { name: 'Felipe Lourenco', size: 'medium' },
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: 12 } as const;

export const Default: Story = {};

export const WithImage: Story = { args: { src: photo } };

export const Sizes: Story = {
    render: (args) => (
        <div style={row}>
            <Avatar {...args} size="small" />
            <Avatar {...args} size="medium" />
            <Avatar {...args} size="large" />
        </div>
    ),
};

export const ImageSizes: Story = {
    render: (args) => (
        <div style={row}>
            <Avatar {...args} src={photo} size="small" />
            <Avatar {...args} src={photo} size="medium" />
            <Avatar {...args} src={photo} size="large" />
        </div>
    ),
};

/** Initials come from the first and last word of `name`. */
export const Initials: Story = {
    render: (args) => (
        <div style={row}>
            <Avatar {...args} name="Felipe" />
            <Avatar {...args} name="Felipe Lourenco" />
            <Avatar {...args} name="Ana Maria da Silva" />
            <Avatar {...args} name="élodie àlvarez" />
            <Avatar {...args} name="山田 太郎" />
        </div>
    ),
};
