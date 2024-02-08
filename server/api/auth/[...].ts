import { NuxtAuthHandler } from "#auth";
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from "next-auth/providers/credentials"
import {UserSchema} from "../../models/users.schema";import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./lib/mongodb"

// console.log('secret', useRuntimeConfig().auth.secret)
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
        
      },
      async authorize(credentials: { username: string; password: string }) {
        console.log('authorizing', credentials)

        try {
          const user = await UserSchema.findOne({ username: credentials.username })
          if (!user) {
            console.log('creating user', user)
            try {
              return null
            } catch (error) {
              console.log(error)
            }
           
          } 

          // console.log('user', user) 
          return user
        } catch (error) {
          console.error(error)
        }
        
        const user = { id: '1', name: 'J Smith', username: 'jsmith', password: 'hunter2' }
        if (credentials?.username === user.username && credentials?.password === user.password) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // eslint-disable-next-line no-console
          console.error('Warning: Malicious login attempt registered, bad credentials provided')
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
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
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      console.log('jwt', token, user, account)
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
  },
  // @ts-expect-error
  adapter: MongoDBAdapter(clientPromise)
});
