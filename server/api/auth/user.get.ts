export default defineEventHandler(async (event) => {
  const query = await getQuery(event)
  const user = await UserSchema.find({ username: query.username })
  console.log('user ', user)
  if (user.length) {
    return 'taken'
  }
  return true
})