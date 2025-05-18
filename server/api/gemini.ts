import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const prompt = body?.prompt
    const history = body?.history || []

    if (!prompt) {
        return { error: 'Prompt is required.' }
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        const chat = ai.chats.create({
            model: "gemini-2.0-flash",
            history,
        });
        const response = await chat.sendMessage({
            message: prompt,
        });
        console.log('chat response', response)
        return response.text
    }
    catch (error: any) {
        return { error: error.message || 'Failed to call Gemini API.' }
    }
})
