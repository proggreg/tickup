<script setup lang="ts">
const { data } = useAuth()
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <!-- TODO remove shadow and make button fit image -->

      <v-btn
        v-bind="props"
        width="50"
        height="50"
        variant="text"
      >
        <v-img
          :src="data?.user?.image"
          width="50"
          style=" border-radius: 50%;"
        />
      </v-btn>
      <v-label>{{ data?.user?.username ? data?.user?.username : data.user._doc.username }}</v-label>
    </template>
    <v-list>
      <v-list-item>
        Settings
      </v-list-item>
    </v-list>
  </v-menu>
</template>
