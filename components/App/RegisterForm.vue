<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
const registering = ref(false)
async function registerUser() {
  registering.value = true
  const { data } = await useFetch<{ username: string, password: string }>('/api/auth/user', {
    method: 'POST',
    body: {
      username: username.value,
      password: password.value,
    },
  })

  if (data.value?.username && data.value?.password) {
    signIn('credentials', { username: username.value, password: password.value })
    registering.value = false
  }
}

const userNameRules = [
  (username: string) => {
    if (username) {
      // Length requirements (typically 3-30 characters)
      if (username.length < 3 || username.length > 30) {
        return 'Username must be between 3 and 30 characters'
      }

      // Allowed characters (letters, numbers, and some special characters)
      const validCharacters = /^[a-zA-Z0-9._-]+$/
      if (!validCharacters.test(username)) {
        return 'Username can only contain letters, numbers, dots, underscores, and hyphens'
      }

      // Prevent username starting/ending with special characters
      if (/^[._-]|[._-]$/.test(username)) {
        return 'Username cannot start or end with dots, underscores, or hyphens'
      }

      // Prevent consecutive special characters
      if (/[._-]{2,}/.test(username)) {
        return 'Username cannot contain consecutive dots, underscores, or hyphens'
      }

      // Prevent reserved words/names
      const reservedWords = ['admin', 'administrator', 'root', 'system', 'support']
      if (reservedWords.includes(username.toLowerCase())) {
        return 'This username is reserved'
      }

      return true
    }
    return 'Oops! Username required to register. 😊'
  },
  async (value: boolean | string) => {
    const data = await $fetch('/api/auth/user', { query: { username: value } })
    if (data !== 'taken') {
      return true
    }
    return 'Oops! Username taken 😊'
  },
]

const passwordRules = [
  (value: string) => {
    if (value) return true

    return 'Oops! password required to register. 😊'
  },
  (value: string) => {
    if (value.length >= 8) return true

    return 'Oops! password must be at least 8 characters. 😊'
  },
]
</script>

<template>
  <v-form style="max-width: 400px" class="flex-1 mx-auto" validate-on="input lazy" @submit.prevent>
    <v-text-field v-model="username" label="Username" type="text" :rules="userNameRules" :hide-details="false" />
    <v-text-field v-model="password" label="Password" type="password" :rules="passwordRules" :hide-details="false" />

    <v-btn :disabled="registering" block type="submit" color="primary" class="mb-4" @click="registerUser">
      Register
    </v-btn>
    <div class="text-center">
      <span>Already a user? </span>
      <NuxtLink color="secondary" to="/login">Login</NuxtLink>
    </div>
  </v-form>
</template>
