import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'phone', width: 390, height: 844 },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name} layout has no horizontal overflow and keeps the hand in view`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Start game' }).click();
    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tables: document.querySelectorAll('[data-ui~="game-table"]').length,
      cards: document.querySelectorAll('[data-ui~="game-card"]').length,
    }));

    expect(metrics.overflow).toBe(0);
    expect(metrics.cards).toBeGreaterThanOrEqual(5);
    if (viewport.name === 'phone') expect(metrics.tables).toBe(0);
    else expect(metrics.tables).toBe(1);

    const card = await page.locator('[data-hand-card]').first().boundingBox();
    const play = await page.getByRole('button', { name: 'Play card' }).boundingBox();
    expect(card).not.toBeNull();
    expect(play).not.toBeNull();
    expect((card?.y ?? 0) + (card?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
    expect((play?.y ?? 0) + (play?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  });
}
