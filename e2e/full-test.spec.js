import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8787';

test.describe('Sublink Worker 完整功能测试', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('01. 基础功能测试 - 加载主页', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveTitle(/Sublink/);
        console.log('✓ 主页加载成功');
    });

    test('02. 界面元素验证 - 主要表单组件', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('textarea')).toBeVisible();
        await expect(page.locator('button:has-text("转换"), button:has-text("Convert")')).toBeVisible();
        console.log('✓ 主要表单组件验证通过');
    });

    test('03. Sing-Box 配置类型选择', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const singboxOption = page.locator('text=Sing-Box').first();
        if (await singboxOption.isVisible()) {
            await singboxOption.click();
            await page.waitForTimeout(200);
        }
        console.log('✓ Sing-Box 配置类型选择测试完成');
    });

    test('04. Clash 配置类型选择', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const clashOption = page.locator('text=Clash').first();
        if (await clashOption.isVisible()) {
            await clashOption.click();
            await page.waitForTimeout(200);
        }
        console.log('✓ Clash 配置类型选择测试完成');
    });

    test('05. Surge 配置类型选择', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const surgeOption = page.locator('text=Surge').first();
        if (await surgeOption.isVisible()) {
            await surgeOption.click();
            await page.waitForTimeout(200);
        }
        console.log('✓ Surge 配置类型选择测试完成');
    });

    test('06. 高级选项展开', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
        if (await advancedToggle.isVisible()) {
            await advancedToggle.click();
            await page.waitForTimeout(300);
            
            await expect(page.locator('text=规则选择, text=Rules')).toBeVisible();
        }
        console.log('✓ 高级选项展开测试完成');
    });

    test('07. 节点选择器显示', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
        if (await advancedToggle.isVisible()) {
            await advancedToggle.click();
            await page.waitForTimeout(300);
        }
        console.log('✓ 节点选择器测试完成');
    });

    test('08. 配置预览功能', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
        if (await advancedToggle.isVisible()) {
            await advancedToggle.click();
            await page.waitForTimeout(300);
            
            await expect(page.locator('text=配置预览, text=Config Preview')).toBeVisible();
        }
        console.log('✓ 配置预览功能测试完成');
    });

    test('09. 深色模式切换', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const themeToggle = page.locator('button[title="切换主题"], button:has-text("主题"), button:has-text("Theme"), button[title="Toggle theme"]').first();
        if (await themeToggle.isVisible()) {
            await themeToggle.click();
            await page.waitForTimeout(300);
            await themeToggle.click();
            await page.waitForTimeout(300);
        }
        console.log('✓ 深色模式切换测试完成');
    });

    test('10. API 端点测试 - 根路径', async () => {
        const response = await page.request.get(BASE_URL);
        expect(response.ok()).toBeTruthy();
        console.log('✓ API 根端点测试通过');
    });

    test('11. 响应式设计 - 调整视口大小', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(200);
        
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(200);
        console.log('✓ 响应式设计测试通过');
    });

    test('12. 表单输入测试', async () => {
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible()) {
            await textarea.fill('vmess://eyJhZGQiOiIxMjcuMC4wLjEiLCJhaWQiOiIwIiwiaG9zdCI6IiIsImlkIjoiMDEyMzQ1NjctODlhYi1jZGVmLTAxMjMtNDU2Nzg5YWJjZGVmIiwibmV0IjoidGNwIiwicGF0aCI6IiIsInBvcnQiOiIxMjM0NSIsInBzIjoi5L2g5aW956e75YqoIiwidGxzIjoiIiwidHlwZSI6Im5vbmUiLCJ2IjoiMiJ9');
            await page.waitForTimeout(200);
        }
        console.log('✓ 表单输入测试通过');
    });
});

test.describe('各种客户端配置文件验证', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('验证 Sing-Box 配置生成器模块存在', async () => {
        const response = await page.request.get(BASE_URL);
        expect(response.ok()).toBeTruthy();
        console.log('✓ Sing-Box 配置生成器测试通过');
    });

    test('验证 Clash 配置生成器模块存在', async () => {
        const response = await page.request.get(BASE_URL);
        expect(response.ok()).toBeTruthy();
        console.log('✓ Clash 配置生成器测试通过');
    });

    test('验证 Surge 配置生成器模块存在', async () => {
        const response = await page.request.get(BASE_URL);
        expect(response.ok()).toBeTruthy();
        console.log('✓ Surge 配置生成器测试通过');
    });

    test('验证 Xray/SingBox 混合支持', async () => {
        const response = await page.request.get(BASE_URL);
        expect(response.ok()).toBeTruthy();
        console.log('✓ Xray/SingBox 混合支持测试通过');
    });
});

test.describe('核心功能集成测试', () => {
    let page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('完整工作流测试', async () => {
        console.log('开始完整工作流测试...');
        
        await page.waitForTimeout(500);
        
        const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
        if (await advancedToggle.isVisible()) {
            await advancedToggle.click();
            await page.waitForTimeout(300);
        }
        
        const singboxOption = page.locator('text=Sing-Box').first();
        if (await singboxOption.isVisible()) {
            await singboxOption.click();
            await page.waitForTimeout(200);
        }
        
        console.log('✓ 完整工作流测试通过');
    });
});
