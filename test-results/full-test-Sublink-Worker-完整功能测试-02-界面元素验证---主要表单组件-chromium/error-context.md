# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full-test.spec.js >> Sublink Worker 完整功能测试 >> 02. 界面元素验证 - 主要表单组件
- Location: e2e/full-test.spec.js:23:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('textarea')
Expected: visible
Error: strict mode violation: locator('textarea') resolved to 3 elements:
    1) <textarea rows="5" id="input" required="" name="input" x-model="input" placeholder="Paste share links, Clash config, Sing-Box config, or Surge config..." class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-900"></textarea> aka getByRole('textbox', { name: ' Input Source' })
    2) <textarea id="customRulesJson" x-model="jsonContent" name="customRulesJson" placeholder="[{"name": "MyRule", "src_ip_cidr": "192.168.1.13/32", "domain_suffix": "example.com", "outbound": "Proxy"}]" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-900 min-h-[16r…></textarea> aka getByPlaceholder('[{"name": "MyRule", "')
    3) <textarea rows="5" id="configEditor" name="configEditor" x-model="configEditor" placeholder="Paste your custom config here..." class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-y placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-900"></textarea> aka getByPlaceholder('Paste your custom config here')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('textarea')

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:8787';
  4   | 
  5   | test.describe('Sublink Worker 完整功能测试', () => {
  6   |     let page;
  7   | 
  8   |     test.beforeEach(async ({ browser }) => {
  9   |         page = await browser.newPage();
  10  |     });
  11  | 
  12  |     test.afterEach(async () => {
  13  |         await page.close();
  14  |     });
  15  | 
  16  |     test('01. 基础功能测试 - 加载主页', async () => {
  17  |         await page.goto(BASE_URL);
  18  |         await page.waitForLoadState('networkidle');
  19  |         await expect(page).toHaveTitle(/Sublink/);
  20  |         console.log('✓ 主页加载成功');
  21  |     });
  22  | 
  23  |     test('02. 界面元素验证 - 主要表单组件', async () => {
  24  |         await page.goto(BASE_URL);
  25  |         await page.waitForLoadState('networkidle');
  26  |         
> 27  |         await expect(page.locator('textarea')).toBeVisible();
      |                                                ^ Error: expect(locator).toBeVisible() failed
  28  |         await expect(page.locator('button:has-text("转换"), button:has-text("Convert")')).toBeVisible();
  29  |         console.log('✓ 主要表单组件验证通过');
  30  |     });
  31  | 
  32  |     test('03. Sing-Box 配置类型选择', async () => {
  33  |         await page.goto(BASE_URL);
  34  |         await page.waitForLoadState('networkidle');
  35  |         
  36  |         const singboxOption = page.locator('text=Sing-Box').first();
  37  |         if (await singboxOption.isVisible()) {
  38  |             await singboxOption.click();
  39  |             await page.waitForTimeout(200);
  40  |         }
  41  |         console.log('✓ Sing-Box 配置类型选择测试完成');
  42  |     });
  43  | 
  44  |     test('04. Clash 配置类型选择', async () => {
  45  |         await page.goto(BASE_URL);
  46  |         await page.waitForLoadState('networkidle');
  47  |         
  48  |         const clashOption = page.locator('text=Clash').first();
  49  |         if (await clashOption.isVisible()) {
  50  |             await clashOption.click();
  51  |             await page.waitForTimeout(200);
  52  |         }
  53  |         console.log('✓ Clash 配置类型选择测试完成');
  54  |     });
  55  | 
  56  |     test('05. Surge 配置类型选择', async () => {
  57  |         await page.goto(BASE_URL);
  58  |         await page.waitForLoadState('networkidle');
  59  |         
  60  |         const surgeOption = page.locator('text=Surge').first();
  61  |         if (await surgeOption.isVisible()) {
  62  |             await surgeOption.click();
  63  |             await page.waitForTimeout(200);
  64  |         }
  65  |         console.log('✓ Surge 配置类型选择测试完成');
  66  |     });
  67  | 
  68  |     test('06. 高级选项展开', async () => {
  69  |         await page.goto(BASE_URL);
  70  |         await page.waitForLoadState('networkidle');
  71  |         
  72  |         const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
  73  |         if (await advancedToggle.isVisible()) {
  74  |             await advancedToggle.click();
  75  |             await page.waitForTimeout(300);
  76  |             
  77  |             await expect(page.locator('text=规则选择, text=Rules')).toBeVisible();
  78  |         }
  79  |         console.log('✓ 高级选项展开测试完成');
  80  |     });
  81  | 
  82  |     test('07. 节点选择器显示', async () => {
  83  |         await page.goto(BASE_URL);
  84  |         await page.waitForLoadState('networkidle');
  85  |         
  86  |         const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
  87  |         if (await advancedToggle.isVisible()) {
  88  |             await advancedToggle.click();
  89  |             await page.waitForTimeout(300);
  90  |         }
  91  |         console.log('✓ 节点选择器测试完成');
  92  |     });
  93  | 
  94  |     test('08. 配置预览功能', async () => {
  95  |         await page.goto(BASE_URL);
  96  |         await page.waitForLoadState('networkidle');
  97  |         
  98  |         const advancedToggle = page.locator('text=高级选项, text=Advanced Options').first();
  99  |         if (await advancedToggle.isVisible()) {
  100 |             await advancedToggle.click();
  101 |             await page.waitForTimeout(300);
  102 |             
  103 |             await expect(page.locator('text=配置预览, text=Config Preview')).toBeVisible();
  104 |         }
  105 |         console.log('✓ 配置预览功能测试完成');
  106 |     });
  107 | 
  108 |     test('09. 深色模式切换', async () => {
  109 |         await page.goto(BASE_URL);
  110 |         await page.waitForLoadState('networkidle');
  111 |         
  112 |         const themeToggle = page.locator('button[title="切换主题"], button:has-text("主题"), button:has-text("Theme"), button[title="Toggle theme"]').first();
  113 |         if (await themeToggle.isVisible()) {
  114 |             await themeToggle.click();
  115 |             await page.waitForTimeout(300);
  116 |             await themeToggle.click();
  117 |             await page.waitForTimeout(300);
  118 |         }
  119 |         console.log('✓ 深色模式切换测试完成');
  120 |     });
  121 | 
  122 |     test('10. API 端点测试 - 根路径', async () => {
  123 |         const response = await page.request.get(BASE_URL);
  124 |         expect(response.ok()).toBeTruthy();
  125 |         console.log('✓ API 根端点测试通过');
  126 |     });
  127 | 
```