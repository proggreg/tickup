export function toRepoParts(fullName: string): { owner: string; repo: string } {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
        throw createError({ statusCode: 400, message: `Invalid repository full name: ${fullName}` });
    }

    return { owner, repo };
}
