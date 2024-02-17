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
      type: 'date'
    },
    status: {
      type: 'string'
    },
    desc: {
      type: 'string'
    },
    createdAt: {
      type: 'date',
      default: Date.now
    },
    updatedAt: {
      type: 'date',
      default: Date.now
    }
  }
})
