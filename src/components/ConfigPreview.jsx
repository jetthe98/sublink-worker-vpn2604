/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const ConfigPreview = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                showPreview: false,
                previewContent: '',
                previewType: 'singbox',
                previewLoading: false,
                previewError: null,
                proxyCount: 0,
                ruleCount: 0,

                async openPreview() {
                    if (!input || !input.trim()) {
                        previewError = '请先输入订阅内容';
                        return;
                    }

                    previewType = configType;
                    previewLoading = true;
                    previewError = null;

                    try {
                        const customRulesInput = document.querySelector('input[name=\'customRules\']');
                        const customRules = customRulesInput && customRulesInput.value ? JSON.parse(customRulesInput.value) : [];

                        const response = await fetch('/api/v1/preview', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                input: input,
                                configType: configType,
                                selectedRules: JSON.stringify(selectedRules),
                                customRules: JSON.stringify(customRules),
                                groupByCountry: groupByCountry,
                                includeAutoSelect: includeAutoSelect,
                                selectedProxies: JSON.stringify(selectedProxyNames)
                            })
                        });

                        if (!response.ok) {
                            throw new Error('预览生成失败');
                        }

                        const data = await response.json();
                        previewContent = data.content;
                        proxyCount = data.proxyCount;
                        ruleCount = data.ruleCount;
                        showPreview = true;
                    } catch (e) {
                        previewError = e.message;
                    } finally {
                        previewLoading = false;
                    }
                },

                closePreview() {
                    showPreview = false;
                    previewContent = '';
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-eye text-gray-400"></i>
                    {t('configPreview')}
                </h3>
                <button
                    type="button"
                    x-on:click="openPreview()"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                    x-bind:disabled="!input || previewLoading"
                >
                    <i class="fas" x-bind:class="previewLoading ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                    <span x-text="previewLoading ? '生成中...' : '预览配置'">{t('preview')}</span>
                </button>
            </div>

            <div x-show="previewError" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-red-600 dark:text-red-400 text-sm" x-text="previewError"></p>
            </div>

            <template x-if="showPreview">
                <div
                    x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0"
                    x-transition:enter-end="opacity-100"
                    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                >
                    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{t('configPreview')}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span x-text="proxyCount"></span> {t('nodes')} · <span x-text="ruleCount"></span> {t('rules')}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <button
                                    type="button"
                                    x-on:click="navigator.clipboard.writeText(previewContent)"
                                    class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                                >
                                    <i class="fas fa-copy"></i>
                                    {t('copy')}
                                </button>
                                <button
                                    type="button"
                                    x-on:click="closePreview()"
                                    class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('close')}
                                </button>
                            </div>
                        </div>
                        <div class="flex-1 overflow-auto p-4">
                            <pre class="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-[70vh] whitespace-pre-wrap font-mono" x-text="previewContent"></pre>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    );
};
