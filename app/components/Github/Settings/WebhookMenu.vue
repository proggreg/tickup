<script setup lang="ts">
import type { RepoItem } from '~/composables/useGithubSettings';

const props = defineProps<{
    repos: RepoItem[];
    subscriptionsLoading: boolean;
    subscriptionsSaving: boolean;
    subscriptionsError: string;
    subscriptionsSaved: boolean;
    isRepoSubscribed: (fullName: string) => boolean;
}>();

const emit = defineEmits<{
    toggle: [fullName: string, subscribed: boolean];
    save: [];
}>();

const menuOpen = defineModel<boolean>('menuOpen', { default: false });

function toRepoTestId(fullName: string): string {
    return fullName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}
</script>

<template>
    <v-menu
        v-model="menuOpen"
        :close-on-content-click="false"
        location="bottom end"
    >
        <template #activator="{ props: menuProps }">
            <v-btn
                v-bind="menuProps"
                icon="mdi-github"
                variant="tonal"
                color="primary"
                data-testid="github-webhook-settings-menu-button"
            />
        </template>

        <v-card
            min-width="320"
            max-width="420"
        >
            <v-card-title class="text-subtitle-1">
                Webhook subscriptions
            </v-card-title>
            <v-card-subtitle>
                Choose which repos trigger todo status updates.
            </v-card-subtitle>
            <v-card-text>
                <div
                    v-if="props.subscriptionsLoading"
                    class="d-flex align-center ga-2"
                >
                    <v-progress-circular
                        indeterminate
                        size="18"
                    />
                    Loading subscriptions...
                </div>

                <v-alert
                    v-else-if="props.subscriptionsError"
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                    data-testid="github-webhook-subscriptions-error"
                >
                    {{ props.subscriptionsError }}
                </v-alert>

                <v-list
                    v-else
                    density="compact"
                >
                    <v-list-item
                        v-for="repo in props.repos"
                        :key="repo.id"
                        class="px-0"
                    >
                        <div class="d-flex align-center justify-space-between ga-3 w-100">
                            <span class="text-body-2">
                                {{ repo.full_name }}
                            </span>
                            <v-switch
                                :model-value="props.isRepoSubscribed(repo.full_name)"
                                color="primary"
                                density="compact"
                                hide-details
                                :disabled="props.subscriptionsSaving"
                                :data-testid="`github-webhook-switch-${toRepoTestId(repo.full_name)}`"
                                :data-subscribed="props.isRepoSubscribed(repo.full_name) ? 'true' : 'false'"
                                @update:model-value="value => emit('toggle', repo.full_name, !!value)"
                            />
                        </div>
                    </v-list-item>
                </v-list>

                <v-alert
                    v-if="props.subscriptionsSaved"
                    type="success"
                    variant="tonal"
                    density="compact"
                    class="mt-3"
                    data-testid="github-webhook-subscriptions-saved"
                >
                    Webhook subscriptions saved.
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn
                    variant="text"
                    @click="menuOpen = false"
                >
                    Close
                </v-btn>
                <v-btn
                    color="primary"
                    :loading="props.subscriptionsSaving"
                    data-testid="github-webhook-save-button"
                    @click="emit('save')"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>
