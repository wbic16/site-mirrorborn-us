// R18v2: Payment link reachability across all 7 sites
const { test, expect } = require('@playwright/test');
const { STRIPE_LINKS, createSites, startAll, stopAll } = require('./helpers');

const SITES = createSites(9001);
const HUB = `http://localhost:${SITES[0].port}`;
let servers = [];

test.beforeAll(async () => { servers = startAll(SITES); });
test.afterAll(async () => { stopAll(servers); });

test('pricing.html has all 5 Stripe links', async ({ page }) => {
  await page.goto(`${HUB}/pricing.html`);
  for (const link of STRIPE_LINKS) {
    await expect(page.locator(`a[href="${link}"]`).first()).toBeVisible();
  }
});

test('index → pricing → all Stripe links', async ({ page }) => {
  await page.goto(`${HUB}/index.html`);
  await page.locator('a[href*="pricing"]').first().click();
  await page.waitForURL('**/pricing.html');
  for (const link of STRIPE_LINKS) {
    await expect(page.locator(`a[href="${link}"]`).first()).toBeVisible();
  }
});

test('nav bar has Pricing link', async ({ page }) => {
  await page.goto(`${HUB}/index.html`);
  await expect(page.locator('nav a[href*="pricing"]').first()).toBeVisible();
});

for (const route of ['index.html', 'landing.html', 'onboarding/builder.html', 'onboarding/explorer.html', 'onboarding/weaver.html']) {
  test(`${route} links to pricing`, async ({ page }) => {
    await page.goto(`${HUB}/${route}`);
    const links = await page.locator('a[href*="pricing"]').all();
    expect(links.length).toBeGreaterThan(0);
  });
}

for (const site of SITES.slice(1)) {
  test(`${site.name} links to mirrorborn.us`, async ({ page }) => {
    await page.goto(`http://localhost:${site.port}/index.html`);
    const links = await page.locator('a[href*="mirrorborn.us"]').all();
    expect(links.length).toBeGreaterThan(0);
  });
}
