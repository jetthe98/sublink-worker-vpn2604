/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const BatchRename = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                showBatchRename: false,
                batchMode: 'prefix',
                batchPrefix: '',
                batchSuffix: '',
                batchFind: '',
                batchReplace: '',
                batchRegex: false,
                batchPreview: [],
                selectedProxies: [],

                init() {
                    this.$watch('selectedProxyNames', (value) => {
                        this.selectedProxies = value;
                        this.updatePreview();
                    });
                },

                updatePreview() {
                    if (!this.parsedProxies || this.parsedProxies.length === 0) {
                        this.batchPreview = [];
                        return;
                    }

                    const proxiesToRename = this.selectedProxyNames.length > 0
                        ? this.parsedProxies.filter(p => this.selectedProxyNames.includes(p.name))
                        : this.parsedProxies;

                    this.batchPreview = proxiesToRename.map(proxy => {
                        const originalName = this.getProxyDisplayName(proxy.name);
                        let newName = originalName;

                        switch (this.batchMode) {
                            case 'prefix':
                                newName = this.batchPrefix + originalName;
                                break;
                            case 'suffix':
                                newName = originalName + this.batchSuffix;
                                break;
                            case 'replace':
                                if (this.batchRegex) {
                                    try {
                                        const regex = new RegExp(this.batchFind, 'g');
                                        newName = originalName.replace(regex, this.batchReplace);
                                    } catch {
                                        newName = originalName;
                                    }
                                } else {
                                    newName = originalName.split(this.batchFind).join(this.batchReplace);
                                }
                                break;
                        }

                        return {
                            original: originalName,
                            new: newName,
                            changed: originalName !== newName
                        };
                    });
                },

                applyBatchRename() {
                    const changed = this.batchPreview.filter(p => p.changed);
                    if (changed.length === 0) {
                        alert(t('noChangesToApply') || '没有需要修改的节点');
                        return;
                    }

                    changed.forEach(item => {
                        const proxy = this.parsedProxies.find(p =>
                            this.getProxyDisplayName(p.name) === item.original
                        );
                        if (proxy) {
                            this.setCustomProxyName(proxy.name, item.new);
                        }
                    });

                    alert(`${t('successRenameNodes') || '成功重命名'} ${changed.length} ${t('nodes') || '个节点'}`);

                    this.showBatchRename = false;
                    this.batchPrefix = '';
                    this.batchSuffix = '';
                    this.batchFind = '';
                    this.batchReplace = '';
                    this.batchPreview = [];
                },

                selectAllForBatch() {
                    if (this.parsedProxies) {
                        selectedProxyNames = this.parsedProxies.map(p => p.name);
                    }
                },

                clearSelectionForBatch() {
                    selectedProxyNames = [];
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-edit text-gray-400"></i>
                    {t('batchRename') || '批量重命名'}
                </h3>
                <button
                    type="button"
                    x-on:click="showBatchRename = !showBatchRename"
                    class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                    x-bind:class="showBatchRename ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                >
                    <i class="fas" x-bind:class="showBatchRename ? 'fa-chevron-up' : 'fa-expand-arrows-alt'"></i>
                    <span x-text={`showBatchRename ? ${t('hide')} : ${t('show')}`}></span>
                </button>
            </div>

            <div x-show="parsedProxies.length === 0" class="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <i class="fas fa-server text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{t('noProxiesToRename') || '暂无节点可重命名'}</p>
            </div>

            <div x-show="showBatchRename && parsedProxies.length > 0" class="space-y-4">
                <div class="flex gap-2 mb-4">
                    <button
                        type="button"
                        x-on:click="batchMode = 'prefix'"
                        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        x-bind:class="batchMode === 'prefix' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                    >
                        {t('addPrefix') || '添加前缀'}
                    </button>
                    <button
                        type="button"
                        x-on:click="batchMode = 'suffix'"
                        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        x-bind:class="batchMode === 'suffix' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                    >
                        {t('addSuffix') || '添加后缀'}
                    </button>
                    <button
                        type="button"
                        x-on:click="batchMode = 'replace'"
                        class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                        x-bind:class="batchMode === 'replace' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'"
                    >
                        {t('findReplace') || '查找替换'}
                    </button>
                </div>

                <div class="space-y-3">
                    <template x-if="batchMode === 'prefix'">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('prefix') || '前缀'}
                            </label>
                            <input
                                type="text"
                                x-model="batchPrefix"
                                x-on:input="updatePreview()"
                                placeholder={t('enterPrefix') || '例如：🇭🇰 '}
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </template>

                    <template x-if="batchMode === 'suffix'">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('suffix') || '后缀'}
                            </label>
                            <input
                                type="text"
                                x-model="batchSuffix"
                                x-on:input="updatePreview()"
                                placeholder={t('enterSuffix') || '例如：- 高速'}
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                    </template>

                    <template x-if="batchMode === 'replace'">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('find') || '查找'}
                                </label>
                                <input
                                    type="text"
                                    x-model="batchFind"
                                    x-on:input="updatePreview()"
                                    placeholder={t('enterFind') || '要查找的文本'}
                                    class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('replaceWith') || '替换为'}
                                </label>
                                <input
                                    type="text"
                                    x-model="batchReplace"
                                    x-on:input="updatePreview()"
                                    placeholder={t('enterReplace') || '替换后的文本'}
                                    class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                                />
                            </div>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" x-model="batchRegex" x-on:change="updatePreview()" class="w-4 h-4 rounded border-gray-300 text-primary-600" />
                                <span class="text-sm text-gray-600 dark:text-gray-400">{t('useRegex') || '使用正则表达式'}</span>
                            </label>
                        </div>
                    </template>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        <span x-text="selectedProxyNames.length > 0 ? selectedProxyNames.length : parsedProxies.length"></span>
                        <span> {t('nodesSelected') || '个节点'}</span>
                        <template x-if="selectedProxyNames.length > 0">
                            <span class="ml-2">
                                <button type="button" x-on:click="clearSelectionForBatch()" class="text-primary-600 hover:text-primary-700 text-xs">
                                    ({t('clearSelection') || '清除选择'})
                                </button>
                            </span>
                        </template>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                        <span x-text="batchPreview.filter(p => p.changed).length"></span>
                        <span> {t('willChange') || '个将被修改'}</span>
                    </div>
                </div>

                <div x-show="batchPreview.length > 0" class="space-y-2 max-h-48 overflow-y-auto">
                    <template x-for="(item, index) in batchPreview.slice(0, 10)" x-bind:key="index">
                        <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded">
                            <span class="text-sm text-gray-600 dark:text-gray-400 line-through flex-1 truncate" x-text="item.original"></span>
                            <i class="fas fa-arrow-right text-gray-400 text-xs"></i>
                            <span class="text-sm text-primary-600 dark:text-primary-400 font-medium flex-1 truncate" x-text="item.new"></span>
                        </div>
                    </template>
                    <template x-if="batchPreview.length > 10">
                        <div class="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                            ... {t('andMore') || '还有'} <span x-text="batchPreview.length - 10"></span> <span x-text={`${t('items') || '项'}`}></span>
                        </div>
                    </template>
                </div>

                <div class="flex gap-3 pt-4">
                    <button
                        type="button"
                        x-on:click="selectAllForBatch()"
                        class="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        {t('selectAll') || '全选'}
                    </button>
                    <button
                        type="button"
                        x-on:click="applyBatchRename()"
                        class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                        x-bind:disabled="batchPreview.filter(p => p.changed).length === 0"
                    >
                        {t('applyRename') || '应用修改'}
                    </button>
                </div>
            </div>
        </div>
    );
};
