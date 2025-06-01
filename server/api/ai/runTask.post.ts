export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { cron?: string, start?: boolean, stop?: boolean, prompt: string }
  const payload = { ...body }
  console.log('body', body)
  const { result } = await runTask('prompt', { payload })

  return { result }
})
