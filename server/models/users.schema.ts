import { defineMongooseModel } from '#nuxt/mongoose'

export const UserSchema = defineMongooseModel<{
  username: string
  password: string
  settings: {
    statuses: string[]
  }
  hasGithub: boolean
  pushSubscriptions?: any[]
}>({
  name: 'User',
  schema: {
    username: {
      type: 'string',
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    settings: {
      type: {
        statuses: {
          type: ['string'],
          default: ['todo', 'in-progress', 'done'],
        },
      },
    },
    hasGithub: {
      type: 'boolean',
      default: false,
    },
    pushSubscriptions: {
      type: [{}],
      default: [],
    },
  },
})
