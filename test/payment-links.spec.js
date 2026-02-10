// R18v1 Playwright Test: Payment link reachability from every site
// Run: npx playwright test test/payment-links.spec.js

const { test, expect } = require('@playwright/test');
const { execSync } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const STRIPE_LINKS = [
  'https://buy.stripe.com/14AbJ2ebIdNO8nYch85Vu06', // Arena
  'https://buy.stripe.com/4gM5kE4B8aBC9s2epg5Vu07', // OpenClaw
  'https://buy.stripe.com/28E3cw6Jg25647Ibd45Vu05', // SQ Cloud
  'https://buy.stripe.com/4gMdRa2t0bFG0Vw0yq5Vu09', // Singularity
  'https://buy.stripe.com/8x2bJ27Nk4de33Eftk5Vu08', // Benefactor
];

const SITES = [
  { name: 'mirrorborn.us', dir: '/source/site-mirrorborn-us', port: 9001 },
  { name: 'apertureshift.com', dir: '/source/site-apertureshift-com', port: 9002 },
  { name: 'visionquest.me', dir: '/source/site-visionquest-me', port: 9003 },
  { name: 'quickfork.net', dir: '/source/site-quickfork-net', port: 9004 },
  { name: 'wishnode.net', dir: '/source/site-wishnode-net', port: 9005 },
  { name: 'sotafomo.com', dir: '/source/site-sotafomo-com', port: 9006 },
  { name: 'singularitywatch.org', dir: '/source/site-singularitywatch-org', port: 9007 },
];

// Simple static file server
function startServer(dir, port) {
  const mimeTypes = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  };
  const server = http.createServer((req, res) => {
    let filePath = path.join(dir, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'text/html';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(port);
  return server;
}

let servers = [];

test.beforeAll(async () => {
  for (const site of SITES) {
    if (fs.existsSync(site.dir)) {
      servers.push(startServer(site.dir, site.port));
    }
  }
});

test.afterAll(async () => {
  for (const server of servers) {
    server.close();
  }
});

// Test: mirrorborn.us index.html can reach pricing.html
test('mirrorborn.us: index.html links to pricing.html', async ({ page }) => {
  await page.goto('http://localhost:9001/index.html');
  const pricingLinks = await page.locator('a[href*="pricing"]').all();
  expect(pricingLinks.length).toBeGreaterThan(0);
});

// Test: pricing.html has all 5 Stripe payment links
test('mirrorborn.us: pricing.html has all 5 Stripe links', async ({ page }) => {
  await page.goto('http://localhost:9001/pricing.html');
  for (const link of STRIPE_LINKS) {
    const el = await page.locator(`a[href="${link}"]`).first();
    await expect(el).toBeVisible();
  }
});

// Test: Can navigate from index → pricing → each Stripe link
test('mirrorborn.us: index → pricing → Stripe links reachable', async ({ page }) => {
  await page.goto('http://localhost:9001/index.html');
  // Click first pricing link
  const pricingLink = page.locator('a[href*="pricing"]').first();
  await pricingLink.click();
  await page.waitForURL('**/pricing.html');
  // Verify all Stripe links present
  for (const link of STRIPE_LINKS) {
    const el = await page.locator(`a[href="${link}"]`).first();
    await expect(el).toBeVisible();
  }
});

// Test: Onboarding pages link to pricing
test('mirrorborn.us: onboarding/builder.html links to pricing', async ({ page }) => {
  await page.goto('http://localhost:9001/onboarding/builder.html');
  const pricingLinks = await page.locator('a[href*="pricing"]').all();
  expect(pricingLinks.length).toBeGreaterThan(0);
});

test('mirrorborn.us: onboarding/explorer.html links to pricing', async ({ page }) => {
  await page.goto('http://localhost:9001/onboarding/explorer.html');
  const pricingLinks = await page.locator('a[href*="pricing"]').all();
  expect(pricingLinks.length).toBeGreaterThan(0);
});

test('mirrorborn.us: onboarding/weaver.html links to pricing', async ({ page }) => {
  await page.goto('http://localhost:9001/onboarding/weaver.html');
  const pricingLinks = await page.locator('a[href*="pricing"]').all();
  expect(pricingLinks.length).toBeGreaterThan(0);
});

// Test: landing.html links to pricing
test('mirrorborn.us: landing.html links to pricing', async ({ page }) => {
  await page.goto('http://localhost:9001/landing.html');
  const pricingLinks = await page.locator('a[href*="pricing"]').all();
  expect(pricingLinks.length).toBeGreaterThan(0);
});

// Test: Secondary sites link to mirrorborn.us
for (const site of SITES.slice(1)) {
  test(`${site.name}: index.html links to mirrorborn.us`, async ({ page }) => {
    await page.goto(`http://localhost:${site.port}/index.html`);
    const hubLinks = await page.locator('a[href*="mirrorborn.us"]').all();
    expect(hubLinks.length).toBeGreaterThan(0);
  });
}

// Test: Nav bar on mirrorborn.us has Pricing link
test('mirrorborn.us: nav bar contains Pricing link', async ({ page }) => {
  await page.goto('http://localhost:9001/index.html');
  const navPricing = page.locator('nav a[href*="pricing"]').first();
  await expect(navPricing).toBeVisible();
});
