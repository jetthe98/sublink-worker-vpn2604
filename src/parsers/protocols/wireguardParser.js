export function parseWireGuard(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const trimmed = url.trim();
    if (!trimmed.toLowerCase().startsWith('wireguard://')) {
        return null;
    }

    try {
        const urlWithoutScheme = trimmed.substring(12);
        const hashIndex = urlWithoutScheme.indexOf('#');
        let tag = '';
        let mainPart = urlWithoutScheme;

        if (hashIndex !== -1) {
            tag = decodeURIComponent(urlWithoutScheme.substring(hashIndex + 1));
            mainPart = urlWithoutScheme.substring(0, hashIndex);
        }

        const atIndex = mainPart.indexOf('@');
        if (atIndex === -1) {
            return null;
        }

        const publicKey = mainPart.substring(0, atIndex);
        const serverPart = mainPart.substring(atIndex + 1);

        let server = serverPart;
        let port = 51820;
        const colonIndex = serverPart.lastIndexOf(':');
        if (colonIndex !== -1) {
            const possiblePort = parseInt(serverPart.substring(colonIndex + 1), 10);
            if (!isNaN(possiblePort) && possiblePort > 0 && possiblePort <= 65535) {
                port = possiblePort;
                server = serverPart.substring(0, colonIndex);
            }
        }

        if (server.startsWith('[') && server.endsWith(']')) {
            server = server.slice(1, -1);
        }

        const proxy = {
            type: 'wireguard',
            tag: tag || 'WireGuard',
            server: server,
            server_port: port,
            local_address: `172.16.0.2/32`,
            private_key: '',
            peer_public_key: publicKey,
            reserved: [0, 0, 0],
            mtu: 1280
        };

        return proxy;
    } catch (error) {
        console.error('Error parsing WireGuard URL:', error);
        return null;
    }
}

export function convertWireGuardToSurge(proxy) {
    if (!proxy || proxy.type !== 'wireguard') {
        return null;
    }

    let line = `${proxy.tag} = wireguard, ${proxy.server}, ${proxy.server_port}`;
    
    if (proxy.private_key) {
        line += `, private-key=${proxy.private_key}`;
    }
    
    if (proxy.peer_public_key) {
        line += `, public-key=${proxy.peer_public_key}`;
    }
    
    if (proxy.dns) {
        line += `, dns=${proxy.dns}`;
    }
    
    if (proxy.mtu) {
        line += `, mtu=${proxy.mtu}`;
    }

    return line;
}

export function convertWireGuardToSingbox(proxy) {
    if (!proxy || proxy.type !== 'wireguard') {
        return null;
    }

    return {
        type: 'wireguard',
        tag: proxy.tag,
        server: proxy.server,
        server_port: proxy.server_port,
        local_address: [proxy.local_address || '172.16.0.2/32'],
        private_key: proxy.private_key || '',
        peer_public_key: proxy.peer_public_key,
        reserved: proxy.reserved || [0, 0, 0],
        mtu: proxy.mtu || 1280
    };
}

export function convertWireGuardToClash(proxy) {
    if (!proxy || proxy.type !== 'wireguard') {
        return null;
    }

    return {
        name: proxy.tag,
        type: 'wireguard',
        server: proxy.server,
        port: proxy.server_port,
        ip: proxy.local_address ? proxy.local_address.split('/')[0] : '172.16.0.2',
        ipv6: proxy.ipv6,
        'private-key': proxy.private_key || '',
        'public-key': proxy.peer_public_key,
        reserved: proxy.reserved || [0, 0, 0],
        mtu: proxy.mtu || 1280
    };
}
