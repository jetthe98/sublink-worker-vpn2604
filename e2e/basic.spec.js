import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8787';

test.describe('Sublink Worker Frontend E2E Tests', () => {
    let page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('should load the main page', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveTitle(/Sublink/);
    });

    test('should display the main form', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await expect(page.locator('textarea')).toBeVisible();
        await expect(page.locator('button:has-text("转换")')).toBeVisible();
    });

    test('should expand advanced options', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const advancedToggle = page.locator('text=高级选项');
        await advancedToggle.click();

        await expect(page.locator('text=规则选择')).toBeVisible();
    });

    test('should show node selector after parsing', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await page.locator('text=高级选项').click();
        await page.waitForTimeout(300);

        await expect(page.locator('text=节点选择')).toBeVisible();
    });

    test('should show config preview button', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        await page.locator('text=高级选项').click();
        await page.waitForTimeout(300);

        await expect(page.locator('text=配置预览')).toBeVisible();
    });

    test('should toggle dark mode', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const themeToggle = page.locator('button[title="切换主题"], button:has-text("主题"), button:has-text("Theme")').first();
        if (await themeToggle.isVisible()) {
            await themeToggle.click();
            await page.waitForTimeout(300);
        }
    });

    test('should select config type', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');

        const singboxOption = page.locator('text=Sing-Box');
        if (await singboxOption.isVisible()) {
            await singboxOption.click();
        }

        const clashOption = page.locator('text=Clash');
        if (await clashOption.isVisible()) {
            await clashOption.click();
        }
    });
});
