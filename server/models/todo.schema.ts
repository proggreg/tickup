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
  subtasks: Array<{ name: string, status: string, _id: string }>
  attachments: Array<{ 
    attachmentId: string,
    filename: string, 
    originalName: string, 
    mimeType: string, 
    size: number, 
    uploadedAt: Date 
  }>
  notificationDateTime?: Date
  notificationSent?: boolean
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
    subtasks: {
      type: [{
        name: { type: String, required: true },
        status: { type: String, required: true },
        _id: { type: String, required: true },
      }],
      required: false,
      default: () => [],
    },
    attachments: {
      type: [{
        attachmentId: { type: String, required: true },
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedAt: { type: Date, required: true, default: () => Date.now() },
      }],
      required: false,
      default: () => [],
    },
    notificationDateTime: {
      type: Date,
      required: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
})
