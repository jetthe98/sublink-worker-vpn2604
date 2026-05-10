/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const SubscriptionInfo = (props) => {
    const { t } = props;

    return (
        <div
            x-data="{
                userInfo: null,
                loading: false,
                error: null,
                showDetails: false,

                async fetchSubscriptionInfo() {
                    if (!this.input || !this.input.trim()) {
                        this.userInfo = null;
                        return;
                    }

                    this.loading = true;
                    this.error = null;

                    try {
                        const response = await fetch(`/api/v1/subscription/info?url=${encodeURIComponent(this.input)}`);
                        const data = await response.json();

                        if (data.error) {
                            this.error = data.error;
                            this.userInfo = null;
                        } else {
                            this.userInfo = data;
                            localStorage.setItem('subscriptionUserInfo', JSON.stringify(data));
                        }
                    } catch (e) {
                        this.error = e.message;
                        this.userInfo = null;
                    }

                    this.loading = false;
                },

                formatBytes(bytes) {
                    if (!bytes && bytes !== 0) return '-';
                    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                    let unitIndex = 0;
                    let value = bytes;

                    while (value >= 1024 && unitIndex < units.length - 1) {
                        value /= 1024;
                        unitIndex++;
                    }

                    return `${value.toFixed(2)} ${units[unitIndex]}`;
                },

                formatDate(timestamp) {
                    if (!timestamp) return '-';
                    const date = new Date(timestamp * 1000);
                    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                },

                getUsedPercentage() {
                    if (!this.userInfo?.upload || !this.userInfo?.total) return 0;
                    const used = this.userInfo.upload + this.userInfo.download;
                    return Math.min(100, (used / this.userInfo.total) * 100);
                },

                getRemainingPercentage() {
                    return 100 - this.getUsedPercentage();
                },

                isExpiringSoon() {
                    if (!this.userInfo?.expiry) return false;
                    const now = Date.now() / 1000;
                    const daysLeft = (this.userInfo.expiry - now) / (24 * 60 * 60);
                    return daysLeft <= 3;
                },

                getDaysLeft() {
                    if (!this.userInfo?.expiry) return null;
                    const now = Date.now() / 1000;
                    const daysLeft = Math.ceil((this.userInfo.expiry - now) / (24 * 60 * 60));
                    return Math.max(0, daysLeft);
                }
            }"
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <i class="fas fa-chart-pie text-gray-400"></i>
                    {t('subscriptionInfo') || '订阅信息'}
                </h3>
                <button
                    type="button"
                    x-on:click="fetchSubscriptionInfo()"
                    class="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    x-bind:disabled="!this.input || !this.input.trim() || loading"
                >
                    <i class="fas" x-bind:class="loading ? 'fa-spinner fa-spin' : 'fa-sync'"></i>
                    {t('refresh') || '刷新'}
                </button>
            </div>

            <div x-show="!userInfo && !error && !loading" class="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <i class="fas fa-info-circle text-3xl text-gray-400 mb-3"></i>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{t('fetchSubscriptionInfoTip') || '点击刷新获取订阅信息'}</p>
            </div>

            <div x-show="error" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <i class="fas fa-exclamation-circle"></i>
                    <span x-text="error"></span>
                </div>
            </div>

            <div x-show="userInfo" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('totalTraffic') || '总流量'}</div>
                        <div class="text-xl font-bold text-gray-900 dark:text-white" x-text="formatBytes(userInfo.total)"></div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('usedTraffic') || '已用流量'}</div>
                        <div class="text-xl font-bold text-primary-600 dark:text-primary-400" x-text="formatBytes((userInfo.upload || 0) + (userInfo.download || 0))"></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{t('download') || '下载'}</span>
                        <span class="text-gray-900 dark:text-white font-medium" x-text="formatBytes(userInfo.download || 0)"></span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{t('upload') || '上传'}</span>
                        <span class="text-gray-900 dark:text-white font-medium" x-text="formatBytes(userInfo.upload || 0)"></span>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600 dark:text-gray-400">{t('remaining') || '剩余'}</span>
                        <span class="text-green-600 dark:text-green-400 font-medium" x-text="formatBytes(Math.max(0, (userInfo.total || 0) - (userInfo.upload || 0) - (userInfo.download || 0)))"></span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            class="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                            x-bind:style="'width: ' + getUsedPercentage() + '%'"
                        ></div>
                    </div>
                </div>

                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-gray-600 dark:text-gray-400">{t('expiryDate') || '到期时间'}</span>
                        <span
                            class="text-sm font-medium"
                            x-bind:class="isExpiringSoon() ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'"
                            x-text="formatDate(userInfo.expiry)"
                        ></span>
                    </div>
                    <template x-if="getDaysLeft() !== null">
                        <div class="flex items-center gap-2">
                            <span
                                class="px-2 py-1 text-xs font-medium rounded-full"
                                x-bind:class="getDaysLeft() <= 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : getDaysLeft() <= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'"
                            >
                                <template x-if="getDaysLeft() <= 0">
                                    <span>{t('expired') || '已过期'}</span>
                                </template>
                                <template x-if="getDaysLeft() > 0">
                                    <span x-text="getDaysLeft() + ' ' + (t('daysLeft') || '天剩余')"></span>
                                </template>
                            </span>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    );
};
