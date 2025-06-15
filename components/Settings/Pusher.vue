<script setup lang="ts">
const store = useSettingsStore()
const { data } = useAuth()

async function savePusherSettings() {
  const response = await $fetch('/api/settings', {
    method: 'PUT',
    body: {
      userId: data.value?.user?.sub,
      pusherAppId: store.pusherAppId,
      pusherKey: store.pusherKey,
      pusherSecret: store.pusherSecret,
      pusherCluster: store.pusherCluster,
    },
  })
  console.log('Pusher settings saved', response)
}
</script>

<template>
  <v-card variant="flat" class="pa-4">
    <v-card-title>Pusher Settings</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field v-model="store.pusherAppId" label="App ID" />
        <v-text-field v-model="store.pusherKey" label="App Key" />
        <v-text-field v-model="store.pusherSecret" label="App Secret" />
        <v-text-field v-model="store.pusherCluster" label="App Cluster" />
        <v-btn color="primary" @click="savePusherSettings">Save Pusher Credentials</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template> 