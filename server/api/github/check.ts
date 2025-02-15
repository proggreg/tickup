import mongoose from 'mongoose'
import { getToken, getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
  const token = await getToken({ event })
  const session = await getServerSession(event)
  console.debug('session', session)
  console.debug('token', token)
  console.debug('check github')

  console.debug('connections', mongoose.connections)

  if (!token) {
    console.debug('no token')
  }

  // Check if it's your specific account
  const ALLOWED_USER = process.env.ADMIN_USER_ID
  return token && token.sub === ALLOWED_USER
})
