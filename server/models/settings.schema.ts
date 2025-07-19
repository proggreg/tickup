import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema, Types } from 'mongoose'

export const SettingsSchema = defineMongooseModel<{
  browserNotifications: boolean,
  userId: Types.ObjectId,
  statuses: Status[]
}>({
  name: 'settings',
  schema: {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    statuses: {
      type: [{
        name: String,
        color: String,
        Edit: Schema.Types.Boolean
      }],
      required: true,
    },
    browserNotifications: {
      type: Schema.Types.Boolean,
      required: true,
      default: false
    },
  },
})
