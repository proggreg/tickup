<script setup lang="ts">
definePageMeta({
    layout: 'login-register',
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const email = ref('');
const password = ref('');
const loginError = ref('');

watchEffect(async () => {
    if (user.value) {
        return navigateTo('/');
    }
});

async function signInWithPassword() {
    loginError.value = '';
    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });

    if (error) {
        loginError.value = error.message;
        console.error('Login failed:', error);
    }
}

async function signUpWithPassword() {
    loginError.value = '';
    const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });

    if (error) {
        console.error('Signup failed:', error);
    }
}

async function resetPassword() {
    loginError.value = '';
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: '/reset',
    });

    if (error) {
        console.error('Signup failed:', error);
    }
}
</script>

<template>
    <v-row
        width="100%"
        align="center"
        justify="center"
        class="fill-height"
    >
        <v-col
            cols="12"
            sm="8"
            md="6"
            lg="4"
            xl="3"
        >
            <v-card
                class="pa-8"
                elevation="2"
                width="100%"
            >
                <v-card-item class="mb-4">
                    <v-img
                        class="mx-auto"
                        width="50%"
                        rounded="xl"
                        src="/pwa-512x512.png"
                    />
                </v-card-item>

                <v-card-text>
                    <v-form @submit.prevent="signInWithPassword">
                        <v-alert
                            v-if="loginError"
                            type="error"
                            variant="tonal"
                            closable
                            class="mb-4"
                            @click:close="loginError = ''"
                        >
                            {{ loginError }}
                        </v-alert>

                        <v-text-field
                            v-model="email"
                            label="Email"
                            type="email"
                            variant="outlined"
                            prepend-inner-icon="mdi-email"
                            class="mb-6"
                            required
                        />

                        <v-text-field
                            v-model="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            prepend-inner-icon="mdi-lock"
                            class="mb-8"
                            required
                        />

                        <v-btn
                            type="submit"
                            color="primary"
                            variant="flat"
                            size="large"
                            block
                            class="mb-4"
                            :disabled="!email || !password"
                        >
                            Sign In
                        </v-btn>

                        <v-btn
                            type="button"
                            color="terniary"
                            variant="outlined"
                            size="large"
                            block
                            :disabled="!email || !password"
                            @click="signUpWithPassword"
                        >
                            Create Account
                        </v-btn>

                        <v-btn
                            block
                            class="mb-4"
                            :disabled="!email.length"
                            @click="resetPassword"
                        >
                            Reset Password
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
