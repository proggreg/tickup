export default defineEventHandler(async (event): Promise<Task | { error: string }> => {
  const body = await readBody(event)
  const { name, cron, prompt, userId } = body

  if (!cron || !prompt || !name || !userId) {
    return { error: 'Missing name, cron, prompt or userId' }
  }

  return await TasksSchema.create({
    name: name,
    cron: cron,
    prompt: prompt,
    userId: userId,
  })
})
