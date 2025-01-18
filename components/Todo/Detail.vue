<script setup lang="ts">
const listsStore = useListsStore()
const editTodo = ref(false)
const links = reactive([])

function updateDueDate(newDate: Date) {
  listsStore.currentTodo.dueDate = newDate
  listsStore.updateTodo(listsStore.currentTodo)
}
function updateName() {
  if (listsStore.currentTodo.name) {
    listsStore.updateTodo(listsStore.currentTodo)
  }
}

function updateTodo() {
  listsStore.updateTodo(listsStore.currentTodo)
}

watch(links, () => {
  // for (const link of links) {
  //   if (!listsStore.currentTodo.links.includes((l) => {
  //     return link.url === l.url
  //   })) {
  //     listsStore.currentTodo.links.push(link)
  //   }
  // }

  // console.log('updated todo links', listsStore.currentTodo.links)

  // listsStore.updateTodo(listsStore.currentTodo)
})

async function fetchUrlsTitles() {
  if (!listsStore.currentTodo.desc) return
  const urlPattern = /(https?:\/\/[^\s]+)/g

  const urls = listsStore.currentTodo.desc.match(urlPattern)

  if (urls) {
    console.log('urls', urls)
    return await $fetch('/api/metadata', { query: { urls: JSON.stringify(urls) } })
  }

  return []
}

async function removeLink(link) {
  console.log('remove link', link)

  const newLinks = listsStore.currentTodo.links.filter((l) => {
    return l._id !== link._id
  })

  listsStore.currentTodo.links = newLinks

  updateTodo()
}

watch(() => listsStore.currentTodo.desc, async () => {
  if (!listsStore.currentTodo.desc) return
  try {
    const linkTitles = await fetchUrlsTitles()

    if (!linkTitles || !linkTitles.length) return

    listsStore.currentTodo
    if (!listsStore.currentTodo.desc) return

    for (const linkTitle of linkTitles) {
      if (!listsStore.currentTodo.links.find((l) => {
        return l.url === linkTitle.url
      })) {
        listsStore.currentTodo.links.push(linkTitle)
      }
    }

    listsStore.updateTodo(listsStore.currentTodo)
    const urlPattern = /(https?:\/\/[^\s]+)/g

    const urls = listsStore.currentTodo.desc.match(urlPattern)

    for (const url of urls) {
      listsStore.currentTodo.desc = listsStore.currentTodo.desc.replace(url, '')
    }
    listsStore.updateTodo(listsStore.currentTodo)
  }
  catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <v-card width="100%" elevation="0" class="pa-0 d-flex flex-column" style="height: 100%">
    <v-card-item>
      <v-row>
        <v-col cols="6">
          <TodoStatus />
        </v-col>
        <v-spacer />
        <v-col sm="3" md="2" cols="6">
          <AppDueDate
            :todo-due-date="listsStore.currentTodo.dueDate" :todo="listsStore.currentTodo" :show-detail="true"
            @set-date="updateDueDate"
          />
        </v-col>
      </v-row>
    </v-card-item>
    <v-card-title>
      <v-text-field v-model="listsStore.currentTodo.name" label="Title" hide-details @blur="updateName" />
    </v-card-title>
    <v-card-item>
      <v-textarea
        v-model="listsStore.currentTodo.desc" auto-grow
        class="mt-2"
        hide-details max-rows="20" @input="updateTodo" @blur="updateTodo; editTodo = false"
      />
    </v-card-item>

    <v-text>Links</v-text>
    <v-list>
      <v-list-item v-for="(link, index) in listsStore.currentTodo.links" :key="index">
        <v-list-item-title>
          <a :href="link.url" target="_blank">{{ link.title }}</a>
        </v-list-item-title>
        <template #append>
          <v-btn color="red" icon="mdi-delete" variant="text" @click="removeLink(link)" />
        </template>
      </v-list-item>
    </v-list>
    <v-card-actions class="py-6">
      <AppDeleteButton :todo="listsStore.currentTodo" />
      <AppGithubButton :todo="listsStore.currentTodo" />
      <v-spacer />
      <v-file-input label="File input" variant="solo-inverted" density="compact" hide-details disabled />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.v-file-input {
  flex-grow: 0;
}

:deep(.v-file-input .v-input__control) {
  display: none;
}
</style>
