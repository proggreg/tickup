<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { usePushSubscription } from '~/composables/pushSubscription'
const store = useSettingsStore()
const browserNotifications = ref(false)

const {
  pushSupported,
  pushSubscribed,
  pushError,
  subscribeToPush,
  unsubscribeFromPush
} = usePushSubscription()

const needsNotificationPermission = computed(() => {
  return (
    browserNotifications.value &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission !== 'granted'
  )
})

onMounted(async () => {
  await store.getUserSettings()
  browserNotifications.value = store.settings.value?.browserNotifications ?? false
  if (needsNotificationPermission.value) {
    promptForPermission()
  }
})

watch(browserNotifications, async (val) => {
  if (val) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        await store.updateSettings({ browserNotifications: true })
        if (!pushSubscribed.value && pushSupported.value) {
          await subscribeToPush()
        }
      } else {
        browserNotifications.value = false
        await store.updateSettings({ browserNotifications: false })
      }
    }
  } else {
    await store.updateSettings({ browserNotifications: false })
    if (pushSubscribed.value && pushSupported.value) {
      await unsubscribeFromPush()
    }
  }
})

async function promptForPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      await store.updateSettings({ browserNotifications: true })
      browserNotifications.value = true
      if (!pushSubscribed.value && pushSupported.value) {
        await subscribeToPush()
      }
    } else {
      browserNotifications.value = false
      await store.updateSettings({ browserNotifications: false })
    }
  }
}
</script>

<template>
  <v-card elevation="2" class="pa-4 mb-8">
    <h2 class="mb-4 text-h5 font-weight-bold">Notification Preferences</h2>
    <v-row>
      <v-col cols="12" md="8">
        <v-switch
          v-model="browserNotifications"
          label="Enable browser notifications"
        />
      </v-col>
    </v-row>
    <div v-if="needsNotificationPermission" class="text-warning mb-2">
      Please allow browser notifications in your browser settings.
    </div>
    <v-alert
      v-if="pushError"
      type="error"
      class="mb-2"
      density="compact"
      border="start"
      color="error"
    >
      {{ pushError }}
    </v-alert>
  </v-card>
</template> 