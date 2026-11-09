// Each check guards a layout bug this library has really had, one that passed
// every unit test because jsdom has no layout.
import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Opens a story and waits until it is on screen and still: `load` comes before
 * Storybook draws it, and a late web font moves things a pixel or two, which a
 * popup measured before the swap would not follow.
 */
const open = async (page: Page, id: string, theme?: 'light' | 'dark') => {
    await page.goto(
        `/iframe.html?id=${id}&viewMode=story${theme ? `&globals=theme:${theme}` : ''}`,
    );
    await page.locator('body.sb-show-main').waitFor();
    await page.locator('#storybook-root > *').first().waitFor();
    await page.evaluate(() => document.fonts.ready);
};

const rect = (locator: Locator) =>
    locator.evaluate((el) => {
        const { top, bottom, left, right, width, height } =
            el.getBoundingClientRect();
        return { top, bottom, left, right, width, height };
    });

/**
 * Makes the trigger wider than any popup's own minimum width (Menu's is 180px),
 * so a popup that ignores the trigger's width shows up as narrower than it.
 */
const widen = (locator: Locator) =>
    locator.evaluate((el) => ((el as HTMLElement).style.width = '360px'));

/** Pins an element to the bottom-left corner, so a popup has no room below. */
const pinToBottom = (locator: Locator) =>
    locator.evaluate((el) =>
        Object.assign((el as HTMLElement).style, {
            position: 'fixed',
            left: '16px',
            bottom: '16px',
        }),
    );

test.describe('Rating', () => {
    test('filled stars are as big as the track stars, so they sit on top of them', async ({
        page,
    }) => {
        // A flex item shrinks by default, and the fill is narrower than its stars.
        await open(page, 'components-rating--fractions');
        const widths = await page
            .locator('.tintora-rating__stars')
            .evaluateAll((els) =>
                els.map((el) => {
                    const of = (selector: string) =>
                        [...el.querySelectorAll(selector)].map(
                            (star) =>
                                Math.round(
                                    star.getBoundingClientRect().width * 100,
                                ) / 100,
                        );
                    return {
                        track: of('.tintora-rating__track > svg'),
                        fill: of('.tintora-rating__fill > svg'),
                    };
                }),
            );
        expect(widths.length).toBeGreaterThan(1);
        for (const { track, fill } of widths) expect(fill).toEqual(track);
    });
});

test.describe('Textarea', () => {
    test('fills its container instead of the browser default width', async ({
        page,
    }) => {
        await open(page, 'components-textarea--default');
        const field = page.locator('.tintora-textarea__field');
        const container = page.locator('.tintora-textarea').locator('..');
        const [f, c] = await Promise.all([rect(field), rect(container)]);
        expect(c.width).toBeGreaterThan(200);
        expect(f.width).toBeCloseTo(c.width, 0);
    });
});

test.describe('MediaCard', () => {
    test('cards in a grid share a row instead of collapsing to one column', async ({
        page,
    }) => {
        await open(page, 'components-mediacard--grid');
        const tops = await page
            .locator('.tintora-media-card')
            .evaluateAll((els) =>
                els.map((el) => Math.round(el.getBoundingClientRect().top)),
            );
        expect(tops.length).toBeGreaterThan(1);
        expect(tops.filter((top) => top === tops[0]).length).toBeGreaterThan(1);
    });
});

test.describe('MediaCarousel', () => {
    test('shows thumbnails on a wide screen and hides them on a phone', async ({
        page,
    }) => {
        const thumbnails = page.locator('.tintora-media-carousel__thumbnails');
        await open(page, 'components-mediacarousel--default');
        await expect(thumbnails).toBeVisible();

        await page.setViewportSize({ width: 375, height: 812 });
        await expect(thumbnails).toBeHidden();
        // The stage and its arrows stay.
        await expect(page.getByRole('button', { name: 'Next' })).toBeAttached();
    });
});

test.describe('Stepper', () => {
    const labels = (page: Page) =>
        page.locator('.tintora-stepper__step').evaluateAll((steps) =>
            steps.map((step) => ({
                current: step.getAttribute('aria-current') === 'step',
                width: step
                    .querySelector('.tintora-stepper__label')!
                    .getBoundingClientRect().width,
            })),
        );

    test('shows every label on a wide screen', async ({ page }) => {
        await open(page, 'components-stepper--default');
        for (const { width } of await labels(page)) {
            expect(width).toBeGreaterThan(20);
        }
    });

    test('keeps only the current label on screen on a phone', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await open(page, 'components-stepper--default');
        const steps = await labels(page);
        expect(steps.some((step) => step.current)).toBe(true);
        for (const { current, width } of steps) {
            if (current) expect(width).toBeGreaterThan(20);
            // Clipped, not display:none, so a screen reader still reads it.
            else expect(width).toBeLessThanOrEqual(1);
        }
    });
});

// Menu, Select and Combobox all open a popup under their trigger.
const dropdowns = [
    {
        name: 'Menu',
        story: 'components-menu--default',
        root: '.tintora-menu-root',
        anchor: '[aria-haspopup="menu"]',
        popup: '[role="menu"]',
        open: (page: Page) => page.locator('[aria-haspopup="menu"]').click(),
    },
    {
        name: 'Select',
        story: 'components-select--default',
        root: '.tintora-select',
        anchor: '[role="combobox"]',
        popup: '[role="listbox"]',
        open: (page: Page) => page.locator('[role="combobox"]').click(),
    },
    {
        name: 'Combobox',
        story: 'components-combobox--default',
        root: '.tintora-combobox',
        anchor: 'input[role="combobox"]',
        popup: '[role="listbox"]',
        open: (page: Page) => page.locator('input[role="combobox"]').click(),
    },
];

for (const dropdown of dropdowns) {
    test.describe(`${dropdown.name} popup`, () => {
        test('opens just under its trigger, at least as wide', async ({
            page,
        }) => {
            await open(page, dropdown.story);
            await widen(page.locator(dropdown.anchor));
            await dropdown.open(page);
            const popup = page.locator(dropdown.popup);
            await expect(popup).toBeVisible();
            const [a, p] = await Promise.all([
                rect(page.locator(dropdown.anchor)),
                rect(popup),
            ]);
            expect(p.top).toBeCloseTo(a.bottom + 4, 0);
            expect(p.left).toBeCloseTo(a.left, 0);
            expect(p.width).toBeGreaterThanOrEqual(a.width - 0.5);
        });

        test('opens above its trigger when there is no room below', async ({
            page,
        }) => {
            await open(page, dropdown.story);
            await pinToBottom(page.locator(dropdown.root).first());
            await dropdown.open(page);
            const popup = page.locator(dropdown.popup);
            await expect(popup).toBeVisible();
            const [a, p] = await Promise.all([
                rect(page.locator(dropdown.anchor)),
                rect(popup),
            ]);
            expect(p.bottom).toBeLessThanOrEqual(a.top);
            expect(p.top).toBeGreaterThanOrEqual(0);
        });

        test('follows its trigger when the page reflows while it is open', async ({
            page,
        }) => {
            // A late web font or image pushes the trigger down without a scroll
            // or a window resize, the only things a popup used to listen for.
            await open(page, dropdown.story);
            await dropdown.open(page);
            const popup = page.locator(dropdown.popup);
            await expect(popup).toBeVisible();
            await page
                .locator(dropdown.root)
                .first()
                .evaluate((el) => {
                    const spacer = document.createElement('div');
                    spacer.style.height = '48px';
                    el.parentElement?.insertBefore(spacer, el);
                });
            await expect
                .poll(async () => {
                    const [a, p] = await Promise.all([
                        rect(page.locator(dropdown.anchor)),
                        rect(popup),
                    ]);
                    return p.top - a.bottom;
                })
                .toBeCloseTo(4, 0);
        });
    });
}

test.describe('Menu', () => {
    test('lines up with the end of its trigger when aligned to the end', async ({
        page,
    }) => {
        await open(page, 'components-menu--aligned-to-the-end');
        await widen(page.locator('[aria-haspopup="menu"]'));
        await page.locator('[aria-haspopup="menu"]').click();
        const popup = page.locator('[role="menu"]');
        await expect(popup).toBeVisible();
        const [a, p] = await Promise.all([
            rect(page.locator('[aria-haspopup="menu"]')),
            rect(popup),
        ]);
        expect(p.right).toBeCloseTo(a.right, 0);
    });
});

test.describe('Tooltip', () => {
    // A tooltip is the inverse of its page, so "auto" is dark on a light page.
    const LIGHT = 'rgb(251, 250, 249)';
    const DARK = 'rgb(42, 40, 39)';

    for (const theme of ['dark', 'light'] as const) {
        test(`a fixed tone keeps its colour on a ${theme} page, and auto follows the page`, async ({
            page,
        }) => {
            await open(page, 'components-tooltip--tones', theme);
            await expect(page.locator('[role="tooltip"]')).toHaveCount(3);
            const background = (name: string) =>
                page
                    .locator('[role="tooltip"]', { hasText: name })
                    .evaluate((el) => getComputedStyle(el).backgroundColor);
            expect(await background('Light')).toBe(LIGHT);
            expect(await background('Dark')).toBe(DARK);
            expect(await background('Auto')).toBe(
                theme === 'dark' ? LIGHT : DARK,
            );
        });
    }

    test('alignment lines the tooltip up with the trigger edge, on the right side', async ({
        page,
    }) => {
        // Tall enough that the screen edge cannot move any of the eight.
        await page.setViewportSize({ width: 1280, height: 900 });
        await open(page, 'components-tooltip--alignments');
        await expect(page.locator('[role="tooltip"]')).toHaveCount(8);
        const near = (a: number, b: number) =>
            expect(Math.abs(a - b)).toBeLessThan(1);

        for (const placement of [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
            'left-start',
            'left-end',
            'right-start',
            'right-end',
        ]) {
            const trigger = page.getByRole('button', { name: placement });
            const tooltip = trigger.locator(
                'xpath=following-sibling::*[@role="tooltip"]',
            );
            const [t, p] = await Promise.all([rect(trigger), rect(tooltip)]);
            const [side, align] = placement.split('-');

            if (side === 'top') expect(p.bottom).toBeLessThanOrEqual(t.top);
            if (side === 'bottom')
                expect(p.top).toBeGreaterThanOrEqual(t.bottom);
            if (side === 'left') expect(p.right).toBeLessThanOrEqual(t.left);
            if (side === 'right')
                expect(p.left).toBeGreaterThanOrEqual(t.right);

            if (side === 'top' || side === 'bottom') {
                near(
                    align === 'start' ? p.left : p.right,
                    align === 'start' ? t.left : t.right,
                );
            } else {
                near(
                    align === 'start' ? p.top : p.bottom,
                    align === 'start' ? t.top : t.bottom,
                );
            }
        }
    });

    test('a rich tooltip puts its icon beside the text, not above it', async ({
        page,
    }) => {
        await open(page, 'components-tooltip--rich-with-icon');
        const tooltip = page.locator('[role="tooltip"]');
        await expect(tooltip).toBeVisible();
        const [icon, title, text] = await Promise.all([
            rect(tooltip.locator('.tintora-tooltip__icon')),
            rect(tooltip.locator('.tintora-tooltip__title')),
            rect(tooltip.locator('.tintora-tooltip__text')),
        ]);
        expect(icon.right).toBeLessThanOrEqual(title.left);
        // Level with the title, and the text lines up under it.
        expect(Math.abs(icon.top - title.top)).toBeLessThan(6);
        expect(Math.abs(text.left - title.left)).toBeLessThan(1);
    });

    test('without an arrow it has none and sits closer to the trigger', async ({
        page,
    }) => {
        await open(page, 'components-tooltip--no-arrow');
        const tooltip = page.locator('[role="tooltip"]');
        await expect(tooltip).toBeVisible();
        const [t, p, arrow] = await Promise.all([
            rect(page.getByRole('button', { name: 'Hover me' })),
            rect(tooltip),
            tooltip.evaluate((el) => getComputedStyle(el, '::before').display),
        ]);
        expect(arrow).toBe('none');
        expect(p.top - t.bottom).toBeCloseTo(6, 0);
    });
});
