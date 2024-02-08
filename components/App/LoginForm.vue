<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
</script>
<template>
  <v-sheet>
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
      <v-row>
        <v-col cols="12">
          <v-btn
            color="primary"
            block
            @click="signIn('credentials', { username, password })"
          >
            Login
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-btn
            color="primary"
            append-icon="mdi-github"
            block
            @click="signIn(`github`, { callbackUrl: 'http://localhost:3000/' })"
          >
            Github Sign In
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          style="font-size: 0.8rem"
        >
          <span>Don't have an account </span>
          <NuxtLink
            color="secondary"
            to="/register"
          >Register</NuxtLink>
        </v-col>
      </v-row>
    </v-form>
  </v-sheet>
</template>