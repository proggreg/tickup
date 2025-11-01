import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { UserSchema } from '../../models/users.schema'
import { NuxtAuthHandler } from '#auth'
import type { User as NextAuthUser } from 'next-auth'


// Extend the User type to include our custom properties
interface ExtendedUser {
  id: string
  name?: string
  email?: string
  image?: string
  username: string
  _id: string
  login?: string
}

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
            return {
              id: user._id.toString(),
              name: user.username,
              email: (user as any).email || `${user.username}@example.com`,
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
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      
      // ✅ Handle redirects properly
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    },

    async jwt({ token, user }) {
      console.log('jwt', {token, user })
      if (user) {
        // When signing in, add user info to token
        console.log('jwt user', user)
        token.sub = user.id
        token.username = user.username
        token._id = user._id
      }
      return token
    },

    async session({ session, token }) {
      console.log('session', {session, token })
      if (session.user && !session.user.name) {
        const user = await UserSchema.findById(token.sub)
        console.log('session user', user)
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

async signIn({ user, account, profile }) {
      const signInStartTime = Date.now()
      console.log(`[${new Date().toISOString()}] SignIn callback started.`, { user, account, profile })
      
      if (account?.provider === 'github') {
        try {
          const githubSignInStartTime = Date.now()
          console.log(`[${new Date().toISOString()}] GitHub sign-in flow started.`)
          const extendedUser = user as ExtendedUser

          const findUserStartTime = Date.now()
          const existingUser = await UserSchema.findOne({
            $or: [
              { email: extendedUser.email },
              { githubId: extendedUser.id }
            ]
          })
          console.log(`[${new Date().toISOString()}] UserSchema.findOne completed in ${Date.now() - findUserStartTime}ms. Existing user: ${!!existingUser}`)
          
          if (!existingUser) {
            console.log(`[${new Date().toISOString()}] Creating new user.`)
            const newUser = new UserSchema({
              username: extendedUser.login || extendedUser.name || extendedUser.email?.split('@')[0] || 'github-user',
              email: extendedUser.email,
              name: extendedUser.name,
              image: extendedUser.image,
              githubId: extendedUser.id,
              hasGithub: true
            })
            const saveUserStartTime = Date.now()
            await newUser.save()
            console.log(`[${new Date().toISOString()}] New user saved in ${Date.now() - saveUserStartTime}ms.`)
          } else {
            console.log(`[${new Date().toISOString()}] Updating existing user.`)
            const updateUserStartTime = Date.now()
            await UserSchema.findByIdAndUpdate(existingUser._id, {
              githubId: extendedUser.id,
              hasGithub: true,
              image: extendedUser.image
            })
            console.log(`[${new Date().toISOString()}] Existing user updated in ${Date.now() - updateUserStartTime}ms.`)
          }
          console.log(`[${new Date().toISOString()}] GitHub sign-in flow completed in ${Date.now() - githubSignInStartTime}ms.`)
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error handling GitHub sign-in:`, error)
          return false
        }
      }
      console.log(`[${new Date().toISOString()}] SignIn callback finished in ${Date.now() - signInStartTime}ms.`)
      return true
    },
  }
})
