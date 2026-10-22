import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900, rail: true },
  { name: 'laptop', width: 1280, height: 720, rail: true },
  { name: 'tablet', width: 768, height: 1024, rail: false },
  { name: 'phone', width: 390, height: 844, rail: false },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name} frame fits the viewport without document scroll`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Start game' }).click();
    await expect(page.locator('[data-hand-card]')).toHaveCount(5);
    await page.waitForTimeout(600);

    const metrics = await page.evaluate(() => {
      const doc = document.scrollingElement as HTMLElement;
      const aside = document.querySelector('aside');
      const footer = document.querySelector('footer');
      const footerBox = footer?.getBoundingClientRect();
      const railBox = aside?.getBoundingClientRect();
      return {
        document: { client: doc.clientHeight, scroll: doc.scrollHeight },
        footerVisible: footer !== null && footer.getBoundingClientRect().height > 0,
        footerInRail:
          footerBox !== undefined &&
          railBox !== undefined &&
          footerBox.left >= railBox.left &&
          footerBox.right <= railBox.right &&
          footerBox.top >= railBox.top &&
          footerBox.bottom <= railBox.bottom,
        footers: document.querySelectorAll('footer').length,
      };
    });

    expect(metrics.document.scroll).toBeLessThanOrEqual(metrics.document.client);
    expect(metrics.footerVisible).toBe(true);
    expect(metrics.footers).toBe(1);
    expect(metrics.footerInRail).toBe(viewport.rail);
  });
}

test('the rules page scrolls inside main, never the document', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/rules');
  await expect(page.getByRole('heading', { name: /how to play/i })).toBeVisible();
  await page.waitForTimeout(400);
  const metrics = await page.evaluate(() => {
    const doc = document.scrollingElement as HTMLElement;
    const main = document.getElementById('main') as HTMLElement;
    return {
      document: { client: doc.clientHeight, scroll: doc.scrollHeight },
      main: { client: main.clientHeight, scroll: main.scrollHeight },
    };
  });
  expect(metrics.document.scroll).toBeLessThanOrEqual(metrics.document.client);
  expect(metrics.main.scroll).toBeGreaterThan(metrics.main.client);
});
