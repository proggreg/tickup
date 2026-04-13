<script setup lang="ts">
import { Button, Input } from '@vuetify/v0';

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
    <div class="login-page">
        <div class="login-card">
            <div class="login-card__logo">
                <img
                    src="/pwa-512x512.png"
                    class="logo-img"
                    alt="TickUp"
                >
            </div>

            <div
                v-if="loginError"
                class="login-error"
                data-testid="login-error-alert"
            >
                <i class="mdi mdi-alert-circle" />
                {{ loginError }}
            </div>

            <form
                class="login-form"
                @submit.prevent="signInWithPassword"
            >
                <div class="field-group">
                    <label class="field-label">Email</label>
                    <div class="field-wrapper">
                        <i class="mdi mdi-email field-icon" />
                        <Input.Root v-model="email">
                            <Input.Control
                                class="field-input"
                                type="email"
                                required
                            />
                        </Input.Root>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">Password</label>
                    <div class="field-wrapper">
                        <i class="mdi mdi-lock field-icon" />
                        <Input.Root v-model="password">
                            <Input.Control
                                class="field-input"
                                type="password"
                                required
                            />
                        </Input.Root>
                    </div>
                </div>

                <Button.Root
                    type="submit"
                    class="btn btn--primary btn--block"
                    :disabled="!email || !password"
                >
                    Sign In
                </Button.Root>

                <Button.Root
                    type="button"
                    class="btn btn--outline btn--block"
                    :disabled="!email || !password"
                    @click="signUpWithPassword"
                >
                    Create Account
                </Button.Root>

                <Button.Root
                    type="button"
                    class="btn btn--block"
                    :disabled="!email.length"
                    @click="resetPassword"
                >
                    Reset Password
                </Button.Root>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 24px;
}

.login-card {
    width: 100%;
    max-width: 400px;
    padding: 32px;
    border-radius: 16px;
    background: rgb(var(--v-theme-surface));
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.login-card__logo {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
}

.logo-img {
    width: 80px;
    height: 80px;
    border-radius: 12px;
}

.login-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 8px;
    background: rgba(var(--v-theme-error), 0.1);
    color: rgb(var(--v-theme-error));
    font-size: 0.875rem;
    margin-bottom: 16px;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(var(--v-theme-on-surface), 0.8);
}

.field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.field-icon {
    position: absolute;
    left: 12px;
    font-size: 18px;
    color: rgba(var(--v-theme-on-surface), 0.5);
    z-index: 1;
    pointer-events: none;
}

.field-input {
    width: 100%;
    padding: 10px 14px 10px 40px;
    border: 1px solid rgba(var(--v-border-color), 0.38);
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.field-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    transition: background 0.15s, opacity 0.15s;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn--block {
    width: 100%;
}

.btn--primary {
    background: rgb(var(--v-theme-primary));
    color: #fff;
}

.btn--primary:hover:not(:disabled) {
    background: rgba(var(--v-theme-primary), 0.85);
}

.btn--outline {
    background: transparent;
    border: 1px solid rgba(var(--v-border-color), 0.38);
}

.btn--outline:hover:not(:disabled) {
    background: rgba(var(--v-border-color), 0.08);
}
</style>
