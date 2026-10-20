import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from './Toast';

const meta = {
    title: 'Components/Toast',
    component: Toast,
    tags: ['autodocs'],
    args: {
        children: <span>Toast Message</span>,
        onDismiss: () => console.log('Dismissing...'),
    },
} satisfies Meta<typeof Toast>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Success icon, "Workout saved", with an Undo action. */
export const Success: Story = {
    args: {
        status: 'success',
    },
};

/** Error icon, "Could not save changes", with a Retry action. */
export const Error: Story = {
    args: {
        status: 'error',
    },
};

/** Info icon, "Syncing 3 workouts", no action. */
export const Info: Story = {
    args: {
        status: 'info',
    },
};

/** Warning icon, "You are offline. Changes sync later.", no action. */
export const Warning: Story = {
    args: {
        status: 'warning',
    },
};

/** "Workout deleted" with Undo and a 4px bar showing the 5s time left. */
export const WithTimerBar: Story = {
    args: {
        timerBar: true,
    },
};

export const WithAction: Story = {
    args: {
        action: {
            label: 'Retry',
            onClick: () => null,
        },
    },
};
