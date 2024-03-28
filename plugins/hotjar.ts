import VueHotjar from "vue-hotjar-next";

export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        const runtimeConfig = useRuntimeConfig()
        nuxtApp.vueApp.use(VueHotjar, {
            id: Number(runtimeConfig.public.hotjarId),
            isProduction: true, // <-- or simply true/false
        });    
    }
});