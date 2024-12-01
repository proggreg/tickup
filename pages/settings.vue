<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
const store = useSettingsStore()
await useAsyncData(() => store.getUserSettings().then(() => true))
const { data } = useAuth()
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

  const response = await $fetch('/api/settings', {
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


</script>

<template>
  <v-row>
    <v-col cols="10">
      <h2>Settings</h2>
      <v-card class="pa-4">
        <v-list variant="tonal">
          <v-list-item v-for="status in store.statuses" :key="status.name" class="my-2" width="200"
            :base-color="status.color">
            <template #prepend>
              <v-menu :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-btn v-bind="props" min-width="20" size="small" :color="status.color" />
                </template>
                <v-color-picker v-model="status.color" class="ma-4" show-swatches />
              </v-menu>
            </template>
            <v-text-field class="mx-2" v-if="status.Edit" v-model="status.name" autofocus />
            <v-list-item-title class="mx-2" v-else>
              {{ status.name }}
            </v-list-item-title>
            <template #append>

              <v-menu>
                <template #activator="{ props }">
                  <v-btn class="pa-0" v-bind="props" icon="mdi-dots-horizontal" variant="text" />
                </template>
                <v-list class="px-2">
                  <v-list-item v-for="(option, index) in options" :key="index" :value="option.name"
                    :append-icon="option.icon" :class="option.destructive ? 'text-red' : ''"
                    @click.passive="option.handler(status)">
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
      </v-card>
    </v-col>
  </v-row>
</template>
