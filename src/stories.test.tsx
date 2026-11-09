// Renders every story in jsdom, in both themes, and runs axe on it. A story
// that throws (a missing prop, a Server Component crash, a bad import) or
// breaks a rule fails here, in `pnpm test` and CI, before anyone opens
// Storybook. jsdom has no layout or CSS: it cannot see a grid collapsing to one
// column or a low-contrast colour. Those need a browser (see the contrast
// sweep in the PR that added this file).
import {
    composeStories,
    type Meta,
    type StoryObj,
} from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { afterEach, describe, it, expect } from 'vitest';
import { expectNoA11yViolations } from './test-utils';

type StoriesModule = Record<string, unknown> & { default: Meta };

const modules = import.meta.glob<StoriesModule>('./**/*.stories.tsx', {
    eager: true,
});

// Stories with a known violation, with the reason. Keep this list empty.
const SKIP: Record<string, string> = {};

afterEach(() => {
    delete document.documentElement.dataset.theme;
});

for (const [path, module] of Object.entries(modules)) {
    const title = module.default.title ?? path;
    const stories = composeStories(
        module as Parameters<typeof composeStories>[0],
    ) as Record<string, React.ComponentType & { storyName?: string }>;

    describe(`story: ${title}`, () => {
        for (const [name, Story] of Object.entries(stories)) {
            for (const theme of ['dark', 'light']) {
                const run = SKIP[`${title}/${name}`] ? it.skip : it;
                run(
                    `${name} renders in ${theme} and has no axe violations`,
                    async () => {
                        document.documentElement.dataset.theme = theme;
                        const { container } = render(<Story />);
                        expect(container).not.toBeEmptyDOMElement();
                        await expectNoA11yViolations(container);
                    },
                );
            }
        }
    });
}

export type { StoryObj };
