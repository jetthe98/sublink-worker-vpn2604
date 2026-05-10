/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const SubscriptionManager = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                subscriptions: [],
                showManager: false,
                showSaveDialog: false,
                newSubscriptionName: '',
                editingId: null,
                editingName: '',

                init() {
                    this.loadSubscriptions();
                },

                loadSubscriptions() {
                    try {
                        const saved = localStorage.getItem('savedSubscriptions');
                        this.subscriptions = saved ? JSON.parse(saved) : [];
                    } catch {
                        this.subscriptions = [];
                    }
                },

                saveCurrent() {
                    if (!this.input || !this.input.trim()) return;

                    const name = this.newSubscriptionName.trim() || this.generateDefaultName();
                    const sub = {
                        id: Date.now().toString(),
                        name: name,
                        config: this.input,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };

                    this.subscriptions.push(sub);
                    localStorage.setItem('savedSubscriptions', JSON.stringify(this.subscriptions));
                    localStorage.setItem('currentSubscriptionId', sub.id);

                    this.newSubscriptionName = '';
                    this.showSaveDialog = false;
                },

                generateDefaultName() {
                    const date = new Date();
                    return date.toLocaleDateString('zh-CN') + ' 订阅';
                },

                loadSubscription(id) {
                    const sub = this.subscriptions.find(s => s.id === id);
                    if (sub) {
                        this.input = sub.config;
                        localStorage.setItem('currentSubscriptionId', id);
                        this.showManager = false;
                    }
                },

                deleteSubscription(id, event) {
                    event.stopPropagation();
                    if (confirm(t('confirmDeleteSubscription') || '确定删除此订阅？')) {
                        this.subscriptions = this.subscriptions.filter(s => s.id !== id);
                        localStorage.setItem('savedSubscriptions', JSON.stringify(this.subscriptions));

                        if (localStorage.getItem('currentSubscriptionId') === id) {
                            localStorage.removeItem('currentSubscriptionId');
                        }
                    }
                },

                startEdit(id, name, event) {
                    event.stopPropagation();
                    this.editingId = id;
                    this.editingName = name;
                },

                saveEdit() {
                    if (this.editingId && this.editingName.trim()) {
                        const sub = this.subscriptions.find(s => s.id === this.editingId);
                        if (sub) {
                            sub.name = this.editingName.trim();
                            sub.updatedAt = Date.now();
                            localStorage.setItem('savedSubscriptions', JSON.stringify(this.subscriptions));
                        }
                    }
                    this.editingId = null;
                    this.editingName = '';
                },

                cancelEdit() {
                    this.editingId = null;
                    this.editingName = '';
                },

                isCurrent(id) {
                    return localStorage.getItem('currentSubscriptionId') === id;
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
                    <i class="fas fa-bookmark text-gray-400"></i>
                    {t('subscriptionManager')}
                </h3>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        x-on:click="showSaveDialog = true"
                        class="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        x-bind:disabled="!this.input || !this.input.trim()"
                        title={t('saveCurrentSubscription')}
                    >
                        <i class="fas fa-save"></i>
                        {t('save')}
                    </button>
                    <button
                        type="button"
                        x-on:click="showManager = !showManager"
                        class="px-3 py-1.5 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                        <i class="fas" x-bind:class="showManager ? 'fa-chevron-up' : 'fa-list'"></i>
                        <span x-text="subscriptions.length > 0 ? subscriptions.length : ''"></span>
                        {t('manage')}
                    </button>
                </div>
            </div>

            <div x-show="!showManager && subscriptions.length === 0" class="text-center py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <i class="fas fa-inbox text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{t('noSavedSubscriptions')}</p>
                <p class="text-gray-400 dark:text-gray-500 text-xs mt-1">{t('noSavedSubscriptionsTip')}</p>
            </div>

            <div x-show="subscriptions.length > 0 && !showManager" class="text-sm text-gray-500 dark:text-gray-400">
                <span x-text="subscriptions.length"></span> {t('savedSubscriptionsCount')}
                <template x-if="localStorage.getItem('currentSubscriptionId')">
                    <span class="ml-2 text-primary-600 dark:text-primary-400">
                        <i class="fas fa-check-circle"></i> {t('currentActive')}
                    </span>
                </template>
            </div>

            <div x-show="showManager" x-transition class="mt-4 space-y-3 max-h-64 overflow-y-auto">
                <template x-for="sub in subscriptions" x-bind:key="sub.id">
                    <div
                        class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        x-bind:class="isCurrent(sub.id) ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20' : ''"
                        x-on:click="loadSubscription(sub.id)"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex-1 min-w-0">
                                <template x-if="editingId !== sub.id">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium text-gray-900 dark:text-white truncate" x-text="sub.name"></span>
                                        <span x-show="isCurrent(sub.id)" class="px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded">
                                            {t('current')}
                                        </span>
                                    </div>
                                </template>
                                <template x-if="editingId === sub.id">
                                    <div class="flex items-center gap-2">
                                        <input
                                            type="text"
                                            x-model="editingName"
                                            x-on:keydown="if ($event.key === 'Enter') saveEdit(); if ($event.key === 'Escape') cancelEdit();"
                                            x-on:click="$event.stopPropagation()"
                                            class="flex-1 px-2 py-1 text-sm border border-primary-500 rounded focus:ring-2 focus:ring-primary-400 focus:outline-none dark:bg-gray-900 dark:text-white"
                                            x-init="$el.focus(); $el.select();"
                                        />
                                        <button type="button" x-on:click="saveEdit(); $event.stopPropagation();" class="p-1 text-green-600 hover:text-green-700">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button type="button" x-on:click="cancelEdit(); $event.stopPropagation();" class="p-1 text-gray-600 hover:text-gray-700">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </template>
                                <template x-if="editingId !== sub.id">
                                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span x-text="formatDate(sub.updatedAt || sub.createdAt)"></span>
                                        <span class="text-gray-300 dark:text-gray-600">|</span>
                                        <span x-text="(sub.config || '').length + ' ' + t('characters')"></span>
                                    </div>
                                </template>
                            </div>
                            <div class="flex items-center gap-1 ml-2" x-show="editingId !== sub.id">
                                <button
                                    type="button"
                                    x-on:click="startEdit(sub.id, sub.name, $event)"
                                    class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    title={t('rename')}
                                >
                                    <i class="fas fa-edit text-xs"></i>
                                </button>
                                <button
                                    type="button"
                                    x-on:click="deleteSubscription(sub.id, $event)"
                                    class="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title={t('delete')}
                                >
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>

            <div x-show="showSaveDialog" x-transition class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">{t('saveCurrentSubscription')}</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('subscriptionName')}</label>
                        <input
                            type="text"
                            x-model="newSubscriptionName"
                            x-on:keydown="if ($event.key === 'Enter') saveCurrent();"
                            placeholder={t('subscriptionNamePlaceholder')}
                            class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div class="flex justify-end gap-2">
                        <button
                            type="button"
                            x-on:click="showSaveDialog = false; newSubscriptionName = '';"
                            class="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="button"
                            x-on:click="saveCurrent()"
                            class="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        >
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
