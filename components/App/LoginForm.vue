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
    console.log('couldn\'nt login', loginForm.value)
    correctCredentials.value = true
  }
})

const loginUser = async () => {
  const { valid } = await loginForm.value.validate()

  console.log(loginForm.value)

  if (valid) {
    const response = await signIn('credentials', { username: username.value, password: password.value })

    console.log(response)

  }

}
</script>
<template>
  <v-sheet>
    <v-form
      ref="loginForm"
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
      <v-row>
        <v-col cols="12">
          <v-btn
            color="primary"
            block
            type="submit"
          >
            Login
          </v-btn>
        </v-col>

        <v-col cols="12">
          <v-btn
            color="primary"
            append-icon="mdi-github"
            block
            @click="signIn(`github`)"
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
      <v-snackbar
        color="danger"
        v-model="correctCredentials"
      >Incorrect Credentials</v-snackbar>
    </v-form>
</v-sheet></template>