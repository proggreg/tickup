import { defineMongooseModel } from '#nuxt/mongoose'

export const ListSchema = defineMongooseModel({
  name: 'List',
  schema: {
    userId: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    descriptions: {
      type: 'string'
    }
  }
})
