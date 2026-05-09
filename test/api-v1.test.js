import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app/createApp.jsx';
import { MemoryKVAdapter } from '../src/adapters/kv/memoryKv.js';

const createTestApp = (overrides = {}) => {
    return createApp({
        kv: overrides.kv ?? new MemoryKVAdapter(),
        assetFetcher: null,
        logger: console,
        config: {
            configTtlSeconds: 60,
            shortLinkTtlSeconds: null
        }
    });
};

describe('API v1 Endpoints', () => {
    it('GET /api/v1/rules returns rules list', async () => {
        const app = createTestApp();
        const res = await app.request('http://localhost/api/v1/rules');

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toHaveProperty('rules');
        expect(json).toHaveProperty('presets');
        expect(Array.isArray(json.rules)).toBe(true);
        expect(json.rules.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/proxies parses proxies', async () => {
        const app = createTestApp();
        const testInput = 'ss://YWVzLTEyOC1nY206cGFzc3dvcmQxQGV4YW1wbGUuY29tOjQ0Mw==#TestNode';

        const res = await app.request('http://localhost/api/v1/proxies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: testInput })
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toHaveProperty('count');
        expect(json).toHaveProperty('proxies');
    });

    it('POST /api/v1/proxies filters proxies', async () => {
        const app = createTestApp();
        const testInput = 'ss://YWVzLTEyOC1nY206cGFzc3dvcmQxQGV4YW1wbGUuY29tOjQ0Mw==#US-Node';

        const res = await app.request('http://localhost/api/v1/proxies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: testInput,
                filter: { keywords: ['US'] }
            })
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.count).toBe(1);
    });

    it('GET /api/v1/ping tests server reachability', async () => {
        const app = createTestApp();
        const res = await app.request('http://localhost/api/v1/ping?server=example.com&port=80&timeout=3000');

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toHaveProperty('server');
        expect(json).toHaveProperty('latency');
        expect(json).toHaveProperty('status');
    });

    it('GET /api/v1/templates returns empty list initially', async () => {
        const app = createTestApp();
        const res = await app.request('http://localhost/api/v1/templates');

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toHaveProperty('templates');
    });

    it('POST /api/v1/templates creates a template', async () => {
        const app = createTestApp();
        const template = {
            name: 'My Template',
            selectedRules: ['Location:CN', 'Private'],
            groupByCountry: true
        };

        const res = await app.request('http://localhost/api/v1/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template)
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.name).toBe('My Template');
        expect(json).toHaveProperty('id');
    });
});
