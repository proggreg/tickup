import { GoogleGenAI } from '@google/genai';
import { defineEventHandler, setHeader, sendStream } from 'h3';
import { Readable } from 'node:stream';

export default defineEventHandler(async (event) => {
    setHeader(event, 'Content-Type', 'text/event-stream');
    setHeader(event, 'Cache-Control', 'no-cache');
    setHeader(event, 'Connection', 'keep-alive');

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Use non-null assertion as you likely have it configured
    const tools = [{ googleSearch: {} }];
    const config = {
        tools,
        responseMimeType: 'text/plain',

    };
    const model = 'gemini-2.0-flash';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `what are the most popular things to watch, get your information from rotten tomatoes. Only list the films and tv shows`,
                },
            ],
        },
    ];

    try {
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        const readableStream = new Readable({
            async read() {
                for await (const chunk of response) {
                    const text = chunk.text;
                    this.push(`data: ${text}\n\n`); // Format as SSE event
                }
                this.push(null); // Signal end of stream
            },
        });

        return sendStream(event, readableStream);
    } catch (error) {
        console.error('Error streaming from Gemini:', error);
        // Optionally send an error event to the client
        const errorStream = Readable.from([`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`]);
        return sendStream(event, errorStream);
    }
});