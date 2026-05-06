import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app/createApp.jsx';
import { MemoryKVAdapter } from '../src/adapters/kv/memoryKv.js';

const proxyUri = 'ss://YWVzLTEyOC1nY206cGFzcw@example.com:443#TestNode';

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

describe('Surge subscription fixes', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('GET /surge returns content-disposition header for direct download', async () => {
        const app = createTestApp();
        const config = encodeURIComponent(proxyUri);

        const res = await app.request(`http://localhost/surge?config=${config}`);

        expect(res.status).toBe(200);
        expect(res.headers.get('content-disposition')).toContain('attachment');
        expect(res.headers.get('content-disposition')).toContain('filename');
    });

    it('GET /surge returns Surge config with MANAGED-CONFIG directive', async () => {
        const app = createTestApp();
        const config = encodeURIComponent(proxyUri);

        const res = await app.request(`http://localhost/surge?config=${config}`);

        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toContain('#!MANAGED-CONFIG');
        expect(text).toContain('[General]');
        expect(text).toContain('[Proxy]');
        expect(text).toContain('[Proxy Group]');
        expect(text).toContain('[Rule]');
    });

    it('GET /surge uses short URL in MANAGED-CONFIG to avoid long filenames', async () => {
        const app = createTestApp();
        const config = encodeURIComponent(proxyUri);
        const longQuery = `?config=${config}&ua=&selectedRules=["Location/CN","Private","Non-China","Github","Google","Youtube","AI+Services","Telegram"]&customRules=[]&group_by_country=true`;

        const res = await app.request(`http://localhost/surge${longQuery}`);

        expect(res.status).toBe(200);
        const text = await res.text();
        const managedLine = text.split('\n').find(line => line.includes('#!MANAGED-CONFIG'));
        expect(managedLine).toBeTruthy();
        const shortUrlMatch = managedLine.match(/#!MANAGED-CONFIG\s+(.+?)\s+interval/);
        expect(shortUrlMatch).toBeTruthy();
        const managedUrl = shortUrlMatch[1];
        expect(managedUrl).toMatch(/\/s\//);
        expect(managedUrl.length).toBeLessThan(60);
    });

    it('GET /surge does not use !include prefix in proxy lines', async () => {
        const app = createTestApp();
        const config = encodeURIComponent(proxyUri);

        const res = await app.request(`http://localhost/surge?config=${config}`);

        expect(res.status).toBe(200);
        const text = await res.text();
        const lines = text.split('\n');
        const proxySectionStarted = false;
        let inProxySection = false;

        for (const line of lines) {
            if (line.startsWith('[Proxy]')) {
                inProxySection = true;
                continue;
            }
            if (inProxySection && line.startsWith('[')) {
                break;
            }
            if (inProxySection && line.trim() && !line.startsWith('#')) {
                expect(line).not.toMatch(/^!/);
            }
        }
    });

    it('GET /s/:code returns Surge config directly when detected as Surge UA', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => ({
            ok: true,
            status: 200,
            text: async () => proxyUri,
            headers: {
                get: () => null
            }
        })));

        const kvMock = {
            put: vi.fn(async () => {}),
            get: vi.fn(async (key) => {
                if (key === 'validCode') {
                    return '?config=' + encodeURIComponent(proxyUri);
                }
                return null;
            }),
            delete: vi.fn(async () => {})
        };

        const app = createTestApp({ kv: kvMock });

        const res = await app.request('http://localhost/s/validCode', {
            headers: {
                'User-Agent': 'Surge/4.0'
            }
        });

        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toContain('#!MANAGED-CONFIG');
        expect(text).toContain('[Proxy]');
    });
});
