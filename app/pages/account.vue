<script setup lang="ts">
import { Button } from '@vuetify/v0';

definePageMeta({
    title: 'Account',
    description: 'Account page',
});

// const supabase = useSupabaseClient()
// const user = useSupabaseUser()

const logout = async () => {
    // await supabase.auth.signOut()
    await navigateTo('/login');
};
</script>

<template>
    <div class="account-page">
        <div class="account-header">
            <h1>My Account</h1>
            <div class="account-header__dark-mode">
                <AppDarkMode />
            </div>
        </div>

        <div class="account-email">
            <h4>{{ user?.email }}</h4>
        </div>

        <div class="account-actions">
            <Button.Root
                class="btn btn--block"
                to="settings"
            >
                settings
            </Button.Root>
            <Button.Root
                class="btn btn--block"
                @click="logout"
            >
                Logout
            </Button.Root>
        </div>
    </div>
</template>

<style scoped>
.account-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 24px;
}

.account-header {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 16px;
}

.account-header__dark-mode {
    position: absolute;
    right: 0;
}

.account-email {
    display: flex;
    justify-content: center;
    margin-bottom: auto;
}

.account-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-bottom: 24px;
}

.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    background: rgba(var(--v-border-color), 0.1);
    color: inherit;
    text-decoration: none;
    text-transform: capitalize;
    transition: background 0.15s;
}

.btn:hover {
    background: rgba(var(--v-border-color), 0.18);
}

.btn--block {
    width: 100%;
}
</style>
