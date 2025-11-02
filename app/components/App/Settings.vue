<script setup>
// TODO settings controls
const open = ref(false)
</script>

<template>
  <v-dialog :model-value="open">
    <template #default="{ isActive }">
      <v-card title="Settings">
        <v-card-item>
          <v-slider label="Card Width" />
        </v-card-item>

        <v-card-actions>
          <v-spacer />

          <v-btn
            text="Close Dialog"
            @click="isActive.value = false"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
