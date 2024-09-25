import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username) {
    return 'no username'
  }

  const user = await UserSchema.find({ username: body.username })

  if (user.length) {
    return 'username taken'
  }

  const saltRounds = 6
  const salt = bcrypt.genSaltSync(saltRounds)
  const hash = bcrypt.hashSync(body.password, salt)
  body.password = hash

  const newUser = await new UserSchema(body).save()

  return newUser
})
