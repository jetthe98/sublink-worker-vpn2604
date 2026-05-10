/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

export const SubscribeLinks = (props) => {
    const { t, links } = props;

    if (!links) return null;

    return (
        <div x-data="{
            copied: null,
            showQR: false,
            qrCanvas: null,
            currentLink: '',
            currentLabel: '',

            async generateQR(label, url) {
                this.currentLabel = label;
                this.currentLink = url;
                this.qrCanvas = null;
                this.showQR = true;

                await this.$nextTick();

                setTimeout(async () => {
                    try {
                        const QRCode = await import('qrcode');
                        const canvas = document.getElementById('qr-canvas');
                        if (canvas) {
                            await QRCode.toCanvas(canvas, url, {
                                width: 256,
                                margin: 2,
                                color: {
                                    dark: '#1f2937',
                                    light: '#ffffff'
                                }
                            });
                            this.qrCanvas = canvas;
                        }
                    } catch (e) {
                        console.error('QR generation failed:', e);
                    }
                }, 100);
            },

            downloadQR() {
                if (!this.qrCanvas) return;
                const link = document.createElement('a');
                link.download = `${this.currentLabel}-qr.png`;
                link.href = this.qrCanvas.toDataURL('image/png');
                link.click();
            },

            copyLink() {
                window.$clipboard(this.currentLink);
                this.copied = 'qr';
                setTimeout(() => this.copied = null, 2000);
            }
        }" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8 transition-all duration-300 hover:shadow-md">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <span class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <i class="fas fa-link text-sm"></i>
                </span>
                {t('subscriptionLinks')}
            </h2>

            <div class="space-y-4">
                {/* Xray Link */}
                <div class="relative group">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('xrayLink')}
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            readonly
                            value={links.xray}
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                        />
                        <button
                            type="button"
                            x-on:click={`$clipboard('${links.xray}'); copied = 'xray'; setTimeout(() => copied = null, 2000)`}
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                            x-bind:class="{'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': copied === 'xray'}"
                        >
                            <i class="fas" x-bind:class="copied === 'xray' ? 'fa-check' : 'fa-copy'"></i>
                        </button>
                        <button
                            type="button"
                            x-on:click="generateQR('{t('xrayLink')}', '{links.xray}')"
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                            title={t('generateQR')}
                        >
                            <i class="fas fa-qrcode"></i>
                        </button>
                    </div>
                </div>

                {/* SingBox Link */}
                <div class="relative group">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('singboxLink')}
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            readonly
                            value={links.singbox}
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                        />
                        <button
                            type="button"
                            x-on:click={`$clipboard('${links.singbox}'); copied = 'singbox'; setTimeout(() => copied = null, 2000)`}
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                            x-bind:class="{'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': copied === 'singbox'}"
                        >
                            <i class="fas" x-bind:class="copied === 'singbox' ? 'fa-check' : 'fa-copy'"></i>
                        </button>
                        <button
                            type="button"
                            x-on:click="generateQR('{t('singboxLink')}', '{links.singbox}')"
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                            title={t('generateQR')}
                        >
                            <i class="fas fa-qrcode"></i>
                        </button>
                    </div>
                </div>

                {/* Clash Link */}
                <div class="relative group">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('clashLink')}
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            readonly
                            value={links.clash}
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                        />
                        <button
                            type="button"
                            x-on:click={`$clipboard('${links.clash}'); copied = 'clash'; setTimeout(() => copied = null, 2000)`}
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                            x-bind:class="{'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': copied === 'clash'}"
                        >
                            <i class="fas" x-bind:class="copied === 'clash' ? 'fa-check' : 'fa-copy'"></i>
                        </button>
                        <button
                            type="button"
                            x-on:click="generateQR('{t('clashLink')}', '{links.clash}')"
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                            title={t('generateQR')}
                        >
                            <i class="fas fa-qrcode"></i>
                        </button>
                    </div>
                </div>

                {/* Surge Link */}
                <div class="relative group">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('surgeLink')}
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            readonly
                            value={links.surge}
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
                        />
                        <button
                            type="button"
                            x-on:click={`$clipboard('${links.surge}'); copied = 'surge'; setTimeout(() => copied = null, 2000)`}
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                            x-bind:class="{'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': copied === 'surge'}"
                        >
                            <i class="fas" x-bind:class="copied === 'surge' ? 'fa-check' : 'fa-copy'"></i>
                        </button>
                        <button
                            type="button"
                            x-on:click="generateQR('{t('surgeLink')}', '{links.surge}')"
                            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                            title={t('generateQR')}
                        >
                            <i class="fas fa-qrcode"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            <div
                x-show="showQR"
                x-transition:enter="transition ease-out duration-200"
                x-transition:enter-start="opacity-0"
                x-transition:enter-end="opacity-100"
                x-transition:leave="transition ease-in duration-150"
                x-transition:leave-start="opacity-100"
                x-transition:leave-end="opacity-0"
                class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                x-on:click="showQR = false"
            >
                <div
                    x-transition:enter="transition ease-out duration-200"
                    x-transition:enter-start="opacity-0 scale-95"
                    x-transition:enter-end="opacity-100 scale-100"
                    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full"
                    x-on:click="$event.stopPropagation()"
                >
                    <div class="text-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white" x-text="currentLabel"></h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">{t('qrCode')}</p>
                    </div>

                    <div class="flex justify-center mb-4 bg-white p-4 rounded-xl">
                        <canvas id="qr-canvas"></canvas>
                    </div>

                    <div class="flex gap-3">
                        <button
                            type="button"
                            x-on:click="downloadQR()"
                            class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <i class="fas fa-download"></i>
                            {t('download')}
                        </button>
                        <button
                            type="button"
                            x-on:click="copyLink()"
                            class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2"
                            x-bind:class="{'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': copied === 'qr'}"
                        >
                            <i class="fas" x-bind:class="copied === 'qr' ? 'fa-check' : 'fa-copy'"></i>
                            <span x-text="copied === 'qr' ? '{t('copied')}' : '{t('copyLink')}'"></span>
                        </button>
                        <button
                            type="button"
                            x-on:click="showQR = false"
                            class="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
