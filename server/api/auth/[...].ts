import { NuxtAuthHandler } from "#auth";
import GithubProvider from 'next-auth/providers/github'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().NUXT_NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },
  providers: [
    // @ts-expect-error
    GithubProvider.default({
      clientId: '74b05bd89fb504936923',
      clientSecret: 'e896926bb5da3d1470a569a8524bcdecd9b37edf'
   })
  ],
});
