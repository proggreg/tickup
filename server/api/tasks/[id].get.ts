import { TasksSchema } from '../../models/tasks.schema'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id
    if (!id) {
      return { success: false, error: 'No id provided' }
    }
    const task = await TasksSchema.findById(id)
    if (!task) {
      return { success: false, error: 'Task not found' }
    }
    return task
  }
  catch (error) {
    return { success: false, error: error.message }
  }
})
