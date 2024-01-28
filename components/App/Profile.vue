<script setup lang="ts">
const { data } = useAuth()
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props">
        <v-img
          :src="data?.user?.image"
          width="50"
          style="margin-right: 15px;"
        />
      </v-btn>
      <v-img
        :src="data?.user?.image"
        width="50"
        style="margin-right: 15px;"
      />
      <v-label>{{ data?.user?.name }}</v-label>
    </template>
    <v-list>
      <v-list-item>
        Settings
      </v-list-item>
    </v-list>
  </v-menu>
</template>
