export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, cron, prompt } = body

  if (!cron || !prompt || !name) {
    return { error: 'Missing name, cron or prompt' }
  }

  const task = await TasksSchema.create({
    name: name,
    cron: { name: cron },
  })

  return { success: true, task }
})
