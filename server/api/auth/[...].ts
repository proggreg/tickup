import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import bcrypt from 'bcrypt'
import { UserSchema } from '../../models/users.schema'
import clientPromise from './lib/mongodb'
import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().auth.secret,

  pages: {
    signIn: '/login',
  },
  providers: [
    // @ts-expect-error
    CredentialsProvider.default({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Aaron' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: { username: string, password: string }) {
        try {
          const user = await UserSchema.findOne({ username: credentials.username })

          if (!user) {
            return false
          }

          if (credentials.password && user.password
            && bcrypt.compareSync(credentials.password, user.password)) {
            // Return a properly formatted user object for NextAuth.js
            return {
              id: user._id.toString(),
              name: user.username,
              email: user.email || `${user.username}@example.com`,
              username: user.username,
              _id: user._id.toString(),
              sub: user._id.toString(),
            }
          }

          return false
        }
        catch (error) {
          console.error(error)
          return false
        }
      },
    }),

    // @ts-expect-error
    GithubProvider.default({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret,
    }),
  ],
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async redirect({ url }) {
      return url
    },

    async jwt({ token, user }) {
      if (user) {
        // When signing in, add user info to token
        token.sub = user.id
        token.username = user.username
        token._id = user._id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && !session.user.name) {
        const user = await UserSchema.findById(token.sub)
        if (user) {
          session.user.name = user.username
        }
      }

      session.user = {
        ...token,
        ...session.user,
      }

      return session
    },
    async signIn({ user }) {
      if (user) {
        return true
      }
      return false
    },
  },
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise),
})
