import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';

const meta = {
    title: 'Components/Toast',
    component: Toast,
    tags: ['autodocs'],
    args: {
        children: 'Workout saved',
        onDismiss: () => {},
    },
} satisfies Meta<typeof Toast>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Success icon, "Workout saved", with an Undo action. */
export const Success: Story = {
    args: {
        status: 'success',
        action: { label: 'Undo', onClick: () => {} },
    },
};

/** Error icon, "Could not save changes", with a Retry action. */
export const Error: Story = {
    args: {
        status: 'error',
        children: 'Could not save changes',
        action: { label: 'Retry', onClick: () => {} },
    },
};

/** Info icon, "Syncing 3 workouts", no action. */
export const Info: Story = {
    args: {
        status: 'info',
        children: 'Syncing 3 workouts',
    },
};

/** Warning icon, "You are offline. Changes sync later.", no action. */
export const Warning: Story = {
    args: {
        status: 'warning',
        children: 'You are offline. Changes sync later.',
    },
};

/** "Workout deleted" with Undo and a 4px bar showing the 5s time left. */
export const WithTimerBar: Story = {
    args: {
        children: 'Workout deleted',
        action: { label: 'Undo', onClick: () => {} },
        timerBar: true,
    },
};

/** No status icon and no timer: the toast stays until dismissed. */
export const Persistent: Story = {
    args: { duration: 0 },
};
