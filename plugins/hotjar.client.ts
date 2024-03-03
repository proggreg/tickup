import VueHotjar from "vue-hotjar-next";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueHotjar, {
        id: process.env.HOTJAR_ID,
        isProduction: true, // <-- or simply true/false
    });
});