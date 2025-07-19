<script setup lang="ts">
const { data, signOut } = useAuth()
async function deleteAccount() {
  await signOut()
}
</script>
<template>
  <v-card elevation="2" class="pa-4">
    <h2 class="mb-4 text-h5 font-weight-bold">User Account</h2>
    <div class="mb-4">
      <div v-if="data?.user">
        <div class="mb-1"><strong>Username:</strong> {{ data.user.username }}</div>
        <div><strong>Name:</strong> {{ data.user.name }}</div>
      </div>
    </div>
    <v-row>
      <v-col cols="12" class="d-flex justify-end">
        <v-btn class="text-body-2 py-0 ma-2" append-icon="mdi-logout" @click="signOut()">
          Sign Out
        </v-btn>
        <v-btn class="text-body-2 py-0 ma-2" color="error" append-icon="mdi-delete" @click="deleteAccount">
          Delete Account
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template> 