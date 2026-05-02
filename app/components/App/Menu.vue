<script setup lang="ts">
const supabase = useSupabaseClient();
const user = await supabase.auth.getUser();
</script>

<template>
    <v-menu>
        <template #activator="{ props }">
            <v-btn
                block
                v-bind="props"
                append-icon="mdi-chevron-down"
            >
                <v-avatar
                    v-if="false"
                    :image="data?.user?.image"
                    size="x-small"
                />
                <v-avatar
                    v-else
                    icon="mdi-account"
                />
                <div class="ml-2">
                    {{ user.email }}
                </div>
            </v-btn>
        </template>
        <v-list>
            <v-list-item
                class="text-body-2 py-0 ma-2"
                append-icon="mdi-cog-outline"
                @click="navigateTo('/settings')"
            >
                Settings
            </v-list-item>
            <v-list-item
                class="text-body-2 py-0 ma-2"
                append-icon="mdi-logout"
                @click="signOut()"
            >
                Sign Out
            </v-list-item>
        </v-list>
    </v-menu>
</template>
