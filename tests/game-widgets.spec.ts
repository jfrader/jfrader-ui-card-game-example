import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

for (const { width, height } of viewports) {
  test(`game widgets preserve seat, score and trick data at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.getByRole('button', { name: 'Start game' }).click();
    const legal = page.locator('[data-hand-card]:not([aria-disabled="true"])').first();
    await expect(legal).toBeVisible({ timeout: 8_000 });
    await legal.click();
    await page.getByRole('button', { name: 'Play card' }).click();
    await expect(page.getByRole('button', { name: 'Next trick' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('[data-ui~="game-seat"]')).toHaveCount(4);
    await expect(page.locator('[data-ui~="game-seat"][data-state="winner"]')).toHaveCount(1);
    await expect(page.locator('[data-ui~="game-seat-badges"]', { hasText: 'Dealer' })).toHaveCount(1);
    await expect(page.locator('[data-ui~="game-marks-mark"][data-filled="true"]')).toHaveCount(1);
    if (process.env.EVIDENCE_PHASE) {
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `/tmp/opencode/fivefold-2912/${process.env.EVIDENCE_PHASE}-${width}-board.png`, fullPage: true });
    }
    const scores = page.getByRole('button', { name: /Scores/ });
    if (await scores.count()) await scores.first().click();
    await expect(page.getByRole('table', { name: 'Points by round' })).toBeVisible();
    await expect(page.locator('[data-ui~="game-score-table"] tbody tr[data-me="true"]')).toHaveCount(1);
    await expect(page.locator('[data-ui~="game-rounds"]')).toBeVisible();
    const violations = await new AxeBuilder({ page }).analyze();
    expect(violations.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
    expect(await page.getByRole('table', { name: 'Points by round' }).evaluate((table) => {
      const region = table.parentElement!;
      return region.scrollWidth - region.clientWidth;
    })).toBeLessThanOrEqual(0);
    if (process.env.EVIDENCE_PHASE) {
      await page.waitForTimeout(400);
      await page.screenshot({ path: `/tmp/opencode/fivefold-2912/${process.env.EVIDENCE_PHASE}-${width}-scores.png`, fullPage: true });
    }
  });
}

test('seat timer receives finite caller-owned remaining milliseconds', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('switch', { name: 'Turn timer (30s)' }).press('Space');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  const timer = page.locator('[data-ui~="game-seat"][data-turned="true"] [data-turn-remaining]');
  await expect(timer).toHaveCount(1, { timeout: 8_000 });
  const remaining = Number(await timer.getAttribute('data-turn-remaining'));
  expect(remaining).toBeGreaterThan(0);
  expect(Number.isFinite(remaining)).toBe(true);
  await expect.poll(async () => Number(await timer.getAttribute('data-turn-remaining'))).toBeLessThan(remaining);
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(timer).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(timer).toHaveCount(1);
});
