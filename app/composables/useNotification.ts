const defaultTimeout = 2000;

export function useNotification() {
    const show = useState('notification-show', () => false);
    const message = useState('notification-message', () => '');

    function notify(text: string, timeout = defaultTimeout) {
        message.value = text;
        show.value = true;
        if (timeout > 0) {
            setTimeout(() => {
                show.value = false;
            }, timeout);
        }
    }

    function dismiss() {
        show.value = false;
    }

    return { show, message, notify, dismiss };
}
