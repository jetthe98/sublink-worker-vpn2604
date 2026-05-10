const STORAGE_KEY = 'savedSubscriptions';
const CURRENT_KEY = 'currentSubscriptionId';

export class SubscriptionManagerService {
    getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    save(subscription) {
        const list = this.getAll();
        const existingIndex = list.findIndex(s => s.id === subscription.id);

        const newSub = {
            ...subscription,
            id: subscription.id || Date.now().toString(),
            updatedAt: Date.now()
        };

        if (existingIndex >= 0) {
            list[existingIndex] = { ...list[existingIndex], ...newSub };
        } else {
            newSub.createdAt = Date.now();
            list.push(newSub);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return newSub;
    }

    delete(id) {
        const list = this.getAll().filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

        if (this.getCurrentId() === id) {
            this.setCurrent(null);
        }
    }

    getById(id) {
        const list = this.getAll();
        return list.find(s => s.id === id);
    }

    getCurrentId() {
        return localStorage.getItem(CURRENT_KEY);
    }

    setCurrent(id) {
        if (id) {
            localStorage.setItem(CURRENT_KEY, id);
        } else {
            localStorage.removeItem(CURRENT_KEY);
        }
    }

    getCurrent() {
        const id = this.getCurrentId();
        if (!id) return null;
        return this.getById(id);
    }

    rename(id, newName) {
        const list = this.getAll();
        const sub = list.find(s => s.id === id);
        if (sub) {
            sub.name = newName;
            sub.updatedAt = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            return sub;
        }
        return null;
    }

    clear() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        this.setCurrent(null);
    }
}

export const subscriptionManager = new SubscriptionManagerService();
