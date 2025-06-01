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
    const { stop, start, task }: { task?: Task, start?: boolean, stop?: boolean } = payload
    if (!task) {
      console.error('No task provided')
      return { error: 'No task provided' }
    }
    const { cron, prompt } = task || {}

    const appId = process.env.PUSHER_APP_ID || '';
    const key = process.env.PUSHER_KEY || '';
    const secret = process.env.PUSHER_SECRET || '';
    const cluster = process.env.PUSHER_CLUSTER || '';

    if (!appId || !key || !secret || !cluster) {
      console.error('Pusher environment variables are not set');
      return {  error: 'Pusher environment variables are not set' };
    }

    if (start && !prompt || !cron) {
      console.error(`Missing prompt or cron for starting job prompt ${prompt} cron ${cron}`);
      return { error: 'Missing prompt or cron for starting job'  }
    }

    if (prompt && start && cron) {
        console.log('start job', cron)
          job = new Cron(cron, async () => {
              console.log('run job')

              const pusher = new Pusher({
                appId,
                key,
                secret,
                cluster,
                useTLS: true,
              })

              const response = await $fetch('/api/ai/prompt', {
                query: { prompt },
              })

              console.log('prompt response', response)

              pusher.trigger('my-channel', 'prompt', {
                message: response,
              })
            })
          
    }

    if (job && stop) {
      console.log('stop job')
      job.stop()
    }

    return { result: 'Success', payload, context }
  },
})
