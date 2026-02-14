import type { UIMessage } from 'ai';
import { streamText, convertToModelMessages, createGateway } from 'ai';

const DEFAULT_MODEL = 'google/gemini-2.0-flash';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');

    const gateway = createGateway({ apiKey });

    return defineEventHandler(async (event: any) => {
        const { messages, model }: { messages: UIMessage[]; model?: string } = await readBody(event);

        // Validate the requested model against the live list from the gateway
        const availableModels = await gateway.getAvailableModels();
        const validIds = new Set(
            availableModels.models
                .filter(m => m.modelType === 'language')
                .map(m => m.id),
        );

        const resolvedModel = model && validIds.has(model) ? model : DEFAULT_MODEL;

        const result = streamText({
            model: gateway(resolvedModel),
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    });
});
