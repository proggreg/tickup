export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { cron: string, prompt: string, start?: boolean, stop?: boolean }
  const payload = { ...body }
  console.log('body', body)
  try {
    const { result} = await runTask('prompt', { payload })

    if (!result) {
      throw new Error('Could not run task')
    }
    return { result }
  } catch (error) {
    console.error('Error running task:', error)
    return { error: 'Failed to run task' }
  }
})
