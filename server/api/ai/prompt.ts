import { Readable } from 'node:stream'
import { GoogleGenAI } from '@google/genai'
import { defineEventHandler, setHeader, sendStream } from 'h3'
import Pusher from 'pusher'
import PushNotifications from "@pusher/push-notifications-server";
import { SettingsSchema } from '~/server/models/settings.schema'
import type { Settings } from '~'

export default defineEventHandler(async (event) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Gemini API Key is required')
    throw Error('Gemini API key is missing')
  }

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  const { prompt, userId } = await getQuery(event)

  if (!prompt) {
    throw Error('A prompt must be given')
  }

  if (!userId) {
    throw Error('User ID is required')
  }

  const settings = (await SettingsSchema.findOne({ userId })) as Settings

  if (!settings || !settings.pusherAppId || !settings.pusherKey || !settings.pusherSecret || !settings.pusherCluster) {
    console.error('Pusher credentials are not set in user settings');
    throw Error('Pusher credentials are not set in user settings');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) // Use non-null assertion as you likely have it configured
  const tools = [{ googleSearch: {} }]
  const config = {
    tools,
    responseMimeType: 'text/plain',

  }
  const model = 'gemini-2.0-flash'
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt as string,
        },
      ],
    },
  ]

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    const readableStream = new Readable({
      async read() {
        for await (const chunk of response) {
          const text = chunk.text
          this.push(`data: ${text}\n\n`) // Format as SSE event
        }
        this.push(null) // Signal end of stream
      },
    })


    console.log(`PUSHER_INSTANCE_ID ${process.env.PUSHER_INSTANCE_ID}`)
    let beamsClient = new PushNotifications({
      instanceId: process.env.PUSHER_INSTANCE_ID as string,
      secretKey: process.env.PUSHER_SECRET as string,
    });
    
    beamsClient
      .publishToInterests(["hello"], {
        web: {
          notification: {
            title: "Hello",
            body: "Hello, world!",
            deep_link: "https://www.pusher.com",
          },
        },
      })
      .then((publishResponse) => {
        console.log("Just published:", publishResponse.publishId);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
    return sendStream(event, readableStream)
  }
  catch (error) {
    console.error('Error streaming from Gemini:', error)
    // Optionally send an error event to the client
    const errorStream = Readable.from([`event: error\ndata: ${JSON.stringify({ message: (error as Error).message })}\n\n`])
    return sendStream(event, errorStream)
  }
})
