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
      validate: {
        validator: v => v.trim() !== '',
        message: 'Name cannot be empty',
      },
    },
    descriptions: {
      type: 'string',
    },
  },
})
