<script setup lang="ts">
const loggedIn = false
</script>

<template>
  <v-menu v-if="loggedIn">
    <template #activator="{ props }">
      <v-btn block v-bind="props" append-icon="mdi-chevron-down">
        <v-avatar
          icon="mdi-account"
        />
        <div class="ml-2" />
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        class="text-body-2 py-0 ma-2" append-icon="mdi-cog-outline"
        @click="navigateTo('/settings')"
      >
        Settings
      </v-list-item>
      <v-list-item
        class="text-body-2 py-0 ma-2" append-icon="mdi-logout"
      >
        Sign Out
      </v-list-item>
    </v-list>
  </v-menu>
</template>
