<script setup lang="ts">
 const store = useSearchStore()
</script>
<template>
  <v-virtual-scroll :items="store.results" height="300" item-height="50">
          <template #default="{ item }">
            <v-list-item link :to="`/todo/${item._id}`" @click="open = false">
              <template #prepend>
                <ListStatus :todo="item" />
              </template>

              <v-list-item-title class="font-weight-bold pa-4">
                {{ item.name }}
              </v-list-item-title>

              <template #append>
                <v-btn :to="`/todo/${item._id}`" icon="mdi-open-in-new" variant="text" />
              </template>
            </v-list-item>
          </template>
        </v-virtual-scroll>
</template>