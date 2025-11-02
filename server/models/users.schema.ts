import { defineMongooseModel } from '#nuxt/mongoose'

export const UserSchema = defineMongooseModel<{
  username: string
  email: string
  supabaseId: string
  firstName?: string
  lastName?: string
  settings: {
    statuses: string[]
  }
  pushSubscriptions?: any[]
}>({
  name: 'User',
  schema: {
    username: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
    },
    supabaseId: {
      type: 'string',
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    settings: {
      type: {
        statuses: {
          type: ['string'],
          default: ['todo', 'in-progress', 'done'],
        },
      },
    },
    pushSubscriptions: {
      type: [{}],
      default: [],
    },
  },
})
