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
        loginError.value = error?.message ?? 'Invalid login credentials';
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
                <v-card-title class="text-center pa-6">
                    <h2 class="text-h4 font-weight-bold">
                        Welcome
                    </h2>
                    <p class="text-subtitle-1 text-medium-emphasis mt-4">
                        Sign in to your account
                    </p>
                </v-card-title>

                <v-card-text class="pt-0">
                    <v-alert
                        v-if="loginError"
                        type="error"
                        class="mb-4"
                        data-testid="login-error-alert"
                    >
                        {{ loginError }}
                    </v-alert>

                    <form
                        class="d-flex flex-column"
                        @submit.prevent="signInWithPassword"
                    >
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
                            color="secondary"
                            variant="outlined"
                            size="large"
                            block
                            :disabled="!email || !password"
                            @click="signUpWithPassword"
                        >
                            Create Account
                        </v-btn>
                    </form>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
