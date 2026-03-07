import type { UIMessage } from 'ai';
import { streamText, convertToModelMessages, createGateway } from 'ai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');
    const gateway = createGateway({
        apiKey: apiKey,
    });

    return defineEventHandler(async (event: any) => {
        const { messages, model }: { messages: UIMessage[]; model?: string } = await readBody(event);

        const resolvedModel = model;

        const result = streamText({
            model: gateway(resolvedModel),
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    });
});
