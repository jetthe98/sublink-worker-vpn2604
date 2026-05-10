# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic.spec.js >> Sublink Worker Frontend E2E Tests >> should select config type
- Location: e2e/basic.spec.js:72:5

# Error details

```
Error: locator.isVisible: Error: strict mode violation: locator('text=Clash') resolved to 3 elements:
    1) <span class="font-medium text-gray-700 dark:text-gray-300">Enable Clash API</span> aka getByText('Enable Clash API')
    2) <option value="clash">Clash (YAML)</option> aka getByText('Clash (YAML)')
    3) <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clash Link</label> aka getByText('Clash Link')

Call log:
    - checking visibility of locator('text=Clash')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - navigation [ref=e3]:
    - generic [ref=e5]:
      - link "Sublink Worker logo Sublink Worker" [ref=e6] [cursor=pointer]:
        - /url: "#"
        - img "Sublink Worker logo" [ref=e7]
        - generic [ref=e8]: Sublink Worker
      - generic [ref=e9]:
        - link " Docs" [ref=e10] [cursor=pointer]:
          - /url: https://sublink.works
          - generic [ref=e11]: 
          - generic [ref=e12]: Docs
        - link " GitHub" [ref=e13] [cursor=pointer]:
          - /url: https://github.com/7Sageer/sublink-worker
          - generic [ref=e14]: 
          - generic [ref=e15]: GitHub
        - button "Toggle dark mode" [ref=e16] [cursor=pointer]:
          - generic [ref=e17]: 
  - main [ref=e18]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - heading "Sublink Worker" [level=1] [ref=e22]
        - paragraph [ref=e23]: Efficiently Aggregate and Manage Your Proxy Nodes
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e27]:
            - generic [ref=e28]:
              - generic [ref=e29]:
                - generic [ref=e31]: 
                - text: Input Source
              - generic [ref=e32]:
                - button " Paste" [ref=e33] [cursor=pointer]:
                  - generic [ref=e34]: 
                  - generic [ref=e35]: Paste
                - text: 
            - textbox " Input Source" [ref=e37]:
              - /placeholder: Paste share links, Clash config, Sing-Box config, or Surge config...
          - button " Advanced Options " [ref=e38] [cursor=pointer]:
            - generic [ref=e39]:
              - generic [ref=e41]: 
              - generic [ref=e42]: Advanced Options
            - generic [ref=e44]: 
          - text:            +      + +               
          - generic [ref=e45]:
            - button " Convert" [ref=e46] [cursor=pointer]:
              - generic [ref=e47]: 
              - generic [ref=e48]: Convert
            - button " Clear" [ref=e49] [cursor=pointer]:
              - generic [ref=e50]: 
              - text: Clear
        - text:      
  - contentinfo [ref=e51]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]: © 2026 Sublink Worker. All rights reserved.
        - generic [ref=e56]: "|"
        - link "v2.4.2" [ref=e57] [cursor=pointer]:
          - /url: https://github.com/7Sageer/sublink-worker/releases/tag/v2.4.2
      - generic [ref=e58]:
        - link "Documentation" [ref=e59] [cursor=pointer]:
          - /url: https://sublink.works
          - generic [ref=e60]: 
        - link "GitHub" [ref=e61] [cursor=pointer]:
          - /url: https://github.com/7Sageer/sublink-worker
          - generic [ref=e62]: 
  - text:   
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE_URL = 'http://localhost:8787';
  4  | 
  5  | test.describe('Sublink Worker Frontend E2E Tests', () => {
  6  |     let page;
  7  | 
  8  |     test.beforeAll(async ({ browser }) => {
  9  |         page = await browser.newPage();
  10 |     });
  11 | 
  12 |     test.afterAll(async () => {
  13 |         await page.close();
  14 |     });
  15 | 
  16 |     test('should load the main page', async () => {
  17 |         await page.goto(BASE_URL);
  18 |         await page.waitForLoadState('networkidle');
  19 | 
  20 |         await expect(page).toHaveTitle(/Sublink/);
  21 |     });
  22 | 
  23 |     test('should display the main form', async () => {
  24 |         await page.goto(BASE_URL);
  25 |         await page.waitForLoadState('networkidle');
  26 | 
  27 |         await expect(page.locator('textarea')).toBeVisible();
  28 |         await expect(page.locator('button:has-text("转换")')).toBeVisible();
  29 |     });
  30 | 
  31 |     test('should expand advanced options', async () => {
  32 |         await page.goto(BASE_URL);
  33 |         await page.waitForLoadState('networkidle');
  34 | 
  35 |         const advancedToggle = page.locator('text=高级选项');
  36 |         await advancedToggle.click();
  37 | 
  38 |         await expect(page.locator('text=规则选择')).toBeVisible();
  39 |     });
  40 | 
  41 |     test('should show node selector after parsing', async () => {
  42 |         await page.goto(BASE_URL);
  43 |         await page.waitForLoadState('networkidle');
  44 | 
  45 |         await page.locator('text=高级选项').click();
  46 |         await page.waitForTimeout(300);
  47 | 
  48 |         await expect(page.locator('text=节点选择')).toBeVisible();
  49 |     });
  50 | 
  51 |     test('should show config preview button', async () => {
  52 |         await page.goto(BASE_URL);
  53 |         await page.waitForLoadState('networkidle');
  54 | 
  55 |         await page.locator('text=高级选项').click();
  56 |         await page.waitForTimeout(300);
  57 | 
  58 |         await expect(page.locator('text=配置预览')).toBeVisible();
  59 |     });
  60 | 
  61 |     test('should toggle dark mode', async () => {
  62 |         await page.goto(BASE_URL);
  63 |         await page.waitForLoadState('networkidle');
  64 | 
  65 |         const themeToggle = page.locator('button[title="切换主题"], button:has-text("主题"), button:has-text("Theme")').first();
  66 |         if (await themeToggle.isVisible()) {
  67 |             await themeToggle.click();
  68 |             await page.waitForTimeout(300);
  69 |         }
  70 |     });
  71 | 
  72 |     test('should select config type', async () => {
  73 |         await page.goto(BASE_URL);
  74 |         await page.waitForLoadState('networkidle');
  75 | 
  76 |         const singboxOption = page.locator('text=Sing-Box');
  77 |         if (await singboxOption.isVisible()) {
  78 |             await singboxOption.click();
  79 |         }
  80 | 
  81 |         const clashOption = page.locator('text=Clash');
> 82 |         if (await clashOption.isVisible()) {
     |                               ^ Error: locator.isVisible: Error: strict mode violation: locator('text=Clash') resolved to 3 elements:
  83 |             await clashOption.click();
  84 |         }
  85 |     });
  86 | });
  87 | 
```