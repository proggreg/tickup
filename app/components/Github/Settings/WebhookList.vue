<script setup lang="ts">
import type { WebhookItem } from '~/composables/useGithubSettings';

const props = defineProps<{
    webhooks: WebhookItem[];
    loading: boolean;
    error: string;
    deletingIds: number[];
}>();

const emit = defineEmits<{
    delete: [hookId: number, repoFullName: string];
}>();
</script>

<template>
    <div>
        <div
            v-if="props.loading"
            class="d-flex align-center ga-2 pa-4"
        >
            <v-progress-circular
                indeterminate
                size="18"
            />
            Loading webhooks...
        </div>

        <v-alert
            v-else-if="props.error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
        >
            {{ props.error }}
        </v-alert>

        <div
            v-else-if="props.webhooks.length === 0"
            class="text-medium-emphasis text-body-2 pa-2"
        >
            No webhooks found.
        </div>

        <v-list
            v-else
            density="compact"
        >
            <v-list-item
                v-for="hook in props.webhooks"
                :key="hook.id"
                class="px-0"
            >
                <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ hook.repoFullName }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                    {{ hook.config.url }}
                </v-list-item-subtitle>
                <template #append>
                    <div class="d-flex align-center ga-2">
                        <v-chip
                            size="x-small"
                            :color="hook.active ? 'success' : 'default'"
                            variant="tonal"
                        >
                            {{ hook.active ? 'Active' : 'Inactive' }}
                        </v-chip>
                        <v-btn
                            icon="mdi-delete"
                            size="x-small"
                            variant="text"
                            color="error"
                            :loading="props.deletingIds.includes(hook.id)"
                            :data-testid="`github-webhook-delete-${hook.id}`"
                            @click="emit('delete', hook.id, hook.repoFullName)"
                        />
                    </div>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>
