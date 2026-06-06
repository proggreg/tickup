import {
    streamText,
    UIMessage,
    convertToModelMessages,
    createGateway,
    ToolSet,
    stepCountIs,
    Schema,
} from 'ai';
import { createMCPClient, ElicitationRequestSchema } from '@ai-sdk/mcp';

async function getInputFromUser(message: string, requestedSchema: Schema) {

}

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');
    const gateway = createGateway({
        apiKey,
    });

    return defineEventHandler(async (event: any) => {
        try {
            const mcpUrl = new URL('/mcp', getRequestURL(event).origin).toString();
            const cookie = getRequestHeader(event, 'cookie') ?? '';
            const mcp = await createMCPClient({
                transport: {
                    type: 'http',
                    url: mcpUrl,
                    headers: { cookie },
                },
                capabilities: {
                    elicitation: {
                        form: {},
                    },
                },
            });

            const { messages }: { messages: UIMessage[] } = await readBody(event);
            mcp.onElicitationRequest(ElicitationRequestSchema, async (request) => {
                console.log('elicit', request);
                const userInput = await getInputFromUser(
                  request.params.message,
                  request.params.requestedSchema,
                );

                return {
                    action: 'accept',
                };
            });

            const mcpTools = await mcp.tools();

            const result = streamText({
                model: gateway('anthropic/claude-haiku-4.5'),
                messages: await convertToModelMessages(messages),
                tools: mcpTools as ToolSet,
                stopWhen: stepCountIs(10),
            });

            return result.toUIMessageStreamResponse();
        } catch (err) {
            console.error(err);
            throw err;
        }
    });
});
