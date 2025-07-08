import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      name: string
      avatar: string
      role: 'admin' | 'manager' | 'user'
      sub: string
      _id: string
      id: string
      username: string
      image: string
    }
  }
}

declare module 'web-push';
