import { Readable } from 'node:stream'
import { GoogleGenAI } from '@google/genai'
import { defineEventHandler, setHeader, sendStream } from 'h3'

export default defineEventHandler(async (event) => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Geminie API Key is required')
    throw Error('Gemini API key is missing')
  }

  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')

  const { prompt } = await getQuery(event)

  if (!prompt) {
    throw Error('A prompt must be given')
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

    return sendStream(event, readableStream)
  }
  catch (error) {
    console.error('Error streaming from Gemini:', error)
    // Optionally send an error event to the client
    const errorStream = Readable.from([`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`])
    return sendStream(event, errorStream)
  }
})
