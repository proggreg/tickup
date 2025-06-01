import { TasksSchema } from '../../models/tasks.schema'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    if (!id) {
      return { success: false, error: 'No id provided' }
    }
    const body = await readBody(event)
    const update: any = {}
    if (body.name !== undefined) update.name = body.name
    if (body.cron !== undefined) update.cron = { name: body.cron }
    if (body.description !== undefined) update.description = body.description
    const updated = await TasksSchema.findByIdAndUpdate(id, update, { new: true })
    if (!updated) {
      return { success: false, error: 'Task not found' }
    }
    return { success: true, task: updated }
  }
  catch (error) {
    return { success: false, error: error.message }
  }
})
