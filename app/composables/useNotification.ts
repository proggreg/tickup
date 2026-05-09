const defaultTimeout = 5000;

/**
 * Singleton snackbar notification composable.
 *
 * Call `notify(text, options?)` to show a message.  The snackbar auto-hides
 * after `options.timeout` ms (default 5 000 ms).  Pass `timeout: 0` for a
 * persistent notification that must be dismissed manually via `dismiss()`.
 *
 * @example
 * ```ts
 * const { notify } = useNotification()
 * notify('Todo saved', { link: '/todo/123', timeout: 3000 })
 * ```
 */
export function useNotification() {
    const show = useState('notification-show', () => false);
    const message = useState('notification-message', () => '');
    const link = useState<string | undefined>('notification-link', () => undefined);

    function notify(text: string, options?: { link?: string; timeout?: number }) {
        message.value = text;
        link.value = options?.link;
        show.value = true;
        const timeout = options?.timeout ?? defaultTimeout;
        if (timeout > 0) {
            setTimeout(() => {
                show.value = false;
            }, timeout);
        }
    }

    function dismiss() {
        show.value = false;
    }

    return { show, message, link, notify, dismiss };
}
