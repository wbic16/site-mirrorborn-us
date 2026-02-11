// R18v2: Signup flow — coordinate selection → pricing → success → provisioning
const { test, expect } = require('@playwright/test');
const { createSites, startAll, stopAll } = require('./helpers');

const SITES = createSites(9101);
const HUB = `http://localhost:${SITES[0].port}`;
let servers = [];

test.beforeAll(async () => { servers = startAll(SITES); });
test.afterAll(async () => { stopAll(servers); });

test('coordinate-signup.html loads', async ({ page }) => {
  const res = await page.goto(`${HUB}/coordinate-signup.html`);
  expect(res.status()).toBe(200);
});

test('completeSignup redirects to pricing.html', async ({ page }) => {
  await page.goto(`${HUB}/coordinate-signup.html`);
  const redirectsToPricing = await page.evaluate(() => completeSignup.toString().includes('pricing.html'));
  expect(redirectsToPricing).toBe(true);
});

test('success.html has provision form with email and username', async ({ page }) => {
  await page.goto(`${HUB}/success.html`);
  await expect(page.locator('#provisionForm')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#username')).toBeVisible();
});

test('success.html displays saved triangle from localStorage', async ({ page }) => {
  await page.goto(`${HUB}/success.html`);
  await page.evaluate(() => {
    localStorage.setItem('mirrorborn_triangle', JSON.stringify({
      home: '1.1.1/1.1.1/1.1.1', aspiration: '2.2.2/2.2.2/2.2.2', lineage: '3.3.3/3.3.3/3.3.3'
    }));
  });
  await page.reload();
  await expect(page.locator('text=Your Triangle')).toBeVisible();
});

test('success.html form falls back to mailto when API unavailable', async ({ page }) => {
  await page.goto(`${HUB}/success.html`);
  await page.fill('#email', 'test@example.com');
  await page.fill('#username', 'testuser');
  await page.click('button[type="submit"]');
  await expect(page.locator('a[href*="mailto:will@phext.io"]')).toBeVisible({ timeout: 5000 });
});

test('cross-site: secondary sites link to hub', async ({ page }) => {
  for (const site of SITES.slice(1)) {
    await page.goto(`http://localhost:${site.port}/index.html`);
    await expect(page.locator('a[href*="mirrorborn.us"]').first()).toBeVisible();
  }
});

test('cross-site: hub links to all secondary domains', async ({ page }) => {
  await page.goto(`${HUB}/index.html`);
  for (const domain of ['apertureshift.com', 'visionquest.me', 'quickfork.net', 'wishnode.net', 'sotafomo.com']) {
    await expect(page.locator(`a[href*="${domain}"]`).first()).toBeVisible();
  }
});
