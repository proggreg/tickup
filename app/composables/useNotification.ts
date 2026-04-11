const defaultTimeout = 5000;

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
