import { NuxtAuthHandler } from "#auth";
import GithubProvider from 'next-auth/providers/github'
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"
// console.log('secret', useRuntimeConfig().auth.secret)
export default NuxtAuthHandler({
  // secret: useRuntimeConfig().auth.secret,

  pages: {
    signIn: "/login",
  },
  providers: [
    // @ts-expect-error
    GithubProvider.default({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret
   })
  ],
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise)
});
