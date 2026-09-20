export const useHasVercel = async () => {
    return await $fetch('/api/vercel/check');
};
