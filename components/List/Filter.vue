<script setup lang="ts">
// const listsStore = useListsStore()
const items = ref([''])
const value = ref('')

// TODO finish component

</script>
<template>
  <v-select v-model="value" label="filter" :items="items" />
</template>
