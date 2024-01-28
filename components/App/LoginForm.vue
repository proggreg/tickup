<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
</script>
<template>
  <v-form>
    <v-text-field
      v-model="username"
      label="Username"
      type="text"
      required
    />
    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      required
    />
    <v-btn
      @click="signIn('credentials', { username, password })"
    >
      Login
    </v-btn>
  </v-form>
</template>