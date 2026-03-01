export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (err) => {
        console.log('nuxt error', err);
        useBugsnag().notify(new Error(JSON.stringify(err)));
    });
});
