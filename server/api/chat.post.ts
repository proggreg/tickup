import type { UIMessage, ToolSet, Schema } from 'ai';
import { streamText, convertToModelMessages, createGateway, stepCountIs } from 'ai';
import { createMCPClient, ElicitationRequestSchema } from '@ai-sdk/mcp';
import { peers, pendingElicitations } from '../routes/ws/mcp';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const ollama = createOpenAICompatible({ name: 'ollama', baseURL: 'http://localhost:11434/v1' });
const model = ollama('qwen3.5');

async function getInputFromUser(cookie: string, message: string, requestedSchema: Schema) {
    if (!('properties' in requestedSchema)) return undefined;
    const peer = peers.get(cookie);
    if (!peer) throw new Error('Peer not found');

    return new Promise<unknown>((resolve) => {
        pendingElicitations.set(cookie, resolve);
        peer.send(JSON.stringify({ message, properties: requestedSchema.properties }));
    });
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
                const userInput = await getInputFromUser(
                    cookie,
                    request.params.message,
                    request.params.requestedSchema as Schema,
                );

                return {
                    action: 'accept',
                    content: userInput as Record<string, unknown>,
                };
            });

            const mcpTools = await mcp.tools();

            const result = streamText({
                model: model,
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
