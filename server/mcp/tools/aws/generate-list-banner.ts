import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'generate_list_banner',
    description:
        'Generate a banner image for a todo list using AWS Bedrock (Stable Diffusion XL). Returns a base64 data URL.',
    inputSchema: {
        prompt: z.string().describe('A short prompt describing the list (e.g. its name)'),
    },
    handler: async ({ prompt }) => {
        return await callApi<string>('/api/aws/image', {
            method: 'POST',
            body: { prompt },
        });
    },
});
