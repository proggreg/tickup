<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
const loginForm = ref()
const correctCredentials = ref(false)

const userNameRules = [
  (value: string) => {
    if (value) return true
    return 'Oops! Username required to login. 😊'
  },
  () => {
    return true
  }
]
const passwordRules = [
  (value: string) => {
    if (value) return true
    return 'Oops! Password required to login. 😊'
  },
]

onMounted(() => {
  if (window.location.href.includes('error=CredentialsSignin')) {
    correctCredentials.value = true
  }
})

const loginUser = async () => {
  const { valid } = await loginForm.value.validate()

  if (valid) {
    await signIn('credentials', { username: username.value, password: password.value })
  }

}
</script>
<template>
  <v-sheet>
    <v-form
      ref="loginForm"
      validate-on="submit input"
      @submit.prevent="loginUser"
    >
      <v-text-field
        v-model="username"
        label="Username"
        type="text"
        :rules="userNameRules"
        required
        class="error"
      />
    
      <v-text-field
        v-model="password"
        label="Password"
        :rules="passwordRules"
        type="password"
        required
      />
          <v-btn
          class="mb-4"
            color="primary"
            block
            type="submit"
          >
            Login
          </v-btn>
          <v-btn
            color="primary"
            append-icon="mdi-github"
            class="mb-4"
            block
            @click="signIn(`github`)"
          >
            Github Sign In
          </v-btn>
          <span>Don't have an account </span>
          <NuxtLink
            color="secondary"
            to="/register"
          >Register</NuxtLink>
      <v-snackbar
        v-model="correctCredentials"
        color="danger"
      >
        Incorrect Credentials
      </v-snackbar>
    </v-form>
</v-sheet></template>