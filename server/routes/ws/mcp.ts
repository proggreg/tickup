type Peer = Parameters<NonNullable<Parameters<typeof defineWebSocketHandler>[0]['open']>>[0];

export const peers = new Map<string, Peer>();
export const pendingElicitations = new Map<string, (value: unknown) => void>();

export default defineWebSocketHandler({
    open(peer) {
        peer.subscribe('mcp');
        const cookie = peer.request.headers.get('cookie');
        if (cookie) {
            peers.set(cookie, peer);
        }
    },
    message(peer, message) {
        const cookie = peer.request.headers.get('cookie');
        if (!cookie) return;
        const resolve = pendingElicitations.get(cookie);
        if (resolve) {
            // pendingElicitations.delete(cookie);
            resolve(message.json());
        }
    },
    close(peer) {
        peer.unsubscribe('mcp');
        // Wait 500ms before sending the updated locations to the server
        setTimeout(() => {
            peer.publish('mcp', peer.peers.size);
        }, 500);
    },
});
