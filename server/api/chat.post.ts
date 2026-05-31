import { streamText, UIMessage, convertToModelMessages, createGateway, generateText } from 'ai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');
    const gateway = createGateway({
        apiKey: apiKey,
    });

    return defineEventHandler(async (event: any) => {
        try {
            const { messages }: { messages: UIMessage[] } = await readBody(event);

            const result = streamText({
                model: gateway('anthropic/claude-haiku-4.5'),
                messages: await convertToModelMessages(messages),
            });

            return result.toUIMessageStreamResponse();
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
