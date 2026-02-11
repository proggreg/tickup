import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: body.messages,
    });

    const response = result.toUIMessageStreamResponse();

    setResponseStatus(event, response.status);
    response.headers.forEach((value, key) => {
        setResponseHeader(event, key, value);
    });

    return response.body;
});
