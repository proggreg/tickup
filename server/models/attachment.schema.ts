// import { defineMongooseModel } from '#nuxt/mongoose'

// export const AttachmentSchema = defineMongooseModel<{
//   todoId: string
//   filename: string
//   originalName: string
//   mimeType: string
//   size: number
//   data: Buffer
//   uploadedAt: Date
// }>({
//   name: 'Attachment',
//   schema: {
//     todoId: {
//       type: 'string',
//       required: true,
//       index: true,
//     },
//     filename: {
//       type: 'string',
//       required: true,
//     },
//     originalName: {
//       type: 'string',
//       required: true,
//     },
//     mimeType: {
//       type: 'string',
//       required: true,
//     },
//     size: {
//       type: Number,
//       required: true,
//     },
//     data: {
//       type: Buffer,
//       required: true,
//     },
//     uploadedAt: {
//       type: Date,
//       required: true,
//       default: () => Date.now(),
//     },
//   },
// })
