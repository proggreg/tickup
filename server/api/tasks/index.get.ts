export default defineEventHandler(async (event) => {
  const tasks = await TasksSchema.find({})
  return { success: true, tasks }
})
