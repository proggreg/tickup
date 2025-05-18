import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const prompt = body?.prompt

    if (!prompt) {
        return { error: 'Prompt is required.' }
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        })
        return response.text
    }
    catch (error: any) {
        return { error: error.message || 'Failed to call Gemini API.' }
    }
})
