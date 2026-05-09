/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const NodeSelector = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                proxyLatencies: {},
                testingLatency: false,
                testingProgress: 0,
                sortByLatency: false,
                showGroupManager: false,

                async testProxyLatency(proxy) {
                    try {
                        const response = await fetch(`/api/v1/ping?server=${proxy.server}&port=${proxy.port || 443}&timeout=3000`);
                        const data = await response.json();
                        this.$set(this.proxyLatencies, proxy.name, {
                            latency: data.latency,
                            status: data.status,
                            error: data.error
                        });
                    } catch (e) {
                        this.$set(this.proxyLatencies, proxy.name, {
                            latency: null,
                            status: 'error',
                            error: e.message
                        });
                    }
                },

                async testAllLatencies() {
                    if (this.parsedProxies.length === 0) return;
                    this.testingLatency = true;
                    this.testingProgress = 0;
                    this.proxyLatencies = {};

                    for (let i = 0; i < this.parsedProxies.length; i++) {
                        const proxy = this.parsedProxies[i];
                        await this.testProxyLatency(proxy);
                        this.testingProgress = Math.round(((i + 1) / this.parsedProxies.length) * 100);
                    }

                    this.testingLatency = false;
                },

                getLatencyColor(latency) {
                    if (!latency) return 'text-gray-400';
                    if (latency < 100) return 'text-green-500';
                    if (latency < 300) return 'text-yellow-500';
                    return 'text-red-500';
                },

                getLatencyText(latency) {
                    if (!latency) return '-';
                    return latency + 'ms';
                },

                getSortedProxies() {
                    if (!this.sortByLatency) return this.parsedProxies;
                    return [...this.parsedProxies].sort((a, b) => {
                        const latA = this.proxyLatencies[a.name]?.latency ?? Infinity;
                        const latB = this.proxyLatencies[b.name]?.latency ?? Infinity;
                        return latA - latB;
                    });
                },

                isInGroup(groupId, proxyName) {
                    const group = this.customProxyGroups.find(g => g.id === groupId);
                    return group ? group.proxies.includes(proxyName) : false;
                },

                toggleProxyInGroup(groupId, proxyName) {
                    if (this.isInGroup(groupId, proxyName)) {
                        this.removeFromProxyGroup(groupId, proxyName);
                    } else {
                        this.addToProxyGroup(groupId, proxyName);
                    }
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-server text-gray-400"></i>
                    {t('nodeSelector')}
                </h3>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        x-on:click="testAllLatencies()"
                        class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                        x-bind:disabled="parsedProxies.length === 0 || testingLatency"
                    >
                        <i class="fas" x-bind:class="testingLatency ? 'fa-spinner fa-spin' : 'fa-bolt'"></i>
                        <span x-text="testingLatency ? `${testingProgress}%` : '延迟测试'">延迟测试</span>
                    </button>
                    <button
                        type="button"
                        x-on:click="showGroupManager = !showGroupManager"
                        class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                    >
                        <i class="fas fa-layer-group"></i>
                        <span>分组</span>
                        <span x-text="customProxyGroups.length > 0 ? `(${customProxyGroups.length})` : ''"></span>
                    </button>
                    <button
                        type="button"
                        x-on:click="parseProxies()"
                        class="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center gap-2 text-sm"
                        x-bind:disabled="!input || parsingProxies"
                    >
                        <i class="fas" x-bind:class="parsingProxies ? 'fa-spinner fa-spin' : 'fa-search'"></i>
                        <span x-text="parsingProxies ? '解析中...' : '解析'">解析</span>
                    </button>
                </div>
            </div>

            <div x-show="parsedProxies.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <i class="fas fa-cloud-server text-2xl"></i>
                </div>
                <p class="text-gray-500 dark:text-gray-400 mb-2">暂无解析的节点</p>
                <p class="text-sm text-gray-400 dark:text-gray-500">点击解析按钮加载节点</p>
            </div>

            <div x-show="parsedProxies.length > 0" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 transform scale-95" x-transition:enter-end="opacity-100 transform scale-100">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-500 dark:text-gray-400" x-text="`已选择 ${selectedProxyNames.length}/${parsedProxies.length}`"></span>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" x-model="sortByLatency" class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span class="text-sm text-gray-600 dark:text-gray-400">按延迟排序</span>
                        </label>
                    </div>
                    <div class="flex gap-2">
                        <button
                            type="button"
                            x-on:click="selectAllProxies()"
                            class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            全选
                        </button>
                        <button
                            type="button"
                            x-on:click="deselectAllProxies()"
                            class="px-3 py-1.5 text-sm font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                            取消全选
                        </button>
                    </div>
                </div>

                <div class="space-y-2 max-h-96 overflow-y-auto pr-2">
                    <template x-for="proxy in getSortedProxies()" x-bind:key="proxy.name">
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
                                    <span>:</span>
                                    <span x-text="proxy.port"></span>
                                </div>
                            </div>
                            <div class="ml-3 flex items-center gap-3">
                                <template x-if="proxyLatencies[proxy.name]">
                                    <div class="flex items-center gap-1">
                                        <template x-if="proxyLatencies[proxy.name].status === 'unreachable' || proxyLatencies[proxy.name].status === 'error'">
                                            <span class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                                                不可达
                                            </span>
                                        </template>
                                        <template x-if="proxyLatencies[proxy.name].status === 'reachable'">
                                            <span class="px-2 py-1 text-xs font-medium rounded" x-bind:class="getLatencyColor(proxyLatencies[proxy.name].latency) + ' bg-gray-100 dark:bg-gray-700'" x-text="getLatencyText(proxyLatencies[proxy.name].latency)"></span>
                                        </template>
                                    </div>
                                </template>
                                <template x-if="!proxyLatencies[proxy.name]">
                                    <span class="text-gray-400 text-xs">-</span>
                                </template>
                                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i class="fas fa-chevron-right text-gray-400"></i>
                                </div>
                            </div>
                        </label>
                    </template>
                </div>

                <div x-show="testingLatency" class="mt-4">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            x-bind:style="`width: ${testingProgress}%`"
                        ></div>
                    </div>
                </div>

                <div x-show="showGroupManager" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <i class="fas fa-layer-group text-purple-500"></i>
                            节点分组管理
                        </h4>
                        <button
                            type="button"
                            x-on:click="createProxyGroup()"
                            class="px-3 py-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                            <i class="fas fa-plus"></i>
                            新建分组
                        </button>
                    </div>

                    <div x-show="customProxyGroups.length === 0" class="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                        <p class="text-gray-500 dark:text-gray-400 text-sm">暂无分组，点击上方按钮创建</p>
                    </div>

                    <div class="space-y-3 max-h-64 overflow-y-auto">
                        <template x-for="group in customProxyGroups" x-bind:key="group.id">
                            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <input
                                        type="text"
                                        x-model="group.name"
                                        placeholder="分组名称"
                                        class="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                    <div class="flex items-center gap-2 ml-3">
                                        <button
                                            type="button"
                                            x-on:click="addSelectedToGroup(group.id)"
                                            class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                            title="添加已选节点"
                                        >
                                            + 已选
                                        </button>
                                        <button
                                            type="button"
                                            x-on:click="selectGroupProxies(group.id)"
                                            class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                                            title="选中分组节点"
                                        >
                                            选中
                                        </button>
                                        <button
                                            type="button"
                                            x-on:click="deleteProxyGroup(group.id)"
                                            class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                                            title="删除分组"
                                        >
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <template x-for="proxyName in group.proxies" x-bind:key="proxyName">
                                        <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                            <span x-text="proxyName" class="max-w-24 truncate"></span>
                                            <button type="button" x-on:click="removeFromProxyGroup(group.id, proxyName)" class="hover:text-red-500">
                                                <i class="fas fa-times text-xs"></i>
                                            </button>
                                        </span>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    );
};
