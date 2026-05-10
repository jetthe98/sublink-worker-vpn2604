/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const OperationHistory = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                history: [],
                showHistory: false,
                maxItems: 50,

                init() {
                    this.loadHistory();
                    this.addToHistory('init', '页面初始化');
                },

                loadHistory() {
                    try {
                        this.history = JSON.parse(localStorage.getItem('operationHistory') || '[]');
                    } catch {
                        this.history = [];
                    }
                },

                saveHistory() {
                    const trimmed = this.history.slice(0, this.maxItems);
                    localStorage.setItem('operationHistory', JSON.stringify(trimmed));
                },

                addToHistory(type, description, details = null) {
                    const entry = {
                        id: Date.now().toString(),
                        type: type,
                        description: description,
                        details: details,
                        timestamp: Date.now()
                    };

                    this.history.unshift(entry);
                    if (this.history.length > this.maxItems) {
                        this.history = this.history.slice(0, this.maxItems);
                    }

                    this.saveHistory();
                },

                clearHistory() {
                    if (confirm(t('confirmClearHistory') || '确定清空历史记录？')) {
                        this.history = [];
                        localStorage.setItem('operationHistory', '[]');
                    }
                },

                getTypeIcon(type) {
                    const icons = {
                        'init': 'fa-play-circle',
                        'parse': 'fa-search',
                        'select': 'fa-check-square',
                        'deselect': 'fa-square',
                        'rename': 'fa-edit',
                        'favorite': 'fa-star',
                        'group': 'fa-layer-group',
                        'export': 'fa-file-export',
                        'import': 'fa-file-import',
                        'subscription': 'fa-link',
                        'settings': 'fa-cog',
                        'generate': 'fa-magic'
                    };
                    return icons[type] || 'fa-circle';
                },

                getTypeColor(type) {
                    const colors = {
                        'init': 'text-blue-500',
                        'parse': 'text-purple-500',
                        'select': 'text-green-500',
                        'deselect': 'text-gray-500',
                        'rename': 'text-yellow-500',
                        'favorite': 'text-yellow-500',
                        'group': 'text-indigo-500',
                        'export': 'text-green-500',
                        'import': 'text-blue-500',
                        'subscription': 'text-cyan-500',
                        'settings': 'text-gray-500',
                        'generate': 'text-pink-500'
                    };
                    return colors[type] || 'text-gray-400';
                },

                formatTime(timestamp) {
                    const date = new Date(timestamp);
                    const now = new Date();
                    const diff = now - date;

                    if (diff < 60000) {
                        return '刚刚';
                    } else if (diff < 3600000) {
                        return Math.floor(diff / 60000) + ' 分钟前';
                    } else if (diff < 86400000) {
                        return Math.floor(diff / 3600000) + ' 小时前';
                    } else {
                        return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                    }
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-history text-gray-400"></i>
                    {t('operationHistory') || '操作历史'}
                    <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full" x-text="history.length"></span>
                </h3>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        x-on:click="showHistory = !showHistory"
                        class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <i class="fas" x-bind:class="showHistory ? 'fa-chevron-up' : 'fa-list'"></i>
                        <span x-text={`showHistory ? ${t('hide')} : ${t('show')}`}></span>
                    </button>
                    <button
                        type="button"
                        x-on:click="clearHistory()"
                        class="px-3 py-1.5 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        x-show="history.length > 0"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>

            <div x-show="history.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <i class="fas fa-clock text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{t('noHistory') || '暂无历史记录'}</p>
            </div>

            <div x-show="showHistory && history.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
                <template x-for="item in history" x-bind:key="item.id">
                    <div class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                        <div class="mt-0.5">
                            <i class={`fas ${getTypeIcon(item.type)} ${getTypeColor(item.type)}`}></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium text-gray-900 dark:text-white" x-text="item.description"></div>
                            <div x-show="item.details" class="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" x-text="item.details"></div>
                        </div>
                        <div class="text-xs text-gray-400 whitespace-nowrap" x-text="formatTime(item.timestamp)"></div>
                    </div>
                </template>
            </div>
        </div>
    );
};
