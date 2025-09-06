import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { UserSchema } from '../../models/users.schema'
import { NuxtAuthHandler } from '#auth'

// Extend the User type to include our custom properties
interface ExtendedUser {
  id: string
  name?: string
  email?: string
  image?: string
  username?: string
  _id?: string
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

    async jwt({ token, user, account, profile }) {
      console.log('JWT callback:', { token, user, account, profile })
      
      if (user) {
        const extendedUser = user as ExtendedUser
        if (account?.provider === 'github') {
          token.username = extendedUser.login || extendedUser.name || extendedUser.email?.split('@')[0] || 'github-user'
          token._id = extendedUser.id
          token.email = extendedUser.email
          token.name = extendedUser.name
          token.image = extendedUser.image
          const user = await UserSchema.findOne({ username: extendedUser.email })
          if (user) {
            token.sub  = user._id.toString()
          }
          
        } else if (account?.provider === 'credentials') {
          token.username = extendedUser.username
          token._id = extendedUser._id
          token.email = extendedUser.email
          token.name = extendedUser.name
          const user = await UserSchema.findOne({ username: extendedUser.username })
          if (user) {
            token.sub  = user._id.toString()
          }
        }
      }
      
      return token
    },

    async session({ session, token }) {
      console.log('Session callback:', { session, token })
      
      if (token) {
        session.user.id = (token.sub || token._id) as string
        session.user.username = token.username as string
        session.user._id = token._id as string
        session.user.sub = token.sub as string
        
        if (!session.user.name && token.name) {
          session.user.name = token.name as string
        }
      }

      return session
    },

    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile })
      
      if (account?.provider === 'github') {
        try {
          const extendedUser = user as ExtendedUser
          const existingUser = await UserSchema.findOne({ 
            $or: [
              { email: extendedUser.email },
              { githubId: extendedUser.id }
            ]
          })
          
          if (!existingUser) {
            const newUser = new UserSchema({
              username: extendedUser.login || extendedUser.name || extendedUser.email?.split('@')[0] || 'github-user',
              email: extendedUser.email,
              name: extendedUser.name,
              image: extendedUser.image,
              githubId: extendedUser.id,
              hasGithub: true
            })
            await newUser.save()
          } else {
            await UserSchema.findByIdAndUpdate(existingUser._id, {
              githubId: extendedUser.id,
              hasGithub: true,
              image: extendedUser.image
            })
          }
        } catch (error) {
          console.error('Error handling GitHub sign-in:', error)
          return false
        }
      }
      
      return true
    },
  }
})
