<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
async function registerUser() {
    console.log('register user')

    const { data } = await useFetch('/api/auth/user', {
        method: 'POST',
        body: {
            username: username.value,
            password: password.value
        }
    })
    console.log('user', data)
    if (data.value) {
        signIn('credentials', { username, password })
    }
    console.log(data.value)

}
</script>
<template>
    <v-sheet
        width="300"
        color="background"
        class="pa-4"
        rounded="xl"
    >
        <v-form>
            <v-text-field
                v-model="username"
                label="Username"
                type="text"
                required
                width="300"
            />
            <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
            />
            <v-row>

                <v-col>
                    <v-btn
                        color="primary"
                        to="/register"
                        @click="registerUser"
                    >
                        Register
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
    </v-sheet>
</template>