<script setup lang="ts">
const listsStore = useListsStore()
const editLinks = ref([])
async function removeLink(link) {
  const newLinks = listsStore.currentTodo.links.filter((l) => {
    return l._id !== link._id
  })

  listsStore.currentTodo.links = newLinks

  listsStore.updateTodo(listsStore.currentTodo)
}

async function fetchUrlsTitles() {
  if (!listsStore.currentTodo.desc) return
  const urlPattern = /(https?:\/\/[^\s]+)/g

  const urls = listsStore.currentTodo.desc.match(urlPattern)

  if (urls) {
    return await $fetch('/api/metadata', { query: { urls: JSON.stringify(urls) } })
  }

  return []
}

function editLink(link) {
  editLinks.value.push(link.url)
}

function cancelEditLink(link) {
  // TODO make a copy and revert back if cancelled
  editLinks.value = editLinks.value.filter(url => url !== link.url)
}

watch(() => listsStore.currentTodo.desc, async () => {
  if (!listsStore.currentTodo.desc) return
  try {
    const linkTitles = await fetchUrlsTitles()

    if (!linkTitles || !linkTitles.length) return

    if (!listsStore.currentTodo.desc) return

    for (const linkTitle of linkTitles) {
      if (!listsStore.currentTodo.links.find((l) => {
        return l.url === linkTitle.url
      })) {
        listsStore.currentTodo.links.push(linkTitle)
      }
    }

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
  <v-list>
    <v-list-subheader>Links</v-list-subheader>

    <v-list-item v-for="(link, index) in listsStore.currentTodo.links" :key="index">
      <v-list-item-title>
        <a v-if="!editLinks.includes(link.url)" :href="link.url" target="_blank">{{ link.title }}</a>
        <v-text-field v-else v-model="link.title" variant="outlined" @blur="listsStore.updateTodo()" />
      </v-list-item-title>
      <template #append>
        <v-btn v-if="!editLinks.includes(link.url)" icon="mdi-pencil" variant="text" @click="() => editLink(link)" />
        <v-btn v-else icon="mdi-cancel" variant="text" @click="() => cancelEditLink(link)" />

        <v-btn color="red" icon="mdi-delete" variant="text" @click="removeLink(link)" />
      </template>
    </v-list-item>
  </v-list>
</template>
