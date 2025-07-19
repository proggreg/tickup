<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" md="3" class="pa-0">
        <v-navigation-drawer app permanent width="220" class="pa-0">
          <v-list nav dense>
            <v-list-item :to="'/settings/statuses'" :active="$route.path === '/settings/statuses'">
              <v-list-item-icon><v-icon>mdi-format-list-bulleted</v-icon></v-list-item-icon>
              <v-list-item-title>Statuses</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/settings/notifications'" :active="$route.path === '/settings/notifications'">
              <v-list-item-icon><v-icon>mdi-bell</v-icon></v-list-item-icon>
              <v-list-item-title>Notifications</v-list-item-title>
            </v-list-item>
            <v-list-item :to="'/settings/account'" :active="$route.path === '/settings/account'">
              <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
      </v-col>
      <v-col cols="12" md="9" class="pa-4">
        <NuxtPage />
      </v-col>
    </v-row>
  </v-container>
</template>
