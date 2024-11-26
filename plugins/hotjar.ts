import VueHotjar from 'vue-hotjar-next'

export default defineNuxtPlugin((nuxtApp) => {
    if (import.meta.client) {
        const runtimeConfig = useRuntimeConfig()

        nuxtApp.vueApp.use(VueHotjar, {
            id: Number(runtimeConfig.public.hotjarId),
            isProduction: runtimeConfig.public.VERCEL_ENV === 'production',
        });    
    }
});