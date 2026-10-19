import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const rules = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

async function audit(page: import('@playwright/test').Page) {
  return new AxeBuilder({ page }).withTags(rules).analyze();
}

test('ready and playing table have no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const ready = await audit(page);
  expect(ready.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);

  await page.getByRole('button', { name: 'Start game' }).click();
  await page.waitForTimeout(700);
  const playing = await audit(page);
  expect(playing.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
});

test('rules and settings overlays are accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Game menu' }).click();
  await page.getByRole('menuitem', { name: 'Rules' }).click();
  await page.waitForTimeout(300);
  const rulesAudit = await audit(page);
  expect(rulesAudit.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Game menu' }).click();
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await page.waitForTimeout(300);
  const settingsAudit = await audit(page);
  expect(settingsAudit.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
});
