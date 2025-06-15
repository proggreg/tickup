<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
const { data, signOut } = useAuth()
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
    console.warn('no statuses')
    console.log('store', store)
    return
  }
  console.log('store.statuses', store.statuses)

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
    body: { userId: data.value?.user?.sub, statuses: store.statuses },
  })
}

function renameStatus() {
  console.debug('rename')
}
function deleteStatus(status: Status) {
  store.statuses.splice(store.statuses.indexOf(status), 1)
  save()
}

function cancel() {
  console.debug('cancel')
}


onMounted(() => {
  const subscribePush = async () => {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported by this browser')
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
      console.log('vapid key', config.public.VAPID_KEY)

      // Now subscribe with the new key
      const pushSubscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: config.public.VAPID_KEY,
      })
      console.log('pushSubscription', pushSubscription)

      // Send pushSubscription to server
      await $fetch('/api/subscribe', {
        method: 'POST',
        body: { subscription: pushSubscription },
      })
    }
    catch (error) {
      console.error('Could not subscribe to push', error)
    }
  }

  subscribePush()
})
</script>

<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-center">Settings</h2>
      </v-col>
    </v-row>

    <v-row>
      <!-- Profile Settings -->
      <v-col cols="12" md="6">
        <v-card title="Profile Settings" class="pa-4 mb-4">
          <v-card-text>
            <p><strong>Name:</strong> {{ data?.user?.name }}</p>
            <v-btn color="error" @click="signOut()">Sign out</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Notification Settings -->
      <v-col cols="12" md="6">
        <SettingsTasks/>
      </v-col>

      <!-- Status Management -->
      <v-col cols="12">
        <v-card title="Status Management" class="pa-4 mb-4">
          <v-card-text>
            <v-row v-for="(status, i) in store.statuses" :key="i" align="center">
              <v-col cols="1">
                <v-icon :color="status.color">mdi-circle</v-icon>
              </v-col>
              <v-col cols="7">
                <v-text-field
                  v-model="status.name"
                  label="Status Name"
                  :readonly="!status.Edit"
                  variant="underlined"
                  @update:model-value="save"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" v-bind="props" variant="text"></v-btn>
                  </template>
                  <v-list>
                    <v-list-item v-for="(option, index) in options" :key="index" @click="option.handler(status)">
                      <v-list-item-title>{{ option.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-col>
            </v-row>
            <v-btn prepend-icon="mdi-plus" @click="addStatus">Add Status</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
