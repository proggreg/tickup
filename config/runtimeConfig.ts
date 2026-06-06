export default {
    aiGatewayApiKey: process.env.NUXT_AI_GATEWAY_API_KEY,
    private: {
        vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
        github: {
            privateKey: process.env.GITHUB_PRIVATE_KEY,
            appId: process.env.GITHUB_APP_ID,
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
        },
    },

    public: {
        apiBase: '/api',
        hotjarId: process.env.HOTJAR_ID,
        ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        VAPID_KEY: process.env.VAPID_PUBLIC_KEY,
        bugsnag: {
            apiKey: process.env.BUGSNAG_API_KEY,
        },
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        githubAppName: process.env.NUXT_PUBLIC_GITHUB_APP_NAME,
        AI_GATEWAY_API_KEY: process.env.NUXT_AI_GATEWAY_API_KEY,
    },
};
