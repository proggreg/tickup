function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export function useNotificationSettings() {
    const config = useRuntimeConfig();

    const supported = import.meta.client && 'serviceWorker' in navigator && 'PushManager' in window;
    const enabled = ref(false);
    const loading = ref(false);
    const error = ref('');

    async function checkStatus() {
        if (!supported) {
            return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        enabled.value = !!subscription;
    }

    async function enable() {
        if (!supported) {
            error.value = 'Push notifications are not supported in this browser.';
            return;
        }
        loading.value = true;
        error.value = '';
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                error.value = 'Notification permission was not granted.';
                return;
            }

            const vapidKey = config.public.VAPID_KEY as string;
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            await $fetch('/api/subscribe', {
                method: 'POST',
                body: { subscription: subscription.toJSON() },
            });
            enabled.value = true;
        }
        catch {
            error.value = 'Failed to enable push notifications.';
        }
        finally {
            loading.value = false;
        }
    }

    async function disable() {
        if (!supported) {
            return;
        }
        loading.value = true;
        error.value = '';
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await $fetch('/api/subscribe', {
                    method: 'DELETE',
                    body: { endpoint: subscription.endpoint },
                });
                await subscription.unsubscribe();
            }
            enabled.value = false;
        }
        catch {
            error.value = 'Failed to disable push notifications.';
        }
        finally {
            loading.value = false;
        }
    }

    return { supported, enabled, loading, error, checkStatus, enable, disable };
}
