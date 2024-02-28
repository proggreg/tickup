import { defineMongooseModel } from '#nuxt/mongoose'
export const TodoSchema = defineMongooseModel({
  name: 'Todo',
  schema: {
    userId: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    listId: {
      type: 'string'
    },
    dueDate: {
      type: Date
    },
    status: {
      type: 'string'
    },
    desc: {
      type: 'string'
    },
    order: {
      type: Number
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
})
