import { Octokit } from 'octokit'

export default defineNuxtPlugin((nuxtApp: any) => {
  if (import.meta.client) {
    const runtimeConfig = useRuntimeConfig()
    return {
      provide: {
        octokit: new Octokit({ auth: runtimeConfig.public.github }),
      },

    }
  }
})
