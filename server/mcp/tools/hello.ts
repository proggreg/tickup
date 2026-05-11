import { z } from 'zod';

export default defineMcpTool({
    description: 'Say hello to someone',
    inputSchema: {
        name: z.string().describe('The name to greet'),
    },
    handler: async ({ name }) => {
        return `Hello, ${name}!`;
    },
});
