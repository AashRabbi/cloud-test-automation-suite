const { test } = require('@playwright/test'); test('Test 42', async ({ page }) => { await page.goto('https://example.com'); });
