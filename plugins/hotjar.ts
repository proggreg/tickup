import VueHotjar from "vue-hotjar-next";

export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        const runtimeConfig = useRuntimeConfig()
        console.log('hotjar installed ', Number(runtimeConfig.public.hotjarId))
        nuxtApp.vueApp.use(VueHotjar, {
            id: Number(runtimeConfig.public.hotjarId),
            isProduction: true, // <-- or simply true/false
        });    
    }
});