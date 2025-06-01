import { TasksSchema } from '../../models/tasks.schema'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    if (!id) {
      return { success: false, error: 'No id provided' }
    }
    const deleted = await TasksSchema.findOneAndDelete({ _id: id })
    if (!deleted) {
      return { success: false, error: 'Task not found' }
    }
    return { success: true, task: deleted }
  }
  catch (error) {
    return { success: false, error: error.message }
  }
})
