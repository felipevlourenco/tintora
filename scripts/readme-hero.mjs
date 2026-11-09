// Takes the README pictures from the Showcase story: `pnpm readme:hero`, with
// Storybook running (`pnpm storybook`) and Chromium installed. Run it again
// whenever the look of the components changes.
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const theme of ['dark', 'light']) {
    await page.goto(
        `http://localhost:6006/iframe.html?id=foundations-showcase--overview&viewMode=story&globals=theme:${theme}`,
    );
    const board = page.locator('#showcase');
    await board.waitFor();
    await page.evaluate(() => document.fonts.ready);
    await board.screenshot({ path: `docs/assets/hero-${theme}.png` });
}
await browser.close();
