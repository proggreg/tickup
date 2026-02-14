import { createGateway } from 'ai';

export default defineLazyEventHandler(async () => {
    const apiKey = useRuntimeConfig().aiGatewayApiKey;
    if (!apiKey) throw new Error('Missing AI Gateway API key');

    const gateway = createGateway({ apiKey });

    return defineEventHandler(async () => {
        const allModels = await gateway.getAvailableModels();

        console.log('available models', allModels);

        const languageModels = allModels.models
            .filter(m => m.modelType === 'language')
            .map(m => ({
                id: m.id,
                name: m.name,
                description: m.description,
            }));

        return languageModels;
    });
});
