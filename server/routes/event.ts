import type { EventStream } from 'h3'

let eventStream: EventStream | null = null
export const _triggerSseEvent = async () => {
  console.log('eventStream', eventStream)
  if (eventStream) {
    try {
      console.log('send event')
      await eventStream.push(`Message @ ${new Date().toLocaleTimeString()}`)
    }
    catch (err) {
      console.error(err)
    }
  }
}

export default defineEventHandler(async (event) => {
  eventStream = createEventStream(event)

  // const interval = setInterval(async () => {
  //     await eventStream.push(`Message @ ${new Date().toLocaleTimeString()}`)
  // }, 1000)

  return eventStream.send()
})
