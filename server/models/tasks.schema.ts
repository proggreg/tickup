import { defineMongooseModel } from '#nuxt/mongoose'

export const TasksSchema = defineMongooseModel<Task>({
  name: 'tasks',
  schema: {
    name: {
      type: 'string',
      required: true,
    },
    cron: {
      type: 'string',
      required: true,
    },
    prompt: {
      type: 'string',
      required: true,
    },
  },
})
