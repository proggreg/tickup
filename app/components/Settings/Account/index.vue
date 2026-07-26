<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
}
</script>

<template>
    <v-card class="settings-card">
        <SettingsAccountRow
            icon="mdi-email-outline"
            label="Email"
            :value="user?.email"
        />
        <div class="card-divider" />
        <SettingsAccountRow
            icon="mdi-logout"
            label="Sign out"
            action-icon="mdi-chevron-right"
            @click="signOut"
        />
    </v-card>
</template>

<style scoped>
.settings-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow:
        0 1px 2px rgba(42, 52, 57, 0.04),
        0 0 0 1px rgba(113, 124, 130, 0.1);
    padding: 4px;
    overflow: hidden;
}
.card-divider {
    height: 1px;
    background: rgba(113, 124, 130, 0.16);
    margin-left: 52px;
}
</style>
