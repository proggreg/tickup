import { z } from 'zod';

export default defineMcpPrompt({
    description: 'Generate a code review prompt',
    inputSchema: {
        language: z.string().describe('Programming language'),
    },
    handler: async ({ language }) => {
        return {
            messages: [{
                role: 'user',
                content: {
                    type: 'text',
                    text: `Please review my ${language} code for best practices, potential bugs, and improvements.`,
                },
            }],
        };
    },
});
