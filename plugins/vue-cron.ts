import '@vue-js-cron/vuetify/dist/vuetify.css'
import CronVuetifyPlugin from '@vue-js-cron/vuetify'
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(CronVuetifyPlugin)
    // nuxtApp.vueApp.component('CronVuetify', CronVuetify)
})
