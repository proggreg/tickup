<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
// const { signOut } = useAuth()
const { userId } = useCurrentUser()
const store = useSettingsStore()
const config = useRuntimeConfig()

await useAsyncData(() => store.getUserSettings().then(() => true))

const options = reactive([{
  name: 'Rename',
  handler: renameStatus,
  icon: 'mdi-pencil',
}, {
  name: 'Delete',
  handler: deleteStatus,
  icon: 'mdi-delete',
  destructive: true,
}])

function getRandomHexColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function addStatus() {
  if (!store.statuses) {
    logger.warn('no statuses', { component: 'Settings', function: 'addStatus' })
    return
  }

  const top = store.statuses[store.statuses.length - 1]
  if (top.name === '') {
    store.statuses[store.statuses.length - 1].Edit = true
    return
  }
  const randomColor = getRandomHexColor()

  store.statuses.push({ name: '', color: randomColor, Edit: true })
}

async function save() {
  for (let i = 0; i < store.statuses.length; i++) {
    if (store.statuses[i].Edit) {
      store.statuses[i].Edit = false
    }
    if (store.statuses[i].name === '') {
      store.statuses.splice(i, 1)
    }
  }

  await $fetch('/api/settings', {
    method: 'PUT',
    body: { userId: userId.value, statuses: store.statuses },
  })
}

function renameStatus() {
  logger.debug('rename')
}
function deleteStatus(status: Status) {
  store.statuses.splice(store.statuses.indexOf(status), 1)
  save()
}

function cancel() {
  logger.debug('cancel')
}

// const useRegisterSW = await import('virtual:pwa-register')
// const { registerSW } = useRegisterSW({
//   onRegistered(r) {
//     r && setInterval(() => {
//       r.update()
//     }, 60 * 60 * 1000)
//   }
// })

onMounted(() => {
  const subscribePush = async () => {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service workers are not supported by this browser', { component: 'Settings' })
      return
    }

    const sw = await navigator.serviceWorker.ready
    try {
      // Check for existing subscription
      const existingSubscription = await sw.pushManager.getSubscription()
      if (existingSubscription) {
        // Unsubscribe if it exists
        await existingSubscription.unsubscribe()
      }

      // Now subscribe with the new key
      const pushSubscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: config.public.VAPID_KEY,
      })

      // Send pushSubscription to server
      await $fetch('/api/subscribe', {
        method: 'POST',
        body: { subscription: pushSubscription },
      })
    }
    catch (error) {
      logger.error(error as Error, { component: 'Settings', function: 'subscribePush' })
    }
  }

  subscribePush()
})
</script>

<template>
  <v-row>
    <v-col cols="12">
      <h2 class="text-center">Settings</h2>
      <v-card variant="flat" class="pa-4">
        <v-list variant="tonal">
          <v-list-item v-for="status in store.statuses" :key="status.name" class="my-2" :base-color="status.color">
            <template #prepend>
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-btn v-bind="props" min-width="20" size="small" :color="status.color" />
                </template>
                <v-color-picker v-model="status.color" class="ma-4" show-swatches />
              </v-menu>
            </template>
            <v-text-field v-if="status.Edit" v-model="status.name" class="mx-2" autofocus />
            <v-list-item-title v-else class="mx-2">
              {{ status.name }}
            </v-list-item-title>
            <template #append>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn class="pa-0" v-bind="props" icon="mdi-dots-horizontal" variant="text" />
                </template>
                <v-list class="px-2">
                  <v-list-item
v-for="(option, index) in options" :key="index" :value="option.name"
                    :append-icon="option.icon" :class="option.destructive ? 'text-red' : ''"
                    @click.passive="option.handler(status)"
>
                    <v-list-item-title class="text-body-2">
                      {{ option.name }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-list-item>
          <v-list-item width="200" variant="plain">
            <v-btn @click="addStatus">
              Add Status
            </v-btn>
          </v-list-item>
        </v-list>
        <v-btn color="secondary" @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="save">
          Save
        </v-btn>
        <v-btn class="text-body-2 py-0 ma-2" append-icon="mdi-logout" @click="signOut()">
          Sign Out
        </v-btn>
      </v-card>
    </v-col>
  </v-row>
</template>
