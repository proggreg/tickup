import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export default defineEventHandler(async (event) => {
    const { messages } = await readBody(event);

    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
    });

    return result.toDataStreamResponse();
});
