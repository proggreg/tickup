import type {
    UIMessage } from 'ai';
import {
    streamText,
    convertToModelMessages,
    createGateway,
} from 'ai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');
    const gateway = createGateway({
        apiKey: apiKey,
    });

    return defineEventHandler(async (event: any) => {
        const { messages }: { messages: UIMessage[] } = await readBody(event);

        const result = streamText({
            model: gateway('google/gemini-2.0-flash'),
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    });
});
