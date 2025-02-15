import mongoose from 'mongoose'
import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  const session = await getServerSession(event)
  console.log('session', session)
  console.log('token', token)
  console.log('check github')

  console.log('connections', mongoose.connections)

  if (!token) {
    console.log('no token')
  }

  // Check if it's your specific account
  const ALLOWED_USER = process.env.ADMIN_USER_ID
  return token && token.sub === ALLOWED_USER
})
