import { NuxtAuthHandler } from "#auth";
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"
import { UserSchema } from "../../models/users.schema";
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"
import bcrypt from 'bcrypt'
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
        try {
          const user = await UserSchema.findOne({ username: credentials.username })

          if (!user) {
            try {
              return user
            } catch (error) {
              console.error(error)
            }
          }

          if (user) {
            if (bcrypt.compareSync(credentials.password, user.password)) {
              return user
            }
          }

          return false
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
      return token;
    },

    async session({ session, token }) {

      if (!session.user.name) {
        const user = await UserSchema.findById(token.sub)
        session.user.name = user.username
      }

      session.user = {
        ...token,
        ...session.user,
      };

      return session;
    },
    async signIn({ user }) {
      if (user) {
        return true
      }
      return false
    }
  },
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise)
});