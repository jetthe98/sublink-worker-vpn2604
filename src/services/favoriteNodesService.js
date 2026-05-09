export class FavoriteNodesService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
        this.keyPrefix = 'favorites:';
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Favorite nodes service requires a KV store');
        }
        return this.kv;
    }

    async addFavorite(userId, node) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const favorites = await this.getFavorites(userId);
        
        // 检查是否已存在
        const exists = favorites.some(f => 
            f.server === node.server && f.server_port === node.server_port
        );
        if (exists) {
            return { added: false, reason: 'already_exists' };
        }

        const favorite = {
            ...node,
            addedAt: Date.now(),
            id: this.generateId()
        };

        favorites.push(favorite);
        await kv.put(key, JSON.stringify(favorites), { expirationTtl: 86400 * 365 });
        return { added: true, favorite };
    }

    async removeFavorite(userId, nodeId) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const favorites = await this.getFavorites(userId);
        
        const index = favorites.findIndex(f => f.id === nodeId);
        if (index === -1) {
            return { removed: false, reason: 'not_found' };
        }

        favorites.splice(index, 1);
        await kv.put(key, JSON.stringify(favorites), { expirationTtl: 86400 * 365 });
        return { removed: true };
    }

    async getFavorites(userId) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const data = await kv.get(key);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    }

    async isFavorite(userId, server, port) {
        const favorites = await this.getFavorites(userId);
        return favorites.some(f => f.server === server && f.server_port === port);
    }

    async updateNote(userId, nodeId, note) {
        const kv = this.ensureKv();
        const key = `${this.keyPrefix}${userId}`;
        const favorites = await this.getFavorites(userId);
        
        const favorite = favorites.find(f => f.id === nodeId);
        if (!favorite) {
            return { updated: false, reason: 'not_found' };
        }

        favorite.note = note;
        favorite.updatedAt = Date.now();
        await kv.put(key, JSON.stringify(favorites), { expirationTtl: 86400 * 365 });
        return { updated: true, favorite };
    }

    generateId() {
        return Math.random().toString(36).substring(2, 10);
    }
}
