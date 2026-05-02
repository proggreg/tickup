type ApiOptions = Parameters<typeof $fetch>[1];

export async function callApi<T = unknown>(path: string, options?: ApiOptions): Promise<T> {
    const event = useEvent();
    const cookie = event.headers.get('cookie') ?? '';
    const headers = {
        ...(options?.headers as Record<string, string> | undefined),
        cookie,
    };
    return (await $fetch(path, { ...options, headers } as ApiOptions)) as T;
}
