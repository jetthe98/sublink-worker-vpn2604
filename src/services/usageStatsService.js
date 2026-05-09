export class UsageStatsService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
        this.keyPrefix = 'stats:';
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Usage stats service requires a KV store');
        }
        return this.kv;
    }

    async recordConversion(userId, details = {}) {
        const kv = this.ensureKv();
        const today = new Date().toISOString().split('T')[0];
        const month = today.substring(0, 7);

        // 总转换次数
        const totalKey = `${this.keyPrefix}${userId}:conversions:total`;
        const total = parseInt(await kv.get(totalKey) || '0', 10);
        await kv.put(totalKey, (total + 1).toString());

        // 今日转换次数
        const dailyKey = `${this.keyPrefix}${userId}:conversions:daily:${today}`;
        const daily = parseInt(await kv.get(dailyKey) || '0', 10);
        await kv.put(dailyKey, (daily + 1).toString(), { expirationTtl: 86400 * 30 });

        // 按格式统计
        if (details.format) {
            const formatKey = `${this.keyPrefix}${userId}:conversions:format:${details.format}`;
            const formatCount = parseInt(await kv.get(formatKey) || '0', 10);
            await kv.put(formatKey, (formatCount + 1).toString());
        }

        // 按规则集统计
        if (details.ruleSet) {
            const ruleKey = `${this.keyPrefix}${userId}:conversions:ruleset:${details.ruleSet}`;
            const ruleCount = parseInt(await kv.get(ruleKey) || '0', 10);
            await kv.put(ruleKey, (ruleCount + 1).toString());
        }

        // 保存最近记录
        const recentKey = `${this.keyPrefix}${userId}:conversions:recent`;
        const recent = await this.getRecentConversions(userId, 99);
        recent.unshift({
            timestamp: Date.now(),
            ...details
        });
        await kv.put(recentKey, JSON.stringify(recent.slice(0, 100)), { expirationTtl: 86400 * 7 });

        return { total: total + 1, daily: daily + 1 };
    }

    async getStats(userId) {
        const kv = this.ensureKv();
        const today = new Date().toISOString().split('T')[0];

        const totalKey = `${this.keyPrefix}${userId}:conversions:total`;
        const dailyKey = `${this.keyPrefix}${userId}:conversions:daily:${today}`;

        const total = parseInt(await kv.get(totalKey) || '0', 10);
        const daily = parseInt(await kv.get(dailyKey) || '0', 10);

        // 获取格式统计
        const formatStats = {};
        const formatPrefix = `${this.keyPrefix}${userId}:conversions:format:`;
        const formatList = await kv.list({ prefix: formatPrefix });
        for (const key of formatList.keys) {
            const format = key.name.substring(formatPrefix.length);
            formatStats[format] = parseInt(await kv.get(key.name) || '0', 10);
        }

        return {
            total,
            today: daily,
            formatStats,
            recent: await this.getRecentConversions(userId, 10)
        };
    }

    async getRecentConversions(userId, limit = 10) {
        const kv = this.ensureKv();
        const recentKey = `${this.keyPrefix}${userId}:conversions:recent`;
        const data = await kv.get(recentKey);
        if (!data) return [];
        try {
            const recent = JSON.parse(data);
            return recent.slice(0, limit);
        } catch {
            return [];
        }
    }

    async recordNodeUsage(userId, nodeName) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}:nodes:${nodeName}`;
        const count = parseInt(await kv.get(key) || '0', 10);
        await kv.put(key, (count + 1).toString());
        return count + 1;
    }

    async getMostUsedNodes(userId, limit = 10) {
        const kv = this.ensureKv();
        const prefix = `${this.keyPrefix}${userId}:nodes:`;
        const list = await kv.list({ prefix });

        const nodes = [];
        for (const key of list.keys) {
            const nodeName = key.name.substring(prefix.length);
            const count = parseInt(await kv.get(key.name) || '0', 10);
            nodes.push({ name: nodeName, count });
        }

        nodes.sort((a, b) => b.count - a.count);
        return nodes.slice(0, limit);
    }

    async clearStats(userId) {
        const kv = this.ensureKv();
        const prefix = `${this.keyPrefix}${userId}:`;
        const list = await kv.list({ prefix });

        for (const key of list.keys) {
            await kv.delete(key.name);
        }

        return { cleared: list.keys.length };
    }
}
