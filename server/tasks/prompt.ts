import { Cron } from 'croner'
import Pusher from 'pusher'
import { SettingsSchema } from '~/server/models/settings.schema'
import type { Settings } from '~'

let job: Cron | null = null
export default defineTask({
  meta: {
    name: 'prompt',
    description: 'Run AI prompt',
  },
  async run({ payload, context }) {
    console.log('Running AI prompt task...', payload)
    const { stop, start, task, userId }: { task?: Task, start?: boolean, stop?: boolean, userId?: string } = payload
    if (!task) {
      console.error('No task provided')
      return { error: 'No task provided' }
    }
    const { cron, prompt } = task || {}

    const settings = (await SettingsSchema.findOne({ userId: userId })) as Settings

    if (!settings || !settings.pusherAppId || !settings.pusherKey || !settings.pusherSecret || !settings.pusherCluster) {
      console.error('Pusher credentials are not set in user settings');
      return { error: 'Pusher credentials are not set in user settings' };
    }

    const { pusherAppId, pusherKey, pusherSecret, pusherCluster } = settings;

    if (start && !prompt || !cron) {
      console.error(`Missing prompt or cron for starting job prompt ${prompt} cron ${cron}`);
      return { error: 'Missing prompt or cron for starting job'  }
    }

    if (prompt && start && cron) {
        console.log('start job', cron)
          job = new Cron(cron, async () => {
              console.log('run job')

              const pusher = new Pusher({
                appId: pusherAppId,
                key: pusherKey,
                secret: pusherSecret,
                cluster: pusherCluster,
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
