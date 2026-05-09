/**
 * Checks whether the current user has a GitHub installation connected.
 *
 * @returns The API response indicating GitHub connection status.
 */
export const useHasGithub = async () => {
    return await $fetch('/api/github/check');
};
