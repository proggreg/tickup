<script setup lang="ts">
const store = useListsStore()
const rename = ref(true)
const router = useRoute()
const listNameRef = ref(null)
const listName = computed(() => {
  return store?.currentList?.name || 'Today'
})
const aiImage = ref('')
const imageGenerating = ref(false)

watch(rename, (newVal) => {
  if (!newVal) {
    if (!store.currentList._id) {
      store.currentList._id = router.params.id as string
    }

    store.updateList(store.currentList)
  }
  else {
    if (listNameRef.value) {
      listNameRef.value.focus()
    }
  }
})

watch(listName, (newName) => {
  if (!store.currentList.name) return
  if (store.lists.length && router.params.id && store.currentList.name.length > 0) {
    const list = store.lists.find(list => list._id === store.currentList._id)
    if (list) {
      list.name = newName
    }
  }
})

function validateListName(value: string) {
  if (!value) {
    return 'Please enter a list name'
  }

  return true
}

async function generateImage() {
  if (!store.currentList.name) {
    console.warn('no list name')
    alert('Please enter a list name')
    return
  }
  imageGenerating.value = true

  const response = await $fetch('/api/aws/image', {
    method: 'POST',
    body: {
      prompt: store.currentList.name,
    },
  })
  if (!response) {
    console.warn('couldn\'t generate image')
    return
  }

  store.currentList.image = response
  store.updateList()

  imageGenerating.value = false
}

function removeImage() {
  store.currentList.image = ''
  store.updateList()
}
</script>

<template>
  <v-col cols="12" class="pt-0">
    <v-card rounded="0" height="100%" :image="store.currentList.image" class="pa-2" elevation="0">
      <div :class="[store.currentList.image ? 'tint ma-n4 py-4 px-4' : '']">
        <v-row>
          <v-col cols="6" :class="['text-capitalize', (aiImage || store.currentList.image) ? 'text-white' : '']">
            <v-text-field class="px-2" ref="listNameRef" v-model="store.currentList.name" validate-on="blur eager"
              :rules="[validateListName]" placeholder="My List" variant="plain" :readonly="!rename"
              style=" font-weight: bold; " auto @click="rename = !rename"
              @keyup.enter="store.currentList.name ? rename = false : null"
              @blur="store.currentList.name ? rename = false : null" />
          </v-col>
          <v-col class="text-right">
            <ListSettingsButton />
          </v-col>
        </v-row>

        <v-card-actions class="px-2" :class="['text-capitalize', store.currentList.image ? 'text-white' : '']">
          <v-btn size="small" class="mr-2" :disabled="imageGenerating" @click="generateImage">
            <v-icon start>mdi-creation </v-icon><v-icon start>mdi-image </v-icon>
          </v-btn>

          <v-btn v-if="store.currentList.image" class="" icon="mdi-trash-can" size="small" @click="removeImage" />
        </v-card-actions>
      </div>
    </v-card>
  </v-col>
</template>

<style scoped>
.v-text-field :deep(.v-field__input) {
  @media (min-width: 600px) {
    font-size: 2.5rem;
  }

  font-size: 2rem;
  text-transform: capitalize;
  font-weight: bold;
}

.tint {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
