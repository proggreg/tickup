import type { SchemaDefinitionProperty } from 'mongoose'
import { Schema } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

type ListType = 'status' | 'simple'

interface ListSchemaType {
  userId?: string
  name: string
  descriptions?: string
  listType: ListType
}

export const ListSchema = defineMongooseModel({
  name: 'List',
  schema: {
    userId: {
      type: Schema.Types.String,
      required: false,
    } as SchemaDefinitionProperty<string>,

    name: {
      type: Schema.Types.String,
      required: true,
    } as SchemaDefinitionProperty<string>,

    descriptions: {
      type: Schema.Types.String,
      required: false,
    } as SchemaDefinitionProperty<string>,

    listType: {
      type: Schema.Types.String,
      enum: ['status', 'simple'],
      default: 'simple',
    } as SchemaDefinitionProperty<ListType>,
  },
})
