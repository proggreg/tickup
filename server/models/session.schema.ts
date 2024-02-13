import { defineMongooseModel } from '#nuxt/mongoose'
export const SessionSchema = defineMongooseModel({
  name: 'session',
  schema: {
    name: {
      type: 'string',
      required: true
    }
  }
})