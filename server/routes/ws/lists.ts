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
const peerUserIds = new Map<Peer, string>();

export function broadcastToUser(userId: string, event: WsListEvent) {
    const peers = userPeers.get(userId);
    if (!peers) return;
    const message = JSON.stringify(event);
    for (const peer of peers) {
        peer.send(message);
    }
}

export default defineWebSocketHandler({
    open(_peer) {},
    message(peer, message) {
        try {
            const msg = message.json() as { type: string; userId: string };
            if (msg.type === 'auth' && typeof msg.userId === 'string') {
                const userId = msg.userId;
                peerUserIds.set(peer, userId);
                if (!userPeers.has(userId)) userPeers.set(userId, new Set());
                userPeers.get(userId)!.add(peer);
            }
        } catch {}
    },
    close(peer) {
        const userId = peerUserIds.get(peer);
        peerUserIds.delete(peer);
        if (!userId) return;
        const peers = userPeers.get(userId);
        if (!peers) return;
        peers.delete(peer);
        if (peers.size === 0) userPeers.delete(userId);
    },
});
