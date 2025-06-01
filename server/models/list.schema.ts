import type { SchemaDefinitionProperty } from 'mongoose'
import { Schema } from 'mongoose'
import type { List } from '../../index'
import { defineMongooseModel } from '#nuxt/mongoose'

export const ListSchema = defineMongooseModel<List>({
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

    description: {
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
