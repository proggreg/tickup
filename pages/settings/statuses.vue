<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
const store = useSettingsStore()
const newStatus = ref('')
const editingIndex = ref(-1)
const editedStatus = ref('')

await useAsyncData(() => store.getUserSettings().then(() => true))

function startEditStatus(idx: number) {
  editingIndex.value = idx
  editedStatus.value = store.statuses[idx].name
}

function cancelEditStatus() {
  editingIndex.value = -1
  editedStatus.value = ''
}

function confirmEditStatus(idx: number) {
  if (editedStatus.value.trim() !== '') {
    store.statuses[idx].name = editedStatus.value.trim()
    save()
  }
  cancelEditStatus()
}

function addStatus() {
  if (newStatus.value.trim() !== '') {
    store.statuses.push({ name: newStatus.value.trim(), color: '#87909e', Edit: false })
    newStatus.value = ''
    save()
  }
}

function deleteStatus(idx: number) {
  store.statuses.splice(idx, 1)
  save()
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
    body: { statuses: store.statuses },
  })
}
</script>
<template>
  <v-card elevation="2" class="pa-4 mb-8">
    <h2 class="mb-4 text-h5 font-weight-bold">Status List Settings</h2>
    <v-list>
      <v-list-item v-for="(status, idx) in store.statuses" :key="idx">
        <template v-if="editingIndex === idx">
          <v-text-field v-model="editedStatus" density="compact" class="mr-2" @keyup.enter="confirmEditStatus(idx)" @blur="cancelEditStatus" />
          <v-btn icon="mdi-check" size="small" @click="confirmEditStatus(idx)" />
          <v-btn icon="mdi-close" size="small" @click="cancelEditStatus" />
        </template>
        <template v-else>
          <v-avatar size="20" class="mr-2" :style="{ backgroundColor: status.color }"></v-avatar>
          <span>{{ status.name }}</span>
          <v-spacer />
          <v-btn icon="mdi-pencil" size="small" @click="startEditStatus(idx)" />
          <v-btn icon="mdi-delete" size="small" @click="deleteStatus(idx)" />
        </template>
      </v-list-item>
    </v-list>
    <v-row class="mt-2" align="center">
      <v-col cols="8">
        <v-text-field v-model="newStatus" label="Add new status" density="compact" @keyup.enter="addStatus" />
      </v-col>
      <v-col cols="4" class="d-flex justify-end">
        <v-btn color="primary" @click="addStatus">Add</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template> 