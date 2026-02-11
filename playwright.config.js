// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  timeout: 15000,
  retries: 0,
  use: {
    headless: true,
    baseURL: 'http://localhost:9001',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
