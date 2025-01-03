import { defineMongooseModel } from '#nuxt/mongoose'

export const ListSchema = defineMongooseModel({
  name: 'List',
  schema: {
    userId: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: true,
    },
    descriptions: {
      type: 'string',
    },
    image: {
      type: 'string',
      required: false,
    },
  },
})
