import { defineMongooseModel } from '#nuxt/mongoose'

export const UserSchema = defineMongooseModel({
  name: 'User',
  schema: {
    username: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    settings: {
      type: {
        statuses: {
          type: ['string'],
          default: ['todo', 'in-progress', 'done']
        }
      },
    },
  }
})
