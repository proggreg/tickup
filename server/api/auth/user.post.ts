import bcrypt from 'bcrypt'
import { UserSchema } from '../../models/users.schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.username) {
    return 'no username'
  }

  const user = await UserSchema.find({ username: body.username })

  if (user.length) {
    return 'username taken'
  }

  // If pushSubscription is provided, add it to the user's pushSubscriptions
  if (body.pushSubscription && body.username) {
    return await UserSchema.findOneAndUpdate(
      { username: body.username },
      { $addToSet: { pushSubscriptions: body.pushSubscription } },
      { new: true, upsert: true }
    )
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
    password: newUser.password, 
    settings: newUser.settings,
    hasGithub: newUser.hasGithub
  }
})
