import { test, expect } from '@playwright/test';

const baseUrl = 'http://localhost:4200/';
const expectedVersion = '0.0.0';

test.describe('Home Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(baseUrl);
    });

    test('has version', async ({ page }) => {
        await expect(page.getByTestId('app-version')).toContainText(`v${expectedVersion}`);
    });
});

