import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { UserSchema } from '../../models/users.schema'
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
        if (account?.provider === 'github') {
          token.sub = user.id
          token.username = user.login || user.name || user.email?.split('@')[0] || 'github-user'
          token._id = user.id
          token.email = user.email
          token.name = user.name
          token.image = user.image
        } else if (account?.provider === 'credentials') {
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
      console.log('Session callback:', { session, token })
      
      if (token) {
        session.user.id = token.sub || token._id
        session.user.username = token.username
        session.user._id = token._id
        session.user.sub = token.sub
        
        if (!session.user.name && token.name) {
          session.user.name = token.name
        }
      }

      return session
    },

    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile })
      
      if (account?.provider === 'github') {
        try {
          const existingUser = await UserSchema.findOne({ 
            $or: [
              { email: user.email },
              { githubId: user.id }
            ]
          })
          
          if (!existingUser) {
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
  }
})
