<script setup lang="ts">
  const { data } = useAuth()
  const name = computed(() => {
    if (data?.user?.name) {
      return data.user.name
    } else {
      return data?.value?.user?.username
    }
  })

</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <!-- TODO remove shadow and make button fit image -->
      <v-btn v-bind="props">
      <v-avatar v-if="data?.user?.image" :image="data?.user?.image" />
      <v-avatar v-else icon="mdi-account" />
      <div class="ml-2">
        {{ name }} 
      </div>
    </v-btn>
    </template>
    <v-list>
      <v-list-item>
        Settings
      </v-list-item>
    </v-list>
  </v-menu>
</template>
