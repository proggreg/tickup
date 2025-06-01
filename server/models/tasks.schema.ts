import { defineMongooseModel } from '#nuxt/mongoose'

export const TasksSchema = defineMongooseModel<Task>({
  name: 'tasks',
  schema: {
    name: {
      type: 'string',
      required: true,
    },
    cron: {
      name: {
        type: 'string',
        required: true,
      },
    },
  },
})
