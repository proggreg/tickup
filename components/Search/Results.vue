<script setup lang="ts">
const store = useSearchStore()
const emit = defineEmits<{
  'item-click': [item: Todo]
}>()
</script>

<template>
  <v-virtual-scroll :items="store.results" height="100%" item-height="50">
    <template #default="{ item }">
      <v-list-item link :to="`/todo/${item._id}`">
        <template #prepend>
          <ListStatus :todo="item" />
        </template>

        <v-list-item-title class="font-weight-bold pa-4">
          {{ item.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) }}
          {{ new Date(item.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        </v-list-item-subtitle>
        <template #append>
          <v-btn :to="`/todo/${item._id}`" icon="mdi-open-in-new" variant="text" />
        </template>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>
