import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 900, table: true },
  { name: 'laptop', width: 1280, height: 720, table: true },
  { name: 'tablet', width: 768, height: 1024, table: true },
  { name: 'phone', width: 390, height: 844, table: false },
] as const;

for (const viewport of viewports) {
  test(`${viewport.name} layout has no horizontal overflow and keeps the hand in view`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Start game' }).click();
    await expect(page.locator('[data-hand-card]')).toHaveCount(5);
    await page.waitForTimeout(800);

    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tables: document.querySelectorAll('[data-ui~="game-table"]').length,
    }));
    expect(metrics.overflow).toBe(0);
    expect(metrics.tables).toBe(viewport.table ? 1 : 0);

    const card = await page.locator('[data-hand-card]').first().boundingBox();
    const play = await page.getByRole('button', { name: 'Play card' }).boundingBox();
    expect((card?.y ?? Infinity) + (card?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
    expect((play?.y ?? Infinity) + (play?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  });

  if (viewport.table) {
    test(`${viewport.name} table fits full-size plays in front of every seat`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.getByRole('button', { name: 'Start game' }).click();
      await expect(page.locator('[data-ui~="game-table-play"] [data-played="true"]')).not.toHaveCount(0, { timeout: 8_000 });
      await page.waitForTimeout(800);

      await expect(page.locator('[data-ui~="game-table"]')).toHaveAttribute('data-layout-fit', 'fitted');
      const overlaps = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('[data-ui~="game-table-seat"] > *, [data-ui~="game-table-play"] [data-ui~="game-card"]')]
          .map((element) => element.getBoundingClientRect())
          .filter((box) => box.width > 0);
        let count = 0;
        for (const [index, a] of boxes.entries()) for (const b of boxes.slice(index + 1)) {
          if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) count += 1;
        }
        return count;
      });
      expect(overlaps).toBe(0);
    });
  }
}
