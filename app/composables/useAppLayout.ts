export function useAppLayout() {
    const route = useRoute();
    const { isMobile } = useDevice();

    return computed(() => {
        if (
            route.name === 'login' ||
            route.name === 'register' ||
            route.name.toString().includes('consent')
        ) {
            return 'login-register';
        }
        if (isMobile) {
            return 'mobile';
        }
        if (route.name === 'todo-id') {
            return 'todo';
        }

        return 'default';
    });
}
