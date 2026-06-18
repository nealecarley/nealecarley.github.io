const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  testDir: './test',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx http-server . -p 3000 --silent',
    port: 3000,
    timeout: 10000,
    reuseExistingServer: !process.env.CI,
  },
});
