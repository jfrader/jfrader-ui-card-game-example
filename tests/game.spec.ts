import { test, expect } from '@playwright/test';

test('ready screen exposes one page heading and starts a match', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Fivefold' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Start game' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'How to play' })).toBeVisible();

  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.locator('[data-hand-card]')).toHaveCount(5);
  await expect(
    page.getByRole('button', { name: /of (hearts|diamonds|clubs|spades)$/ }),
  ).toHaveCount(5);
});

test('a human can select and play a legal card through a completed trick', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start game' }).click();

  const legal = page.locator('[data-hand-card]:not([aria-disabled="true"])').first();
  await expect(legal).toBeVisible({ timeout: 8_000 });
  await legal.click();
  await expect(page.getByRole('button', { name: 'Play card' })).toBeEnabled();
  await page.getByRole('button', { name: 'Play card' }).click();

  await expect(page.getByText(/takes? the trick/).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /Next trick|Round results|Final results/ })).toBeVisible();
});

test('your hand stays at full strength when it is not your turn', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start game' }).click();
  const legal = page.locator('[data-hand-card]:not([aria-disabled="true"])').first();
  await expect(legal).toBeVisible({ timeout: 8_000 });
  await legal.click();
  await page.getByRole('button', { name: 'Play card' }).click();
  await expect(page.getByRole('button', { name: 'Next trick' })).toBeVisible({ timeout: 10_000 });

  const cards = page.locator('[data-hand-card]');
  await expect(cards).toHaveCount(4);
  const states = await cards.evaluateAll((buttons) => buttons.map((button) => ({
    unavailable: button.getAttribute('aria-disabled'),
    opacity: getComputedStyle(button.querySelector('[data-ui~="game-card"]')!).opacity,
    filter: getComputedStyle(button.querySelector('[data-ui~="game-card"]')!).filter,
  })));
  expect(states).toEqual(Array.from({ length: 4 }, () => ({ unavailable: 'true', opacity: '1', filter: 'none' })));
});

test('a full match reaches the result dialog and records local stats', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start game' }).click();

  for (let step = 0; step < 260; step += 1) {
    if (await page.getByText('Match complete', { exact: true }).count()) break;

    const deal = page.getByRole('button', { name: /^Deal round/ });
    if (await deal.count()) {
      await deal.first().click();
      await page.waitForTimeout(150);
      continue;
    }

    const hand = page.locator('[data-hand-card]:not([aria-disabled="true"])');
    if (await hand.count()) {
      await hand.first().click();
      const play = page.getByRole('button', { name: 'Play card' });
      if (await play.isEnabled()) {
        await play.click();
        await page.waitForTimeout(250);
        continue;
      }
    }

    const next = page.getByRole('button', { name: /^(Next trick|Round results|Final results)$/ });
    if (await next.count()) {
      await next.first().click();
      await page.waitForTimeout(150);
      continue;
    }

    await page.waitForTimeout(100);
  }

  await expect(page.getByRole('heading', { name: 'Match complete' })).toBeVisible();
  await expect(
    page.getByRole('dialog').filter({ hasText: 'Match complete' }),
  ).toContainText(/You win|You lose|Draw/);
  await expect(page.getByRole('button', { name: 'Play again' })).toBeVisible();

  const stats = await page.evaluate(() => localStorage.getItem('fivefold.stats.v1'));
  expect(stats).not.toBeNull();
  expect(JSON.parse(stats ?? '{}').gamesPlayed).toBe(1);

  // Resetting during the completed-match screen must not re-count that same game.
  await page.getByRole('button', { name: 'Review scores' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Reset stats' }).click();
  const confirmReset = page.getByRole('dialog', { name: 'Reset stats' });
  await confirmReset.getByRole('button', { name: 'Reset stats' }).click();
  await page.waitForTimeout(500);
  const resetStats = await page.evaluate(() => localStorage.getItem('fivefold.stats.v1'));
  expect(JSON.parse(resetStats ?? '{}').gamesPlayed).toBe(0);
});
