import { z } from 'zod';
import { callApi } from '../../utils/api';

export default defineMcpTool({
    name: 'get_url_metadata',
    description: 'Fetch page titles for a list of URLs (used for link previews)',
    inputSchema: {
        urls: z.array(z.string()).describe('URLs to fetch titles for'),
    },
    handler: async ({ urls }) => {
        return await callApi('/api/metadata', {
            query: { urls: JSON.stringify(urls) },
        });
    },
});
