import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const rules = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];
const palettes = ['dark', 'light'] as const;
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
] as const;

async function seriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(rules).analyze();
  return results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
}

for (const colorScheme of palettes) {
  test.describe(`${colorScheme} palette`, () => {
    test.use({ colorScheme });

    for (const viewport of viewports) {
      test(`ready and playing table have no serious accessibility violations on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        expect(await seriousViolations(page)).toEqual([]);

        await page.getByRole('button', { name: 'Start game' }).click();
        await page.waitForTimeout(700);
        expect(await seriousViolations(page)).toEqual([]);
      });
    }

    test('rules and settings overlays are accessible', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('button', { name: 'Game menu' }).click();
      await page.getByRole('menuitem', { name: 'Rules' }).click();
      await page.waitForTimeout(300);
      expect(await seriousViolations(page)).toEqual([]);
      await page.keyboard.press('Escape');

      await page.getByRole('button', { name: 'Game menu' }).click();
      await page.getByRole('menuitem', { name: 'Settings' }).click();
      await page.waitForTimeout(300);
      expect(await seriousViolations(page)).toEqual([]);
    });
  });
}
