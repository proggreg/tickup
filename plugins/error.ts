export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (err) => {
        // @ts-expect-error
        nuxtApp.$bugsnag.notify(err)
    })
  })
