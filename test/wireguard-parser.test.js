import { describe, it, expect } from 'vitest';
import { parseWireGuard, convertWireGuardToSurge, convertWireGuardToClash } from '../src/parsers/protocols/wireguardParser.js';

describe('WireGuard Parser', () => {
    it('parses basic WireGuard URL', () => {
        const url = 'wireguard://abc123publickey@wg.example.com:51820#MyWG';
        const result = parseWireGuard(url);
        
        expect(result).not.toBeNull();
        expect(result.type).toBe('wireguard');
        expect(result.server).toBe('wg.example.com');
        expect(result.server_port).toBe(51820);
        expect(result.peer_public_key).toBe('abc123publickey');
        expect(result.tag).toBe('MyWG');
    });

    it('parses WireGuard URL without port', () => {
        const url = 'wireguard://publickey@wg.example.com#TestNode';
        const result = parseWireGuard(url);
        
        expect(result).not.toBeNull();
        expect(result.server).toBe('wg.example.com');
        expect(result.server_port).toBe(51820);
    });

    it('returns null for invalid URL', () => {
        expect(parseWireGuard(null)).toBeNull();
        expect(parseWireGuard('')).toBeNull();
        expect(parseWireGuard('ss://abc')).toBeNull();
    });

    it('converts to Surge format', () => {
        const proxy = {
            type: 'wireguard',
            tag: 'TestWG',
            server: 'wg.example.com',
            server_port: 51820,
            private_key: 'private123',
            peer_public_key: 'public123',
            mtu: 1280
        };
        
        const result = convertWireGuardToSurge(proxy);
        expect(result).toContain('TestWG = wireguard');
        expect(result).toContain('wg.example.com');
        expect(result).toContain('51820');
        expect(result).toContain('private-key=private123');
        expect(result).toContain('public-key=public123');
    });

    it('converts to Clash format', () => {
        const proxy = {
            type: 'wireguard',
            tag: 'TestWG',
            server: 'wg.example.com',
            server_port: 51820,
            private_key: 'private123',
            peer_public_key: 'public123',
            reserved: [1, 2, 3]
        };
        
        const result = convertWireGuardToClash(proxy);
        expect(result.name).toBe('TestWG');
        expect(result.type).toBe('wireguard');
        expect(result.server).toBe('wg.example.com');
        expect(result.port).toBe(51820);
        expect(result['public-key']).toBe('public123');
        expect(result.reserved).toEqual([1, 2, 3]);
    });
});
