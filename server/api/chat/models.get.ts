import { createGateway } from 'ai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');

    const gateway = createGateway({ apiKey });

    return defineEventHandler(async () => {
        const allModels = await gateway.getAvailableModels();

        const languageModels = allModels.models
            .filter(m => m.modelType === 'language' && m.id.includes('google'))
            .map(m => ({
                id: m.id,
                name: m.name,
                description: m.description,
            })).sort((a, b) => b.id.localeCompare(a.id));

        return languageModels;
    });
});
