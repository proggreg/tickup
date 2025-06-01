import { Cron } from 'croner'
import Pusher from 'pusher'

let job: Cron | null = null
export default defineTask({
  meta: {
    name: 'prompt',
    description: 'Run AI prompt',
  },
  run({ payload, context }) {
    console.log('Running AI prompt task...', payload)
    const { stop, start, cron, prompt }: { cron?: string, start?: boolean, stop?: boolean, prompt?: string } = payload

    if (prompt && start && cron) {
      job = new Cron(cron, async () => {
        console.log('run job')

        if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
          throw new Error('Pusher environment variables are not set')
        }
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_KEY,
          secret: process.env.PUSHER_SECRET,
          cluster: process.env.PUSHER_CLUSTER,
          useTLS: true,
        })

        const response = await $fetch('/api/ai/prompt', {
          query: { prompt },
        })

        pusher.trigger('my-channel', 'prompt', {
          message: response,
        })
      })
    }

    if (job && stop) {
      console.log('stop job')
      job.stop()
    }

    return { result: 'Success yes', payload, context }
  },
})
