export class TemplateService {
    constructor(kv, options = {}) {
        this.kv = kv;
        this.options = options;
    }

    ensureKv() {
        if (!this.kv) {
            throw new Error('Template service requires a KV store');
        }
        return this.kv;
    }

    async saveTemplate(userId, template) {
        const kv = this.ensureKv();
        const templateId = template.id || this.generateId();
        const key = `template:${userId}:${templateId}`;
        const data = {
            ...template,
            id: templateId,
            createdAt: template.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const ttl = this.options.templateTtlSeconds;
        const putOptions = ttl ? { expirationTtl: ttl } : undefined;
        await kv.put(key, JSON.stringify(data), putOptions);
        return data;
    }

    async getTemplate(userId, templateId) {
        const kv = this.ensureKv();
        const key = `template:${userId}:${templateId}`;
        const data = await kv.get(key);
        if (!data) return null;
        return JSON.parse(data);
    }

    async listTemplates(userId) {
        const kv = this.ensureKv();
        const prefix = `template:${userId}:`;
        const list = await kv.list({ prefix });
        const templates = [];
        for (const key of list.keys) {
            const data = await kv.get(key.name);
            if (data) {
                templates.push(JSON.parse(data));
            }
        }
        return templates;
    }

    async deleteTemplate(userId, templateId) {
        const kv = this.ensureKv();
        const key = `template:${userId}:${templateId}`;
        await kv.delete(key);
    }

    generateId() {
        return Math.random().toString(36).substring(2, 10);
    }
}
