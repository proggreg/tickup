export default defineEventHandler(async (event): Promise<Task | { error: string }> => {
  const body = await readBody(event)
  const { name, cron, prompt } = body

  if (!cron || !prompt || !name) {
    return { error: 'Missing name, cron or prompt' }
  }

  return await TasksSchema.create({
    name: name,
    cron: cron,
    prompt: prompt
  })
})
