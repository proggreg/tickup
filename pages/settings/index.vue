<script setup lang="ts">
definePageMeta({
  layout: 'settings',
})
</script>

<template>
  <v-container class="py-10" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <h2 class="text-center mb-6 text-h4 font-weight-bold">Settings</h2>
        <v-card elevation="2" class="pa-6 text-center">
          <p class="mb-6">Manage your Tickup settings by selecting a section below:</p>
          <v-row class="mb-2" justify="center">
            <v-col cols="12" sm="4" class="d-flex justify-center">
              <v-btn color="primary" variant="outlined" to="/settings/statuses" prepend-icon="mdi-format-list-bulleted">Statuses</v-btn>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-center">
              <v-btn color="primary" variant="outlined" to="/settings/notifications" prepend-icon="mdi-bell">Notifications</v-btn>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-center">
              <v-btn color="primary" variant="outlined" to="/settings/account" prepend-icon="mdi-account">Account</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
