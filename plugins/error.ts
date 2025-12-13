export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (err) => {
    // @ts-expect-error - Bugsnag is not typed in the nuxtApp context
        nuxtApp.$bugsnag.notify(err);
    });
});
