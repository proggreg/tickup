/**
 * Composable for accessing current authenticated user information
 * Provides a consistent way to get user ID and user data across the app
 */
export const useCurrentUser = () => {
    const user = useSupabaseUser();

    const userId = computed(() => {
        return user.value?.id || '';
    });

    const isAuthenticated = computed(() => {
        return !!user.value;
    });

    return {
        userId,
        user,
        isAuthenticated,
    };
};
