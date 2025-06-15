import type { SchemaDefinitionProperty } from 'mongoose'
import { Schema } from 'mongoose'
import type { Todo } from '../../index'
import { defineMongooseModel } from '#nuxt/mongoose'

export const TodoSchema = defineMongooseModel<Todo>({
  name: 'Todo',
  schema: {
    userId: {
      type: Schema.Types.String,
      required: false,
    } as SchemaDefinitionProperty<string>,

    name: {
      type: Schema.Types.String,
      required: true,
    } as SchemaDefinitionProperty<string>,

    listId: {
      type: Schema.Types.String,
    } as SchemaDefinitionProperty<string>,

    dueDate: {
      type: Schema.Types.Date,
    } as SchemaDefinitionProperty<Date>,

    status: {
      type: Schema.Types.String,
    } as SchemaDefinitionProperty<string>,
    desc: {
      type: Schema.Types.String,
    } as SchemaDefinitionProperty<string>,

    order: {
      type: Schema.Types.Number,
    } as SchemaDefinitionProperty<number>,
    // @ts-ignore
    createdAt: {
      type: Date,
      required: true,
      default: () => Date.now(),

    },

    // @ts-ignore
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
  },
})
