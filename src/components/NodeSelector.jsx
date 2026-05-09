/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const NodeSelector = (props) => {
    const { t } = props;

    return (
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-server text-gray-400"></i>
                    {t('nodeSelector')}
                </h3>
                <button
                    type="button"
                    x-on:click="parseProxies()"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                    x-bind:disabled="!input || parsingProxies"
                >
                    <i class="fas" x-bind:class="parsingProxies ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                    <span x-text="parsingProxies ? 'Parsing...' : 'Parse'">{t('parseNodes')}</span>
                </button>
            </div>

            <div x-show="parsedProxies.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <i class="fas fa-cloud-server text-2xl"></i>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-2">{t('noNodesParsed')}</p>
                <p class="text-sm text-gray-400 dark:text-gray-500">{t('clickParseToLoad')}</p>
            </div>

            <div x-show="parsedProxies.length > 0" {...{
                'x-transition:enter': 'transition ease-out duration-300',
                'x-transition:enter-start': 'opacity-0 transform scale-95',
                'x-transition:enter-end': 'opacity-100 transform scale-100'
            }}>
                <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {t('selectedCount', { count: selectedProxyNames.length, total: parsedProxies.length })}
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            x-on:click="selectAllProxies()"
                            class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t('selectAll')}
                        </button>
                        <button
                            type="button"
                            x-on:click="deselectAllProxies()"
                            class="px-3 py-1.5 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                            {t('deselectAll')}
                        </button>
                    </div>
                </div>

                <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                    <template x-for="proxy in parsedProxies" x-bind:key="proxy.name">
                        <label
                            class="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 group"
                            x-bind:class="{ 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700': isProxySelected(proxy.name) }"
                        >
                            <input
                                type="checkbox"
                                x-on:click="toggleProxySelection(proxy.name)"
                                x-bind:checked="isProxySelected(proxy.name)"
                                class="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div class="ml-3 flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium text-gray-900 dark:text-white truncate" x-text="proxy.name"></span>
                                    <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full" x-text="proxy.protocol?.toUpperCase() || 'Unknown'"></span>
                                </div>
                                <div class="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span x-text="proxy.server"></span>
                                    <span x-text="proxy.port"></span>
                                </div>
                            </div>
                            <div class="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <i class="fas fa-chevron-right text-gray-400"></i>
                            </div>
                        </label>
                    </template>
                </div>
            </div>
        </div>
    );
};
