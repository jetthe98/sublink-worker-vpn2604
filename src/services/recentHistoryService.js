export class RecentHistoryService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
        this.keyPrefix = 'history:';
        this.maxItems = options.maxHistoryItems || 50;
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Recent history service requires a KV store');
        }
        return this.kv;
    }

    async add(userId, item) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const history = await this.getRecent(userId, this.maxItems);

        // 去重：如果相同的订阅链接已存在，先移除旧的
        const existingIndex = history.findIndex(h => {
            if (item.config && h.config === item.config) return true;
            if (item.subscriptionUrl && h.subscriptionUrl === item.subscriptionUrl) return true;
            return false;
        });
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }

        const entry = {
            ...item,
            id: this.generateId(),
            accessedAt: Date.now()
        };

        history.unshift(entry);

        // 只保留最近 N 条
        const trimmed = history.slice(0, this.maxItems);
        await kv.put(key, JSON.stringify(trimmed), { expirationTtl: 86400 * 90 });

        return entry;
    }

    async getRecent(userId, limit = 10) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const data = await kv.get(key);
        if (!data) return [];
        try {
            const history = JSON.parse(data);
            return history.slice(0, limit);
        } catch {
            return [];
        }
    }

    async updateAccessTime(userId, entryId) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const history = await this.getRecent(userId, this.maxItems);

        const entry = history.find(h => h.id === entryId);
        if (entry) {
            entry.accessedAt = Date.now();
            entry.accessCount = (entry.accessCount || 0) + 1;
            await kv.put(key, JSON.stringify(history), { expirationTtl: 86400 * 90 });
            return true;
        }
        return false;
    }

    async remove(userId, entryId) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const history = await this.getRecent(userId, this.maxItems);

        const index = history.findIndex(h => h.id === entryId);
        if (index === -1) {
            return { removed: false, reason: 'not_found' };
        }

        history.splice(index, 1);
        await kv.put(key, JSON.stringify(history), { expirationTtl: 86400 * 90 });
        return { removed: true };
    }

    async clear(userId) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        await kv.delete(key);
        return { cleared: true };
    }

    generateId() {
        return Math.random().toString(36).substring(2, 10);
    }
}
