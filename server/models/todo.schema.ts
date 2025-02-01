import { defineMongooseModel } from '#nuxt/mongoose'

export const TodoSchema = defineMongooseModel<{
  userId: string
  name: string
  listId: string
  dueDate: Date
  status: string
  desc: string
  order: number
  createdAt: Date
  updatedAt: Date
  githubBranchName: string
  links: Array<{ title: string, url: string, _id: string }>
  priority: string
}>({
  name: 'Todo',
  schema: {
    userId: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    listId: {
      type: 'string',
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: 'string',
    },
    desc: {
      type: 'string',
    },
    order: {
      type: Number,
    },
    createdAt: {
      type: Date,
      required: true,
      default: () => Date.now(),

    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    githubBranchName: {
      type: 'string',
    },
    links: {
      type: [{
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      }],
      required: false,
      default: () => [],
    },
    priority: {
      type: 'string',
      default: 'normal',
      enum: ['low', 'normal', 'high'],
    },
  },
})
