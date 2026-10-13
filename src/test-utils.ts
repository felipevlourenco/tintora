import { axe } from 'vitest-axe';

/**
 * Fails listing every axe violation (rule, help text and offending HTML).
 * jsdom has no layout or CSS, so colour contrast is not checked here; the
 * Storybook a11y panel covers that in a real browser.
 */
export async function expectNoA11yViolations(container: Element) {
    const { violations } = await axe(container);
    expect(
        violations.map(
            (v) =>
                `${v.id}: ${v.help}\n${v.nodes.map((n) => `  ${n.html}`).join('\n')}`,
        ),
    ).toEqual([]);
}
