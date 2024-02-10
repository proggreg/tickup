import { NuxtAuthHandler } from "#auth";
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"
import { UserSchema } from "../../models/users.schema";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,

  pages: {
    signIn: "/login",
  },
  providers: [
    // @ts-expect-error
    CredentialsProvider.default({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Aaron" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: { username: string; password: string }) {
        console.log('authorizing', credentials)

        try {

          const user = await UserSchema.findOne({ username: credentials.username })
          if (!user) {
            try {
              console.log('found user', user)
              return user
            } catch (error) {
              console.log(error)
            }

          }

          return user
        } catch (error) {
          console.error(error)
        }
      },

    }),


    // @ts-expect-error
    GithubProvider.default({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret
    })
  ],
  session: {
    strategy: "jwt"
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // console.log('jwt', token, user, account)
      if (user) {
        token = {
          ...token,
          ...user._doc,
        };
      }

      return token;
    },

    async session({ session, token }) {
      console.log('session', session, token)

      session.user = {
        ...token,
        ...session.user,
      };

      return session;
    },
    async signIn({ account, user, credentials, email, profile }) {
      console.log('signIn account', account)
      console.log('signIn user', user)
      console.log('signIn credentials', credentials)
      console.log('signIn email', email)
      console.log('signIn profile', profile)
      if (user) {
        return true
      }
      return false
    }
  },
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise, {

  })
});
