import { describe, it, expect } from 'vitest';
import { filterProxies, sortProxies, mergeProxies } from '../src/utils.js';

const testProxies = [
    { tag: 'US-Node-1', type: 'shadowsocks', server: 'us1.example.com', server_port: 443 },
    { tag: 'HK-Node-1', type: 'vmess', server: 'hk1.example.com', server_port: 443 },
    { tag: 'JP-Node-1', type: 'trojan', server: 'jp1.example.com', server_port: 443 },
    { tag: 'SG-Node-1', type: 'shadowsocks', server: 'sg1.example.com', server_port: 443 },
    { tag: 'US-Node-2', type: 'vmess', server: 'us2.example.com', server_port: 443 },
];

describe('Proxy Filter and Sort', () => {
    it('filterProxies filters by keywords', () => {
        const result = filterProxies(testProxies, { keywords: ['US'] });
        expect(result.length).toBe(2);
        expect(result.every(p => p.tag.includes('US'))).toBe(true);
    });

    it('filterProxies filters by type', () => {
        const result = filterProxies(testProxies, { types: ['vmess'] });
        expect(result.length).toBe(2);
        expect(result.every(p => p.type === 'vmess')).toBe(true);
    });

    it('filterProxies applies limit', () => {
        const result = filterProxies(testProxies, { limit: 2 });
        expect(result.length).toBe(2);
    });

    it('sortProxies sorts by name ascending', () => {
        const result = sortProxies(testProxies, { sortBy: 'name', sortOrder: 'asc' });
        expect(result[0].tag).toBe('HK-Node-1');
        expect(result[result.length - 1].tag).toBe('US-Node-2');
    });

    it('sortProxies sorts by name descending', () => {
        const result = sortProxies(testProxies, { sortBy: 'name', sortOrder: 'desc' });
        expect(result[0].tag).toBe('US-Node-2');
    });

    it('sortProxies sorts by type', () => {
        const result = sortProxies(testProxies, { sortBy: 'type', sortOrder: 'asc' });
        expect(result[0].type).toBe('shadowsocks');
    });

    it('mergeProxies deduplicates', () => {
        const list1 = [{ tag: 'Node1', server: '1.1.1.1', server_port: 443, type: 'ss' }];
        const list2 = [{ tag: 'Node1', server: '1.1.1.1', server_port: 443, type: 'ss' }];
        const result = mergeProxies([list1, list2], { dedup: true });
        expect(result.length).toBe(1);
    });

    it('mergeProxies applies filter and sort', () => {
        const result = mergeProxies([testProxies], {
            filter: { keywords: ['US'] },
            sort: { sortBy: 'name' }
        });
        expect(result.length).toBe(2);
    });
});
