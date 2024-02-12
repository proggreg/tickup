import { getToken, getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
  try {
    console.log('get lists')
    const token = await getToken({event})
    console.log('token', token) 
    const session = await getServerSession(event)
    
    console.log('session', session)
    const id =  token.sub
    console.log('user id', id)

    return await ListSchema.find({ userId: id })
  } catch (error) {
    return error
  }
})
