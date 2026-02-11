import Bugsnag from '@bugsnag/node';

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig();
    const apiKey = config.bugsnagApiKey;
    const releaseStage = config.public.VERCEL_ENV || 'development';

    if (!apiKey || releaseStage === 'development') {
        return;
    }

    Bugsnag.start({
        apiKey,
        releaseStage,
        enabledReleaseStages: ['staging', 'production'],
    });

    nitroApp.hooks.hook('error', (error, { event }) => {
        const statusCode = (error as any).statusCode ?? 500;

        // Only report server errors (5xx), not client errors (4xx)
        if (statusCode < 500) {
            return;
        }

        const url = event ? getRequestURL(event).pathname : 'unknown';
        const method = event ? getMethod(event) : 'unknown';

        Bugsnag.notify(error, (bugsnagEvent) => {
            bugsnagEvent.addMetadata('request', {
                url,
                method,
                statusCode,
            });
        });
    });
});
