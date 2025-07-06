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

  // Return a plain object instead of Mongoose document
  return {
    _id: newUser._id.toString(),
    username: newUser.username,
    email: newUser.email,
    password: newUser.password, // This should be the hashed password
    settings: newUser.settings,
    hasGithub: newUser.hasGithub
  }
})
