import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type { OAuthClientInformationMixed, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';

const storage = new Map<string, unknown>();

function loadFromStorage<T>(key: string): T | undefined {
    return storage.get(key) as T | undefined;
}

function saveToStorage(key: string, value: unknown): void {
    storage.set(key, value);
}

export class MyOAuthProvider implements OAuthClientProvider {
    get redirectUrl() { return 'http://localhost:3000/api/ai/auth/callback'; }

    get clientMetadata() {
        return {
            client_name: 'My App',
            redirect_uris: ['http://localhost:3000/callback'],
        };
    }

    clientInformation(): OAuthClientInformationMixed | undefined {
        console.log('get clientInformation');
        return loadFromStorage<OAuthClientInformationMixed>('oauth_client');
    }

    saveClientInformation(info: OAuthClientInformationMixed): void {
        console.log('save clientInformation');
        saveToStorage('oauth_client', info);
    }

    tokens(): OAuthTokens | undefined {
        console.log('get tokens');
        return loadFromStorage<OAuthTokens>('oauth_tokens');
    }

    saveTokens(tokens: OAuthTokens): void {
        console.log('save tokens');
        saveToStorage('oauth_tokens', tokens);
    }

    async redirectToAuthorization(url: URL): Promise<void> {
        // Open browser — in Node: open(url.toString())
        // Then spin up a local HTTP server to catch the redirect
        console.log('Redirect to:', url.toString());

        window.open(url, '_blank').focus();
    }

    saveCodeVerifier(verifier: string): void {
        saveToStorage('pkce_verifier', verifier);
    }

    codeVerifier(): string {
        console.log('verify token ');
        const verifier = loadFromStorage<string>('pkce_verifier');
        if (!verifier) throw new Error('No code verifier saved');
        return verifier;
    }
}
