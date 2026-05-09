/**
 * Returns a computed ref of the Nuxt layout name to use for the current route.
 *
 * | Route | Layout |
 * |---|---|
 * | `/login`, `/register` | `'login-register'` |
 * | Mobile devices | `'mobile'` |
 * | `/todo/:id` | `'todo'` |
 * | Everything else | `'default'` |
 */
export function useAppLayout() {
    const route = useRoute();
    const { isMobile } = useDevice();

    return computed(() => {
        if (route.name === 'login' || route.name === 'register') {
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
