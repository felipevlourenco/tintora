import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta = {
    title: 'Components/Alert',
    component: Alert,
    tags: ['autodocs'],
    args: {
        onDismiss: () => {},
    },
} satisfies Meta<typeof Alert>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Info icon, title and body. */
export const Info: Story = {
    args: {
        status: 'info',
        title: 'Sync available',
        children: 'Your watch has 3 new workouts ready to import.',
    },
};

/** Success icon, title and body. */
export const Success: Story = {
    args: {
        status: 'success',
        title: 'Goal reached',
        children: 'You hit 10,000 steps today. Nice work.',
    },
};

/** Warning icon, title and body. */
export const Warning: Story = {
    args: {
        status: 'warning',
        title: 'Low battery on tracker',
        children: 'Charge your device to keep recording sleep tonight.',
    },
};

/** Error icon, title and body. Announced with `role="alert"`. */
export const Error: Story = {
    args: {
        status: 'error',
        title: 'Sync failed',
        children:
            'We could not reach your device. Check Bluetooth and try again.',
    },
};

/** One text link under the body. */
export const WithLink: Story = {
    args: {
        status: 'error',
        title: 'Sync failed',
        children:
            'We could not reach your device. Check Bluetooth and try again.',
        action: { label: 'Try again', onClick: () => {} },
    },
};

/** Page-level bar: full width, 44px, accent background, inline link. */
export const Announcement: Story = {
    args: {
        variant: 'announcement',
        children: 'A new version of the app is ready.',
        action: { label: 'Reload', onClick: () => {} },
        onDismiss: undefined,
    },
};
