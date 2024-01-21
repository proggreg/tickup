<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        color="primary"
        v-bind="props"
      >
        My Profile
      </v-btn>
    </template>
    <v-list />
  </v-menu>
</template>
