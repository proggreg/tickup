<script setup lang="ts">
const { signIn } = useAuth()
const username = ref('')
const password = ref('')
</script>
<template>
    <v-sheet
        width="300"
        color="background"
        class="pa-4"
        rounded="xl"
    >
        <v-form width="500">
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
                    >
                        Register
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
    </v-sheet>
</template>