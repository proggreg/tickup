<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
async function registerUser() {
    const { data } = await useFetch('/api/auth/user', {
        method: 'POST',
        body: {
            username: username.value,
            password: password.value
        }
    })

    if (data.value) {
        signIn('credentials', { username: username.value, password: password.value })
    }
}

const userNameRules = [
    (value: boolean | string) => {
        if (value) return true
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
    <v-sheet
        width="300"
        color="background"
        class="pa-4"
        rounded="xl"
    >
        <v-form @submit.prevent>
            <v-text-field
                v-model="username"
                label="Username"
                type="text"
                :rules="userNameRules"
                width="300"
            />
            <v-text-field
                v-model="password"
                label="Password"
                type="password"
                :rules="passwordRules"
            />

            <v-btn
                block
                type="submit"
                color="primary"
                @click="registerUser"
            >
                Register
            </v-btn>
            <v-col
                cols="12"
                style="font-size: 0.8rem"
            >
                <span>Already a user? </span>
                <NuxtLink
                    color="secondary"
                    to="/login"
                >Login</NuxtLink>
            </v-col>
        </v-form>
    </v-sheet>
</template>