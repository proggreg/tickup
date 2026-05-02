import { createMCPClient } from '@ai-sdk/mcp';
import { generateText, stepCountIs } from 'ai';

export default defineEventHandler(async (event) => {
    const { prompt } = await readBody<{ prompt: string }>(event);

    const cookie = getRequestHeader(event, 'cookie') ?? '';
    const mcpUrl = new URL('/mcp', getRequestURL(event).origin).toString();

    const mcp = await createMCPClient({
        transport: {
            type: 'http',
            url: mcpUrl,
            headers: { cookie },
        },
    });

    try {
        const tools = await mcp.tools();
        const { content, text } = await generateText({
            model: 'anthropic/claude-sonnet-4.5',
            prompt,
            tools,
            stopWhen: stepCountIs(5),
            maxRetries: 10,
        });

        return { content, text };
    }
    finally {
        await mcp.close();
    }
});
