<script setup lang="ts">
const { data } = useAuth()
const newList = reactive<List>({
  name: '',
  todos: [],
  _id: undefined
})
const listsStore = useListsStore()
const navOpen = useNav()
const { smAndDown } = useDisplay()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['close'])

async function createNewList() {
  newList.userId = data?.value?.user?._id

  if (!newList.userId) {
    newList.userId = data?.value?.user?.sub
  }

  const list = await listsStore.addList(newList)

  if (list) {
    newList.name = ''
    emit('close')
    if (smAndDown.value) {
      navOpen.value = false
    }
    await navigateTo(`/list/${list._id}`)
  }
}
</script>

<template>
  <AppDialog
    :open="props.open"
    @close="emit('close')"
  >
    <template #open>
      <div class="d-flex justify-space-between">
        Lists
      </div>
    </template>
    <v-container>
      <v-text-field
        v-model="newList.name"
        placeholder="New List"
        @keyup.enter="createNewList"
      />
    </v-container>
    <template #buttons>
      <v-btn
        color="primary"
        @click="createNewList"
      >
        Save
      </v-btn>
    </template>
  </AppDialog>
</template>
