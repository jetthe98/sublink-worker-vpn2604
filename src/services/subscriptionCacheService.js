export class SubscriptionCacheService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
        this.keyPrefix = 'subcache:';
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Subscription cache service requires a KV store');
        }
        return this.kv;
    }

    generateCacheKey(url) {
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `cache_${Math.abs(hash).toString(36)}`;
    }

    async get(url) {
        const kv = this.ensureKv();
        const cacheKey = this.generateCacheKey(url);
        const fullKey = `${this.keyPrefix}${cacheKey}`;
        const cached = await kv.get(fullKey);
        if (!cached) return null;

        try {
            const data = JSON.parse(cached);
            const now = Date.now();

            if (data.expiresAt && data.expiresAt < now) {
                await kv.delete(fullKey);
                return null;
            }

            return data;
        } catch {
            return null;
        }
    }

    async set(url, content, options = {}) {
        const kv = this.ensureKv();
        const cacheKey = this.generateCacheKey(url);
        const fullKey = `${this.keyPrefix}${cacheKey}`;

        const ttl = options.ttl || this.options.cacheTtlSeconds || 3600;
        const now = Date.now();

        const data = {
            url,
            content,
            fetchedAt: now,
            expiresAt: now + (ttl * 1000),
            size: content.length,
            etag: options.etag || null,
            lastModified: options.lastModified || null
        };

        const putOptions = ttl ? { expirationTtl: ttl } : undefined;
        await kv.put(fullKey, JSON.stringify(data), putOptions);

        // 保存 URL 到缓存索引
        await this.addToIndex(url, cacheKey, ttl);

        return data;
    }

    async addToIndex(url, cacheKey, ttl) {
        const kv = this.ensureKv();
        const indexKey = `${this.keyPrefix}index`;
        const index = await this.getIndex();
        index[url] = { cacheKey, cachedAt: Date.now(), ttl };
        await kv.put(indexKey, JSON.stringify(index), { expirationTtl: ttl * 2 });
    }

    async getIndex() {
        const kv = this.ensureKv();
        const indexKey = `${this.keyPrefix}index`;
        const data = await kv.get(indexKey);
        return data ? JSON.parse(data) : {};
    }

    async invalidate(url) {
        const kv = this.ensureKv();
        const index = await this.getIndex();

        if (index[url]) {
            const fullKey = `${this.keyPrefix}${index[url].cacheKey}`;
            await kv.delete(fullKey);
            delete index[url];
            const indexKey = `${this.keyPrefix}index`;
            await kv.put(indexKey, JSON.stringify(index));
            return true;
        }
        return false;
    }

    async clear() {
        const kv = this.ensureKv();
        const index = await this.getIndex();

        for (const url of Object.keys(index)) {
            const fullKey = `${this.keyPrefix}${index[url].cacheKey}`;
            await kv.delete(fullKey);
        }

        const indexKey = `${this.keyPrefix}index`;
        await kv.delete(indexKey);

        return { cleared: Object.keys(index).length };
    }

    async getStats() {
        const index = await this.getIndex();
        const entries = Object.values(index);
        const now = Date.now();

        let totalSize = 0;
        let expiredCount = 0;

        for (const entry of entries) {
            const fullKey = `${this.keyPrefix}${entry.cacheKey}`;
            const cached = await this.kv.get(fullKey);
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    totalSize += data.size || 0;
                    if (data.expiresAt && data.expiresAt < now) {
                        expiredCount++;
                    }
                } catch {
                    expiredCount++;
                }
            } else {
                expiredCount++;
            }
        }

        return {
            totalUrls: entries.length,
            totalSize,
            expiredCount,
            activeCount: entries.length - expiredCount
        };
    }
}
