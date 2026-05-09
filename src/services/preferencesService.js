export class PreferencesService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
        this.keyPrefix = 'prefs:';
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Preferences service requires a KV store');
        }
        return this.kv;
    }

    async get(userId, key, defaultValue = null) {
        const kv = this.ensureKv();
        const fullKey = `${this.keyPrefix}${userId}:${key}`;
        const value = await kv.get(fullKey);
        return value ? JSON.parse(value) : defaultValue;
    }

    async set(userId, key, value) {
        const kv = this.ensureKv();
        const fullKey = `${this.keyPrefix}${userId}:${key}`;
        const ttl = this.options.preferencesTtlSeconds;
        const putOptions = ttl ? { expirationTtl: ttl } : undefined;
        await kv.put(fullKey, JSON.stringify(value), putOptions);
        return value;
    }

    async delete(userId, key) {
        const kv = this.ensureKv();
        const fullKey = `${this.keyPrefix}${userId}:${key}`;
        await kv.delete(fullKey);
    }

    async getAll(userId) {
        const kv = this.ensureKv();
        const prefix = `${this.keyPrefix}${userId}:`;
        const list = await kv.list({ prefix });
        const prefs = {};
        for (const key of list.keys) {
            const shortKey = key.name.substring(prefix.length);
            const value = await kv.get(key.name);
            prefs[shortKey] = value ? JSON.parse(value) : null;
        }
        return prefs;
    }

    // 常用偏好设置快捷方法
    async getDefaultRuleSet(userId) {
        return this.get(userId, 'defaultRuleSet', 'balanced');
    }

    async setDefaultRuleSet(userId, ruleSet) {
        return this.set(userId, 'defaultRuleSet', ruleSet);
    }

    async getDefaultFormat(userId) {
        return this.get(userId, 'defaultFormat', 'surge');
    }

    async setDefaultFormat(userId, format) {
        return this.set(userId, 'defaultFormat', format);
    }

    async getTheme(userId) {
        return this.get(userId, 'theme', 'system');
    }

    async setTheme(userId, theme) {
        return this.set(userId, 'theme', theme);
    }

    async getLanguage(userId) {
        return this.get(userId, 'language', 'zh-CN');
    }

    async setLanguage(userId, language) {
        return this.set(userId, 'language', language);
    }

    async getCustomHeaders(userId) {
        return this.get(userId, 'customHeaders', {});
    }

    async setCustomHeaders(userId, headers) {
        return this.set(userId, 'customHeaders', headers);
    }
}
