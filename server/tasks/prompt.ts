import { Cron } from 'croner'
import Pusher from 'pusher'
import { SettingsSchema } from '~/server/models/settings.schema'
import type { Settings } from '~'
import webpush from 'web-push'
import { Subscriptions } from '~/server/models/subscriptions.schema'

import PushNotifications from '@pusher/push-notifications-server';



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
                params: { prompt, userId },
              })

              console.log('prompt response', response)

              pusher.trigger('my-channel', 'prompt', {
                message: response,
              })

              // Send push notification if subscription exists
              const userSubscription = await Subscriptions.findOne({ userId })
              if (userSubscription) {
                const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
                if (!vapidPrivateKey) {
                  console.error('VAPID private key is not defined in environment variables.')
                } else {
                  webpush.setVapidDetails(
                    'mailto:greg.field1992@gmail.com',
                    process.env.VAPID_PUBLIC_KEY || '',
                    vapidPrivateKey
                  )
                  try {
                    await webpush.sendNotification(
                      userSubscription.subscription,
                      JSON.stringify({
                        title: 'AI Prompt Result',
                        message: typeof response === 'string' ? response : JSON.stringify(response),
                      })
                    )
                  } catch (err) {
                    console.error('Error sending push notification:', err)
                  }
                }
              }
              let pushNotifications = new PushNotifications({
                instanceId: '4e4f4d01-c58c-495e-962b-bdc3d9a752c3',
                secretKey: 'C675309668106C7E4C2E272C43666C81157112F61D719C9931806F26F5AEE085'
              });
            })
          
    }

    if (job && stop) {
      console.log('stop job')
      job.stop()
    }

    return { result: 'Success', payload, context }
  },
})
