export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    // handle error, e.g. report to a service

        useBugsnag().notify(new Error('Some Error'));
    };
    nuxtApp.hook('vue:error', (err) => {
        console.log('nuxt error', err);
        debugger;
        useBugsnag().notify(new Error(err));
    });
});
