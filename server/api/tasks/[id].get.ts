export default defineEventHandler(async (event): Promise<Task | {error: string} | Error> => {
  try {
    const id = event.context.params?.id
    if (!id) {
      return { error: 'No id provided' }
    }
    const task =  await TasksSchema.findById(id)
    if (!task) {
      return { error: 'Task not found' }
    }

    return task
  }
  catch (error) {
    if (error instanceof Error) {
      return error
    }
    return { error: 'An unexpected error occurred' }
  }
})
