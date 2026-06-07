type Peer = Parameters<NonNullable<Parameters<typeof defineWebSocketHandler>[0]['open']>>[0];

export type WsListEvent = {
    type:
        | 'todo:created'
        | 'todo:updated'
        | 'todo:deleted'
        | 'list:created'
        | 'list:updated'
        | 'list:deleted';
    payload: Record<string, unknown>;
};

const userPeers = new Map<string, Set<Peer>>();

function getUserId(peer: Peer): string | null {
    const cookieHeader = peer.request?.headers.get('cookie') ?? '';
    const cookies: Record<string, string> = {};
    for (const pair of cookieHeader.split(';')) {
        const idx = pair.indexOf('=');
        if (idx === -1) continue;
        cookies[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }

    const authKey = Object.keys(cookies).find(
        (k) => k.startsWith('sb-') && k.endsWith('-auth-token'),
    );
    if (!authKey) return null;

    try {
        const val = decodeURIComponent(cookies[authKey]);
        const session = JSON.parse(val);
        const accessToken: string | undefined =
            typeof session === 'string' ? session : session?.access_token;
        if (!accessToken) return null;
        const payloadB64 = accessToken.split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
        return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
        return null;
    }
}

export function broadcastToUser(userId: string, event: WsListEvent) {
    const peers = userPeers.get(userId);
    if (!peers) return;
    const message = JSON.stringify(event);
    for (const peer of peers) {
        peer.send(message);
    }
}

export default defineWebSocketHandler({
    open(peer) {
        const userId = getUserId(peer);
        if (!userId) return;
        if (!userPeers.has(userId)) userPeers.set(userId, new Set());
        userPeers.get(userId)!.add(peer);
    },
    close(peer) {
        const userId = getUserId(peer);
        if (!userId) return;
        const peers = userPeers.get(userId);
        if (!peers) return;
        peers.delete(peer);
        if (peers.size === 0) userPeers.delete(userId);
    },
    message() {},
});
