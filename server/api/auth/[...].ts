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

    async jwt({ token, user, account, profile }) {
      console.log('jwt', { token, user, account, profile })
      
      // Initial sign in
      if (user) {
        // Handle different providers
        if (account?.provider === 'github') {
          // For GitHub, we need to create or find the user in our database
          // and map the GitHub profile to our user structure
          token.sub = user.id
          token.username = user.login || user.name || user.email?.split('@')[0] || 'github-user'
          token._id = user.id
          token.email = user.email
          token.name = user.name
          token.image = user.image
        } else if (account?.provider === 'credentials') {
          // For credentials provider, user object already has the right structure
          token.sub = user.id
          token.username = user.username
          token._id = user._id
          token.email = user.email
          token.name = user.name
        }
      }
      
      return token
    },

    async session({ session, token }) {
      // Transfer token properties to session
      session.user = {
        ...session.user,
        ...token,
      }

      console.log('session', session)
      return session
    },

    async signIn({ user, account, profile }) {
      console.log('signIn', { user, account, profile })
      
      // For GitHub provider, you might want to create/update user in your database
      if (account?.provider === 'github') {
        try {
          // Check if user exists in your database
          const existingUser = await UserSchema.findOne({ 
            $or: [
              { email: user.email },
              { githubId: user.id }
            ]
          })
          
          if (!existingUser) {
            // Create new user from GitHub profile
            const newUser = new UserSchema({
              username: user.login || user.name || user.email?.split('@')[0] || 'github-user',
              email: user.email,
              name: user.name,
              image: user.image,
              githubId: user.id,
              hasGithub: true
            })
            await newUser.save()
          } else {
            // Update existing user with GitHub info
            await UserSchema.findByIdAndUpdate(existingUser._id, {
              githubId: user.id,
              hasGithub: true,
              image: user.image
            })
          }
        } catch (error) {
          console.error('Error handling GitHub sign-in:', error)
          return false
        }
      }
      
      return true
    },
  },
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise),
})
