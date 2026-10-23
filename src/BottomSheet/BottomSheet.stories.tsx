import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import {
    BottomSheet,
    BottomSheetOption,
    type BottomSheetProps,
} from './BottomSheet';

const SORT = ['Newest first', 'Most calories', 'Longest duration'];

// The trigger owns `open` and the choice; BottomSheet is controlled.
function Demo({
    options = SORT,
    ...props
}: Partial<BottomSheetProps> & { options?: string[] }) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(options[0]);
    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                Sort
            </Button>
            <BottomSheet
                title="Sort workouts"
                {...props}
                open={open}
                onClose={() => setOpen(false)}
            >
                {options.map((option) => (
                    <BottomSheetOption
                        key={option}
                        selected={option === selected}
                        onClick={() => {
                            setSelected(option);
                            setOpen(false);
                        }}
                    >
                        {option}
                    </BottomSheetOption>
                ))}
            </BottomSheet>
        </>
    );
}

const meta = {
    title: 'Components/BottomSheet',
    component: BottomSheet,
    tags: ['autodocs'],
    args: { open: false, onClose: () => {}, title: 'Sort workouts' },
    // Owned by the story's Demo, or React nodes: a control would do nothing.
    argTypes: {
        open: { table: { disable: true } },
        onClose: { table: { disable: true } },
        children: { table: { disable: true } },
    },
    render: (args) => <Demo {...args} />,
    parameters: { layout: 'centered' },
} satisfies Meta<typeof BottomSheet>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Three choices, the first selected. Picking one closes the sheet. */
export const Default: Story = {};

/** More rows than fit: the sheet stops short of the top and scrolls inside. */
export const ManyOptions: Story = {
    render: (args) => (
        <Demo
            {...args}
            options={Array.from({ length: 20 }, (_, i) => `Option ${i + 1}`)}
        />
    ),
};
