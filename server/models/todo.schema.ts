import { defineMongooseModel } from '#nuxt/mongoose'

export const TodoSchema = defineMongooseModel({
  name: 'Todo',
  schema: {
    name: {
      type: 'string',
      required: true
    },
    list_id: {
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
    }
  }
})
