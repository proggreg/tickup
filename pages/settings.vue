<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
const store = useSettingsStore()
await useAsyncData(() => store.getUserSettings().then(() => true))
const { data } = useAuth()

console.log('here', store)
// const { data: settings } = await useFetch('/api/settings', {
//   query: { userId: data.value?.user?.sub },
// })

// console.log('here', settings)

const dirty = ref(false)

// let userStatuses = reactive(store.statuses)
function getRandomHexColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function addStatus() {
  // const top = userStatuses[userStatuses.length - 1]
  // if (top.name === '') return
  const randomColor = getRandomHexColor()

  store.statuses.push({ name: '', color: randomColor, isNew: true })
}

onMounted(async () => {

  // let  = await getUsersStatuses()
  console.log('store', store)

  // console.log('userStatuses', userStatuses)
})

watch(store.statuses, (newStatuses, oldStatuses) => {
  // if (!dirty.value) {
  //   dirty.value = JSON.stringify(store.statuses) === JSON.stringify(newStatuses)
  // }
  console.log('newStatuses ', newStatuses)
  console.log('oldStatuses ', oldStatuses)
})

async function save() {
  console.log('save')

  // const response = await $fetch('/api/settings', {
  //   method: 'PUT',
  //   body: { userId: data.value?.user?.sub, statuses: userStatuses },
  // })
  // console.log('response', response)
}

function cancel() {
  console.log('cancel')
}
</script>

<template>
  <v-row>
    <v-col cols="10">
      <h2>Settings</h2>
      <v-list variant="tonal">
        <v-list-item v-for="status in store.statuses" :key="status.name" class="my-2" width="200"
          :bg-color="status.color" variant="tonal">
          <v-text-field v-if="status.isNew" v-model="status.name" autofocus />
          <v-list-item-title v-else>
            {{ status.name }}
          </v-list-item-title>
          <template #append>
            <v-menu :close-on-content-click="false">
              <template #activator="{ props }">
                <v-btn v-bind="props" min-width="20" size="small" :color="status.color" />
              </template>
              <v-color-picker v-model="status.color" class="ma-4" show-swatches />
            </v-menu>
          </template>
        </v-list-item>
        <v-list-item width="200">
          <v-btn @click="addStatus">
            Add Status
          </v-btn>
        </v-list-item>
      </v-list>
      <v-btn color="secondary" :disabled="!dirty" @click="cancel">
        Cancel
      </v-btn>
      <v-btn color="primary" :disabled="!dirty" @click="save">
        Save
      </v-btn>
    </v-col>
  </v-row>
</template>
