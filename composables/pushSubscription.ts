import { ref, computed } from 'vue'
import { useAuth, useRuntimeConfig } from '#imports'

export function usePushSubscription() {
  const pushSupported = ref(false)
  const pushSubscribed = ref(false)
  const pushError = ref('')

  const { data: authData } = useAuth()
  const username = computed(() => {
    if (!authData.value?.user) return ''
    const user = authData.value.user as any
    if (user.username) return user.username
    if (user._doc && user._doc.username) return user._doc.username
    if (user.name) return user.name
    return ''
  })

  const config = useRuntimeConfig()

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function subscribeToPush() {
    pushError.value = ''
    try {
      if (!('serviceWorker' in navigator)) {
        pushError.value = 'Service workers are not supported.'
        return false
      }
      const vapidKey = config.public.VAPID_KEY
      if (!vapidKey) {
        pushError.value = 'VAPID public key is not set. Please set VAPID_PUBLIC_KEY in your .env.'
        return false
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })
      window.localStorage.setItem('push-subscription', JSON.stringify(sub))
      pushSubscribed.value = true
      if (username.value) {
        await fetch('/api/auth/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.value, pushSubscription: sub })
        })
      }
      return true
    } catch (e) {
      pushError.value = 'Failed to subscribe to push.'
      return false
    }
  }

  async function unsubscribeFromPush() {
    pushError.value = ''
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        window.localStorage.removeItem('push-subscription')
        pushSubscribed.value = false
        if (username.value) {
          await fetch('/api/auth/user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.value, pushSubscription: sub })
          })
        }
      }
      return true
    } catch (e) {
      pushError.value = 'Failed to unsubscribe.'
      return false
    }
  }

  // Initialize support and subscription state
  if (typeof window !== 'undefined') {
    pushSupported.value = 'serviceWorker' in navigator && 'PushManager' in window
    pushSubscribed.value = !!window.localStorage.getItem('push-subscription')
  }

  return {
    pushSupported,
    pushSubscribed,
    pushError,
    username,
    subscribeToPush,
    unsubscribeFromPush
  }
} 