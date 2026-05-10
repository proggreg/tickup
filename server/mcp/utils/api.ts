import { mcpUserId } from './auth';

type ApiOptions = Parameters<typeof $fetch>[1];

export async function callApi<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
    const event = useEvent();
    await mcpUserId(event);
    const cookie = event.headers.get('cookie') ?? '';
    const headers = {
        cookie,
        ...event.req.headers,
    };
    return (await $fetch(path, { ...options, headers } as unknown as ApiOptions)) as T;
}
