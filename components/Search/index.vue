<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

const { mdAndUp } = useDisplay()
const query = ref<string>('')
const results = ref<Todo[]>([])
const open = ref(false)
const todoDialogOpen = ref(false)
const { data } = useAuth()
const items = ref([])
const loading = ref(false)

const debouncedFn = useDebounceFn(async () => {
  loading.value = true
  const { data: searchResults } = await useFetch(`/api/search/todo`, {
    query: {
      q: query.value,
      id: data.value?.user.sub,
    },
  })
  results.value = searchResults.value as Todo[]
  loading.value = false
  console.log(searchResults)
}, 500)
watch(query, (newQuery) => {
  if (newQuery.length) {
    open.value = true
    loading.value = true
    debouncedFn()
  }
})

onMounted(() => {
  // search()
  console.log('mounted')
})
</script>

<template>
  <v-dialog width="500" min-height="300" :model-value="open">
    <template #activator="{ props }">
      <v-text-field v-model="query" append-inner-icon="mdi-magnify" v-on="props" />
    </template>

    <template #default="{ isActive }">
      <v-card v-show="isActive" min-height="300">
        <v-card-item class="pa-4">
          <v-text-field
            v-model="query"
            placeholder="search"
            autofocus
          />
        </v-card-item>

        <v-divider />
        <!-- <v-virtual-scroll :items="items" height="300" item-height="50">
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
        </v-virtual-scroll> -->
        <v-card-item>
          <v-list v-if="loading">
            <v-list-item v-for="n in 5" :key="n">
              <v-skeleton-loader type="list-item" />
            </v-list-item>
          </v-list>

          <v-list-item
            v-for="(result, index) in results"
            v-else
            :key="index"
            :to="`/todo/${result._id}`"
            @click="open = false"
          >
            <v-list-item-title class="font-weight-bold">
              {{ result.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ result.status }}
            </v-list-item-subtitle>

          <!-- <div
            v-if="result.updatedAt"
            class="text-overline"
          >
            Updated at: {{ formattedDate(result.updatedAt) }} {{ formattedTime(result.updatedAt) }}
          </div> -->
          </v-list-item>
        </v-card-item>
      </v-card>
    </template>
  </v-dialog>
</template>
