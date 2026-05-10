# 用户体验优化功能实现计划

> **目标：** 实现订阅管理、节点搜索筛选、功能引导、节点收藏和二维码生成功能

**架构概述：**
- 订阅管理：新增 `SubscriptionManager` 组件，使用 localStorage 存储订阅列表
- 节点搜索：在 `NodeSelector` 中添加搜索框和筛选器
- 功能引导：添加工具提示和首次使用引导
- 节点收藏：复用现有的 `FavoriteNodesService`
- 二维码生成：引入 QRCode 库生成二维码

**技术栈：**
- 前端：Alpine.js + Tailwind CSS
- 存储：localStorage（订阅管理）、KV API（收藏）
- 依赖：qrcode (用于二维码生成)

---

## 文件结构

```
src/
├── components/
│   ├── NodeSelector.jsx          # 修改：添加搜索、筛选、收藏
│   ├── SubscriptionManager.jsx   # 新增：订阅管理组件
│   └── formLogic.js              # 修改：添加订阅管理逻辑
├── services/
│   └── subscriptionManagerService.js  # 新增：订阅管理服务
└── i18n/
    └── index.js                  # 修改：添加新功能翻译
```

---

## 任务列表

### 任务 1: 创建订阅管理服务

**文件:**
- 新建: `src/services/subscriptionManagerService.js`
- 测试: `test/subscription-manager.test.js`

- [ ] **Step 1: 创建订阅管理服务**

```javascript
// src/services/subscriptionManagerService.js
const STORAGE_KEY = 'savedSubscriptions';

export class SubscriptionManagerService {
    // 获取所有订阅
    getAll() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    // 保存订阅
    save(subscription) {
        const list = this.getAll();
        const existing = list.findIndex(s => s.id === subscription.id);
        if (existing >= 0) {
            list[existing] = { ...list[existing], ...subscription };
        } else {
            list.push({ ...subscription, id: Date.now().toString() });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return subscription;
    }

    // 删除订阅
    delete(id) {
        const list = this.getAll().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // 获取当前使用的订阅ID
    getCurrentId() {
        return localStorage.getItem('currentSubscriptionId');
    }

    // 设置当前订阅
    setCurrent(id) {
        localStorage.setItem('currentSubscriptionId', id);
    }
}

export const subscriptionManager = new SubscriptionManagerService();
```

- [ ] **Step 2: 提交代码**

```bash
git add src/services/subscriptionManagerService.js
git commit -m "feat: add subscription manager service"
```

---

### 任务 2: 创建订阅管理组件

**文件:**
- 新建: `src/components/SubscriptionManager.jsx`
- 修改: `src/components/Form.jsx` - 添加组件引用
- 修改: `src/i18n/index.js` - 添加翻译

- [ ] **Step 1: 创建 SubscriptionManager 组件**

```jsx
// src/components/SubscriptionManager.jsx
export const SubscriptionManager = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                subscriptions: [],
                showManager: false,
                editingId: null,
                editName: '',
                
                init() {
                    this.loadSubscriptions();
                },
                
                loadSubscriptions() {
                    const saved = localStorage.getItem('savedSubscriptions');
                    this.subscriptions = saved ? JSON.parse(saved) : [];
                },
                
                saveCurrent(name) {
                    if (!input.trim()) return;
                    const sub = {
                        id: Date.now().toString(),
                        name: name || '未命名订阅',
                        config: input,
                        createdAt: Date.now()
                    };
                    const list = this.subscriptions;
                    list.push(sub);
                    localStorage.setItem('savedSubscriptions', JSON.stringify(list));
                    this.subscriptions = list;
                    this.showManager = false;
                },
                
                loadSubscription(id) {
                    const sub = this.subscriptions.find(s => s.id === id);
                    if (sub) {
                        input = sub.config;
                        localStorage.setItem('currentSubscriptionId', id);
                    }
                },
                
                deleteSubscription(id) {
                    this.subscriptions = this.subscriptions.filter(s => s.id !== id);
                    localStorage.setItem('savedSubscriptions', JSON.stringify(this.subscriptions));
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            {/* 组件内容 */}
        </div>
    );
};
```

- [ ] **Step 2: 添加翻译到 i18n**

```javascript
// 在 translations 中添加
savedSubscriptions: '已保存的订阅',
saveSubscription: '保存当前订阅',
subscriptionName: '订阅名称',
noSavedSubscriptions: '暂无保存的订阅',
deleteSubscription: '删除',
loadSubscription: '加载',
```

- [ ] **Step 3: 在 Form.jsx 中引入组件**

```jsx
import { SubscriptionManager } from './SubscriptionManager.jsx';

// 在表单中添加
<SubscriptionManager t={t} />
```

- [ ] **Step 4: 提交代码**

```bash
git add src/components/SubscriptionManager.jsx src/components/Form.jsx src/i18n/index.js
git commit -m "feat: add subscription manager component"
```

---

### 任务 3: 在 NodeSelector 中添加搜索和筛选功能

**文件:**
- 修改: `src/components/NodeSelector.jsx`

- [ ] **Step 1: 添加搜索状态和方法**

```javascript
// 在 x-data 中添加
searchQuery: '',
filterProtocol: 'all',
protocols: [],

filterProxies() {
    let result = this.parsedProxies;
    
    // 搜索过滤
    if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.server.toLowerCase().includes(query)
        );
    }
    
    // 协议过滤
    if (this.filterProtocol !== 'all') {
        result = result.filter(p => 
            p.protocol?.toLowerCase() === this.filterProtocol
        );
    }
    
    return result;
},

getProtocols() {
    const protocols = new Set();
    this.parsedProxies.forEach(p => {
        if (p.protocol) protocols.add(p.protocol);
    });
    return Array.from(protocols).sort();
}
```

- [ ] **Step 2: 在 UI 中添加搜索框和筛选器**

```jsx
{/* 搜索和筛选区域 */}
<div class="flex gap-2 mb-4">
    <div class="flex-1">
        <input
            type="text"
            x-model="searchQuery"
            placeholder="搜索节点名称或服务器..."
            class="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        />
    </div>
    <select x-model="filterProtocol" class="px-4 py-2 rounded-lg border border-gray-200">
        <option value="all">全部协议</option>
        <template x-for="proto in getProtocols()" x-bind:key="proto">
            <option x-bind:value="proto.toLowerCase()" x-text="proto.toUpperCase()"></option>
        </template>
    </select>
</div>
```

- [ ] **Step 3: 更新列表渲染**

```jsx
<template x-for="proxy in filterProxies()" x-bind:key="proxy.name">
```

- [ ] **Step 4: 提交代码**

```bash
git add src/components/NodeSelector.jsx
git commit -m "feat: add node search and filter functionality"
```

---

### 任务 4: 添加功能引导提示

**文件:**
- 修改: `src/components/NodeSelector.jsx` - 添加工具提示
- 修改: `src/i18n/index.js` - 添加翻译

- [ ] **Step 1: 在节点名称旁添加工具提示**

```jsx
{/* 在节点选择器标题旁 */}
<h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
    <i class="fas fa-server text-gray-400"></i>
    {t('nodeSelector')}
    <span class="text-xs text-gray-400" title={t('nodeSelectorTip')}>
        <i class="fas fa-info-circle"></i>
    </span>
</h3>
```

- [ ] **Step 2: 添加翻译**

```javascript
nodeSelectorTip: '点击节点名称可自定义名称，悬停可查看操作',
renameTip: '点击重命名节点',
customNameTip: '自定义节点名称会保存在本地',
```

- [ ] **Step 3: 提交代码**

```bash
git add src/components/NodeSelector.jsx src/i18n/index.js
git commit -m "feat: add feature guidance tooltips"
```

---

### 任务 5: 实现节点收藏功能

**文件:**
- 新建: `src/components/FavoriteNodes.jsx`
- 修改: `src/components/NodeSelector.jsx` - 添加收藏按钮
- 修改: `src/i18n/index.js` - 添加翻译

- [ ] **Step 1: 在 NodeSelector 中添加收藏状态和方法**

```javascript
// 在 x-data 中添加
favoriteNodes: JSON.parse(localStorage.getItem('favoriteNodes') || '[]'),

toggleFavorite(proxy) {
    const index = this.favoriteNodes.findIndex(n => n.name === proxy.name);
    if (index >= 0) {
        this.favoriteNodes.splice(index, 1);
    } else {
        this.favoriteNodes.push({ name: proxy.name, server: proxy.server, protocol: proxy.protocol });
    }
    localStorage.setItem('favoriteNodes', JSON.stringify(this.favoriteNodes));
},

isFavorite(proxyName) {
    return this.favoriteNodes.some(n => n.name === proxyName);
}
```

- [ ] **Step 2: 在节点卡片中添加收藏按钮**

```jsx
{/* 在节点信息区域添加收藏按钮 */}
<button
    type="button"
    x-on:click="toggleFavorite(proxy)"
    class="p-1 hover:text-yellow-500 transition-colors"
    x-bind:class="isFavorite(proxy.name) ? 'text-yellow-500' : 'text-gray-400'"
>
    <i class="fas" x-bind:class="isFavorite(proxy.name) ? 'fa-star' : 'fa-star text-gray-600'"></i>
</button>
```

- [ ] **Step 3: 添加工具提示翻译**

```javascript
addToFavorites: '添加到收藏',
removeFromFavorites: '从收藏移除',
favorites: '收藏夹',
```

- [ ] **Step 4: 提交代码**

```bash
git add src/components/NodeSelector.jsx src/i18n/index.js
git commit -m "feat: add node favorites functionality"
```

---

### 任务 6: 添加二维码生成功能

**文件:**
- 修改: `src/components/SubscribeLinks.jsx` - 添加二维码生成
- 修改: `src/i18n/index.js` - 添加翻译

- [ ] **Step 1: 检查 qrcode 依赖是否已安装**

```bash
grep -i "qrcode" package.json
```

如果没有，添加到 package.json：
```json
"qrcode": "^1.5.3"
```

- [ ] **Step 2: 在结果区域添二维码按钮**

```jsx
{/* 在复制按钮旁添加 */}
<button
    type="button"
    x-on:click={`generateQR('${field.key}')`}
    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
>
    <i class="fas fa-qrcode"></i> 二维码
</button>

{/* 二维码弹窗 */}
<template x-if="showQR">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <canvas id="qr-canvas"></canvas>
            <button x-on:click="showQR = false">关闭</button>
        </div>
    </div>
</template>
```

- [ ] **Step 3: 添回执函数**

```javascript
async generateQR(type) {
    const url = (shortenedLinks || generatedLinks)?.[type];
    if (!url) return;
    
    const QRCode = await import('qrcode');
    const canvas = document.getElementById('qr-canvas');
    await QRCode.toCanvas(canvas, url, { width: 256 });
    this.showQR = true;
}
```

- [ ] **Step 4: 提交代码**

```bash
git add src/components/SubscribeLinks.jsx src/i18n/index.js package.json
git commit -m "feat: add QR code generation for subscription links"
```

---

### 任务 7: 运行测试

- [ ] **Step 1: 运行所有测试**

```bash
npm test
```

- [ ] **Step 2: 修复失败的测试（如有）**

- [ ] **Step 3: 提交测试代码**

```bash
git add test/
git commit -m "test: add tests for new features"
```

---

### 任务 8: 运行 lint 和类型检查

- [ ] **Step 1: 运行 lint**

```bash
npm run lint
```

- [ ] **Step 2: 修复 lint 错误（如有）**

- [ ] **Step 3: 运行类型检查（如有）**

```bash
npm run typecheck
```

- [ ] **Step 4: 提交修复**

```bash
git add -A
git commit -m "fix: resolve lint errors"
```

---

## 自检清单

- [ ] 订阅管理：可以保存、命名、切换、删除订阅
- [ ] 节点搜索：可以按名称和服务器搜索
- [ ] 节点筛选：可以按协议类型筛选
- [ ] 功能引导：工具提示清晰可见
- [ ] 节点收藏：可以收藏和取消收藏节点
- [ ] 二维码生成：可以生成订阅链接二维码
- [ ] 所有测试通过
- [ ] Lint 检查通过
- [ ] 中英文翻译完整
