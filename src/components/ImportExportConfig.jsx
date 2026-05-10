/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const ImportExportConfig = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                showImportModal: false,
                importContent: '',
                importName: '',
                importError: null,
                importSuccess: false,
                exportedConfigs: [],

                init() {
                    this.loadExportedConfigs();
                },

                loadExportedConfigs() {
                    try {
                        this.exportedConfigs = JSON.parse(localStorage.getItem('exportedConfigs') || '[]');
                    } catch {
                        this.exportedConfigs = [];
                    }
                },

                saveExportedConfig(name, config) {
                    const configData = {
                        id: Date.now().toString(),
                        name: name || '未命名配置',
                        config: config,
                        createdAt: Date.now()
                    };
                    this.exportedConfigs.push(configData);
                    localStorage.setItem('exportedConfigs', JSON.stringify(this.exportedConfigs));
                    return configData;
                },

                exportCurrentConfig() {
                    const name = prompt(t('enterConfigName') || '请输入配置名称：', '我的配置');
                    if (!name) return;

                    const config = {
                        input: input,
                        customProxyNames: customProxyNames,
                        selectedProxyNames: selectedProxyNames,
                        customProxyGroups: customProxyGroups,
                        settings: {
                            autoSelect: autoSelect,
                            selectedNodes: selectedProxyNames
                        }
                    };

                    this.saveExportedConfig(name, config);
                    alert(t('exportSuccess') || '配置已导出！');
                },

                exportToFile() {
                    const name = prompt(t('enterConfigName') || '请输入配置名称：', 'my-config');
                    if (!name) return;

                    const config = {
                        version: '1.0',
                        name: name,
                        exportedAt: new Date().toISOString(),
                        data: {
                            input: input,
                            customProxyNames: JSON.parse(localStorage.getItem('customProxyNames') || '{}'),
                            selectedProxyNames: selectedProxyNames,
                            customProxyGroups: customProxyGroups,
                            settings: {
                                autoSelect: autoSelect
                            }
                        }
                    };

                    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${name}.json`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                },

                importFromFile() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';

                    input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        try {
                            const text = await file.text();
                            const config = JSON.parse(text);

                            if (config.version && config.data) {
                                this.importName = config.name || file.name.replace('.json', '');
                                this.importContent = JSON.stringify(config.data, null, 2);
                            } else if (config.input || config.config) {
                                this.importName = config.name || file.name.replace('.json', '');
                                this.importContent = config.input || config.config;
                            } else {
                                throw new Error(t('invalidConfigFormat') || '无效的配置文件格式');
                            }

                            this.importError = null;
                            this.importSuccess = false;
                            this.showImportModal = true;
                        } catch (e) {
                            this.importError = e.message;
                            this.importSuccess = false;
                        }
                    };

                    input.click();
                },

                applyImport() {
                    if (!this.importContent) return;

                    try {
                        const config = typeof this.importContent === 'string'
                            ? JSON.parse(this.importContent)
                            : this.importContent;

                        if (config.input) {
                            input = config.input;
                        } else if (config.config) {
                            input = typeof config.config === 'string' ? config.config : JSON.stringify(config.config);
                        } else {
                            input = typeof config === 'string' ? config : JSON.stringify(config);
                        }

                        if (config.customProxyNames) {
                            localStorage.setItem('customProxyNames', JSON.stringify(config.customProxyNames));
                            customProxyNames = config.customProxyNames;
                        }

                        if (config.customProxyGroups) {
                            localStorage.setItem('customProxyGroups', JSON.stringify(config.customProxyGroups));
                            customProxyGroups = config.customProxyGroups;
                        }

                        if (config.settings?.autoSelect !== undefined) {
                            autoSelect = config.settings.autoSelect;
                        }

                        this.saveExportedConfig(this.importName || '导入的配置', config);

                        this.showImportModal = false;
                        this.importContent = '';
                        this.importName = '';
                        this.importSuccess = true;

                        setTimeout(() => {
                            this.importSuccess = false;
                        }, 3000);
                    } catch (e) {
                        this.importError = e.message;
                    }
                },

                loadExportedConfig(id) {
                    const config = this.exportedConfigs.find(c => c.id === id);
                    if (!config) return;

                    try {
                        const data = config.data || config.config || config;

                        if (data.input) {
                            input = data.input;
                        } else if (typeof data === 'string') {
                            input = data;
                        }

                        if (data.customProxyNames) {
                            localStorage.setItem('customProxyNames', JSON.stringify(data.customProxyNames));
                            customProxyNames = data.customProxyNames;
                        }

                        if (data.customProxyGroups) {
                            localStorage.setItem('customProxyGroups', JSON.stringify(data.customProxyGroups));
                            customProxyGroups = data.customProxyGroups;
                        }

                        if (data.settings?.autoSelect !== undefined) {
                            autoSelect = data.settings.autoSelect;
                        }

                        alert(t('configLoaded') || '配置已加载！');
                    } catch (e) {
                        alert(t('loadConfigError') || '加载配置失败：' + e.message);
                    }
                },

                deleteExportedConfig(id, event) {
                    event.stopPropagation();
                    if (confirm(t('confirmDeleteConfig') || '确定删除此配置？')) {
                        this.exportedConfigs = this.exportedConfigs.filter(c => c.id !== id);
                        localStorage.setItem('exportedConfigs', JSON.stringify(this.exportedConfigs));
                    }
                },

                formatDate(timestamp) {
                    if (!timestamp) return '';
                    const date = new Date(timestamp);
                    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-file-import text-gray-400"></i>
                    {t('importExportConfig') || '配置导入导出'}
                </h3>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
                <button
                    type="button"
                    x-on:click="exportToFile()"
                    class="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                    <i class="fas fa-file-export"></i>
                    {t('exportToFile') || '导出到文件'}
                </button>
                <button
                    type="button"
                    x-on:click="importFromFile()"
                    class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                    <i class="fas fa-file-import"></i>
                    {t('importFromFile') || '从文件导入'}
                </button>
            </div>

            <div x-show="exportedConfigs.length > 0" class="space-y-3">
                <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('savedConfigs') || '已保存的配置'}
                </h4>
                <div class="space-y-2 max-h-48 overflow-y-auto">
                    <template x-for="config in exportedConfigs" x-bind:key="config.id">
                        <div
                            class="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                            x-on:click="loadExportedConfig(config.id)"
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium text-gray-900 dark:text-white truncate" x-text="config.name"></div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400" x-text="formatDate(config.createdAt)"></div>
                                </div>
                                <button
                                    type="button"
                                    x-on:click="deleteExportedConfig(config.id, $event)"
                                    class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                    title={t('delete')}
                                >
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <div x-show="exportedConfigs.length === 0" class="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <i class="fas fa-folder-open text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{t('noSavedConfigs') || '暂无保存的配置'}</p>
            </div>

            {/* Import Modal */}
            <div
                x-show="showImportModal"
                x-transition:enter="transition ease-out duration-200"
                x-transition:enter-start="opacity-0"
                x-transition:enter-end="opacity-100"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                x-on:click="showImportModal = false"
            >
                <div
                    x-transition:enter="transition ease-out duration-200"
                    x-transition:enter-start="opacity-0 scale-95"
                    x-transition:enter-end="opacity-100 scale-100"
                    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                    x-on:click="$event.stopPropagation()"
                >
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('importConfig') || '导入配置'}
                        </h3>
                        <button
                            type="button"
                            x-on:click="showImportModal = false"
                            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="space-y-4 flex-1 overflow-hidden flex flex-col">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('configName') || '配置名称'}
                            </label>
                            <input
                                type="text"
                                x-model="importName"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div class="flex-1 overflow-hidden">
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('configContent') || '配置内容'}
                            </label>
                            <textarea
                                x-model="importContent"
                                rows="10"
                                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm resize-none"
                            ></textarea>
                        </div>

                        <div x-show="importError" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            <span x-text="importError"></span>
                        </div>

                        <div x-show="importSuccess" class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
                            <i class="fas fa-check-circle mr-1"></i>
                            <span>{t('importSuccess') || '导入成功！'}</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            x-on:click="showImportModal = false"
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            {t('cancel') || '取消'}
                        </button>
                        <button
                            type="button"
                            x-on:click="applyImport()"
                            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                        >
                            {t('apply') || '应用'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
