import { defineMongooseModel } from '#nuxt/mongoose'
import { fieldEncryption } from 'mongoose-field-encryption'
import { Schema } from 'mongoose'

const config = useRuntimeConfig()

const SettingsMongooseSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  statuses: {
    type: [{
      name: String,
      color: String,
      index: Number,
    }],
    required: true,
  },
  pusherAppId: {
    type: String,
    required: true,
  },
  pusherKey: {
    type: String,
    required: true,
  },
  pusherSecret: {
    type: String,
    required: true,
  },
  pusherCluster: {
    type: String,
    required: true,
  },
})

SettingsMongooseSchema.plugin(fieldEncryption, {
  fields: ['pusherSecret'],
  secret: config.appSecret,
  saltGenerator: (secret: string) => secret.slice(0, 16),
})

export const SettingsSchema = defineMongooseModel({
  name: 'settings',
  schema: SettingsMongooseSchema,
})
