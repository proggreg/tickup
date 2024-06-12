<script setup lang="ts">
const { data } = useAuth()
const newList = ref<List>({
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
  newList.value.userId = data?.value?.user?._id ? data?.value?.user?._id : data?.value?.user?.sub

  const list = await listsStore.addList(newList.value)
  

  if (list) {
    newList.value = {
                      name: '',
                      todos: [],
                      _id: undefined
                    }
    emit('close')
    if (smAndDown.value) {
      navOpen.value = false
    }
    await navigateTo(`/list/${list._id}`)
  }
}


</script>

<template>
  <AppDialog :open="props.open" title="Create List" @close="emit('close')">
    <template #open>
   
    </template>
    <v-container justify-center>
      <v-text-field v-model="newList.name" autofocus placeholder="New List" @keyup.enter="createNewList" />
    </v-container>
    <template #buttons>
      <v-btn :disabled="!newList.name.length" color="primary" variant="tonal" @click="createNewList">
        Save
      </v-btn>
    </template>
  </AppDialog>
</template>
