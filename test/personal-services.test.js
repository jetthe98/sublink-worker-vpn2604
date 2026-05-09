import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryKVAdapter } from '../src/adapters/kv/memoryKv.js';
import { PreferencesService } from '../src/services/preferencesService.js';
import { SubscriptionCacheService } from '../src/services/subscriptionCacheService.js';
import { UsageStatsService } from '../src/services/usageStatsService.js';
import { FavoriteNodesService } from '../src/services/favoriteNodesService.js';
import { RecentHistoryService } from '../src/services/recentHistoryService.js';

describe('Personal Memory Services', () => {
    let kv;
    const userId = 'test-user';

    beforeEach(() => {
        kv = new MemoryKVAdapter();
    });

    describe('PreferencesService', () => {
        it('stores and retrieves preferences', async () => {
            const prefs = new PreferencesService(kv);
            await prefs.set(userId, 'theme', 'dark');
            const value = await prefs.get(userId, 'theme');
            expect(value).toBe('dark');
        });

        it('returns default value when key not found', async () => {
            const prefs = new PreferencesService(kv);
            const value = await prefs.get(userId, 'unknown', 'default');
            expect(value).toBe('default');
        });

        it('gets all preferences', async () => {
            const prefs = new PreferencesService(kv);
            await prefs.set(userId, 'theme', 'dark');
            await prefs.set(userId, 'language', 'zh-CN');
            const all = await prefs.getAll(userId);
            expect(all).toHaveProperty('theme', 'dark');
            expect(all).toHaveProperty('language', 'zh-CN');
        });

        it('has shortcut methods for common prefs', async () => {
            const prefs = new PreferencesService(kv);
            await prefs.setDefaultFormat(userId, 'clash');
            const format = await prefs.getDefaultFormat(userId);
            expect(format).toBe('clash');
        });
    });

    describe('SubscriptionCacheService', () => {
        it('caches and retrieves subscription content', async () => {
            const cache = new SubscriptionCacheService(kv);
            const url = 'https://example.com/sub';
            const content = 'ss://abc123@server:443#Node';
            
            await cache.set(url, content, { ttl: 3600 });
            const cached = await cache.get(url);
            
            expect(cached).not.toBeNull();
            expect(cached.content).toBe(content);
            expect(cached.url).toBe(url);
        });

        it('returns null for expired cache', async () => {
            const cache = new SubscriptionCacheService(kv);
            const url = 'https://example.com/sub';
            
            await cache.set(url, 'content', { ttl: -1 }); // Already expired
            const cached = await cache.get(url);
            
            expect(cached).toBeNull();
        });

        it('invalidates specific cache entry', async () => {
            const cache = new SubscriptionCacheService(kv);
            const url = 'https://example.com/sub';
            
            await cache.set(url, 'content', { ttl: 3600 });
            const result = await cache.invalidate(url);
            
            expect(result).toBe(true);
            const cached = await cache.get(url);
            expect(cached).toBeNull();
        });

        it('clears all cache', async () => {
            const cache = new SubscriptionCacheService(kv);
            await cache.set('https://example.com/1', 'content1', { ttl: 3600 });
            await cache.set('https://example.com/2', 'content2', { ttl: 3600 });
            
            const result = await cache.clear();
            expect(result.cleared).toBe(2);
        });

        it('returns cache stats', async () => {
            const cache = new SubscriptionCacheService(kv);
            await cache.set('https://example.com/sub', 'content', { ttl: 3600 });
            
            const stats = await cache.getStats();
            expect(stats).toHaveProperty('totalUrls');
            expect(stats).toHaveProperty('totalSize');
        });
    });

    describe('UsageStatsService', () => {
        it('records conversion stats', async () => {
            const stats = new UsageStatsService(kv);
            const result = await stats.recordConversion(userId, { format: 'surge' });
            
            expect(result.total).toBe(1);
            expect(result.daily).toBe(1);
        });

        it('accumulates total conversions', async () => {
            const stats = new UsageStatsService(kv);
            await stats.recordConversion(userId, { format: 'surge' });
            await stats.recordConversion(userId, { format: 'clash' });
            
            const data = await stats.getStats(userId);
            expect(data.total).toBe(2);
        });

        it('tracks format-specific stats', async () => {
            const stats = new UsageStatsService(kv);
            await stats.recordConversion(userId, { format: 'surge' });
            await stats.recordConversion(userId, { format: 'surge' });
            await stats.recordConversion(userId, { format: 'clash' });
            
            const data = await stats.getStats(userId);
            expect(data.formatStats.surge).toBe(2);
            expect(data.formatStats.clash).toBe(1);
        });

        it('tracks most used nodes', async () => {
            const stats = new UsageStatsService(kv);
            await stats.recordNodeUsage(userId, 'US-Node-1');
            await stats.recordNodeUsage(userId, 'US-Node-1');
            await stats.recordNodeUsage(userId, 'HK-Node-1');
            
            const nodes = await stats.getMostUsedNodes(userId);
            expect(nodes[0].name).toBe('US-Node-1');
            expect(nodes[0].count).toBe(2);
        });

        it('clears all stats', async () => {
            const stats = new UsageStatsService(kv);
            await stats.recordConversion(userId, { format: 'surge' });
            
            const result = await stats.clearStats(userId);
            expect(result.cleared).toBeGreaterThan(0);
            
            const data = await stats.getStats(userId);
            expect(data.total).toBe(0);
        });
    });

    describe('FavoriteNodesService', () => {
        it('adds favorite node', async () => {
            const favorites = new FavoriteNodesService(kv);
            const node = { tag: 'US-Node', server: 'us.example.com', server_port: 443 };
            
            const result = await favorites.addFavorite(userId, node);
            expect(result.added).toBe(true);
            expect(result.favorite).toHaveProperty('id');
        });

        it('prevents duplicate favorites', async () => {
            const favorites = new FavoriteNodesService(kv);
            const node = { tag: 'US-Node', server: 'us.example.com', server_port: 443 };
            
            await favorites.addFavorite(userId, node);
            const result = await favorites.addFavorite(userId, node);
            
            expect(result.added).toBe(false);
            expect(result.reason).toBe('already_exists');
        });

        it('removes favorite node', async () => {
            const favorites = new FavoriteNodesService(kv);
            const node = { tag: 'US-Node', server: 'us.example.com', server_port: 443 };
            
            const added = await favorites.addFavorite(userId, node);
            const result = await favorites.removeFavorite(userId, added.favorite.id);
            
            expect(result.removed).toBe(true);
        });

        it('updates note on favorite', async () => {
            const favorites = new FavoriteNodesService(kv);
            const node = { tag: 'US-Node', server: 'us.example.com', server_port: 443 };
            
            const added = await favorites.addFavorite(userId, node);
            const result = await favorites.updateNote(userId, added.favorite.id, 'Fast node');
            
            expect(result.updated).toBe(true);
            expect(result.favorite.note).toBe('Fast node');
        });

        it('checks if node is favorite', async () => {
            const favorites = new FavoriteNodesService(kv);
            const node = { tag: 'US-Node', server: 'us.example.com', server_port: 443 };
            
            await favorites.addFavorite(userId, node);
            const isFav = await favorites.isFavorite(userId, 'us.example.com', 443);
            const notFav = await favorites.isFavorite(userId, 'other.example.com', 443);
            
            expect(isFav).toBe(true);
            expect(notFav).toBe(false);
        });
    });

    describe('RecentHistoryService', () => {
        it('adds and retrieves history', async () => {
            const history = new RecentHistoryService(kv);
            const item = { config: 'ss://abc', format: 'surge' };
            
            const entry = await history.add(userId, item);
            expect(entry).toHaveProperty('id');
            expect(entry.config).toBe('ss://abc');
        });

        it('deduplicates history entries', async () => {
            const history = new RecentHistoryService(kv);
            await history.add(userId, { config: 'ss://abc', format: 'surge' });
            await history.add(userId, { config: 'ss://abc', format: 'surge' });
            
            const recent = await history.getRecent(userId);
            expect(recent.length).toBe(1);
        });

        it('respects max items limit', async () => {
            const history = new RecentHistoryService(kv, { maxHistoryItems: 3 });
            await history.add(userId, { config: 'ss://server1@example.com', format: 'surge' });
            await history.add(userId, { config: 'ss://server2@example.com', format: 'surge' });
            await history.add(userId, { config: 'ss://server3@example.com', format: 'surge' });
            await history.add(userId, { config: 'ss://server4@example.com', format: 'surge' });
            await history.add(userId, { config: 'ss://server5@example.com', format: 'surge' });
            
            const recent = await history.getRecent(userId);
            expect(recent.length).toBe(3);
        });

        it('removes history entry', async () => {
            const history = new RecentHistoryService(kv);
            const entry = await history.add(userId, { config: 'ss://abc', format: 'surge' });
            
            const result = await history.remove(userId, entry.id);
            expect(result.removed).toBe(true);
            
            const recent = await history.getRecent(userId);
            expect(recent.length).toBe(0);
        });

        it('clears all history', async () => {
            const history = new RecentHistoryService(kv);
            await history.add(userId, { config: 'ss://abc', format: 'surge' });
            
            const result = await history.clear(userId);
            expect(result.cleared).toBe(true);
            
            const recent = await history.getRecent(userId);
            expect(recent.length).toBe(0);
        });
    });
});