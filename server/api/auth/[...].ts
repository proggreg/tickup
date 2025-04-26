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
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Aaron' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<'username' | 'password', string> | undefined) {
        if (!credentials?.username || !credentials?.password) return null
        try {
          const user = await UserSchema.findOne({ username: credentials.username })

          if (!user) {
            return false
          }

          if (credentials.password && user.password
            && bcrypt.compareSync(credentials.password, user.password)) {
            return user
          }

          return false
        }
        catch (error) {
          console.error(error)
        }
      },
    }),

    GithubProvider({
      clientId: useRuntimeConfig().github.clientId,
      clientSecret: useRuntimeConfig().github.clientSecret,
    }),
  ],
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async redirect({ url }: { url: string }) {
      return url
    },

    async jwt({ token }: { token: any }) {
      return token
    },

    async session({ session, token }: { session: any, token: any }) {
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
    async signIn({ user }: { user: any }) {
      if (user) {
        return true
      }
      return false
    },
  },
  adapter: MongoDBAdapter(clientPromise),
})
