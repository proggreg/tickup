import { defineMongooseModel } from '#nuxt/mongoose'

export const Subscriptions = defineMongooseModel({
  name: 'subscriptions',
  schema: {
    userId: { type: 'string', required: true, unique: true },
    subscription: { type: 'object', required: true },
  },
}) 