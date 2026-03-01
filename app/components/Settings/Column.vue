<script setup lang="ts">
interface Props {
    title: string;
    icon?: string;
    description?: string;
    /**
     * Optional status label shown as a chip in the header, e.g. "Connected" / "Not connected".
     */
    statusLabel?: string;
    /**
     * Status chip color, e.g. "success", "error", "warning" or any Vuetify color.
     */
    statusColor?: string;
    /**
     * Optional data-testid for Playwright and other tests.
     */
    testId?: string;
}

const props = defineProps<Props>();
</script>

<template>
    <v-col
        cols="12"
        md="6"
        lg="4"
        class="settings-column"
        :data-testid="props.testId"
    >
        <v-card
            class="pa-4 d-flex flex-column h-100"
            variant="flat"
        >
            <v-card-title class="d-flex align-center justify-space-between px-0 pt-0 pb-2">
                <div class="d-flex align-center ga-2">
                    <v-icon
                        v-if="props.icon"
                        :icon="props.icon"
                    />
                    <span class="font-weight-medium text-subtitle-1">
                        {{ props.title }}
                    </span>
                </div>
                <v-chip
                    v-if="props.statusLabel"
                    size="small"
                    :color="props.statusColor || 'default'"
                    variant="tonal"
                >
                    {{ props.statusLabel }}
                </v-chip>
            </v-card-title>

            <v-card-subtitle
                v-if="props.description"
                class="px-0 pb-3 text-body-2"
            >
                {{ props.description }}
            </v-card-subtitle>

            <v-card-text class="px-0 pt-0 pb-3 flex-grow-1">
                <!-- Main content for the column (form fields, selectors, etc.) -->
                <slot />
            </v-card-text>

            <v-card-actions class="px-0 pt-0">
                <!-- Optional footer actions (buttons, links, etc.) -->
                <slot name="actions" />
            </v-card-actions>
        </v-card>
    </v-col>
</template>

<style scoped>
.settings-column {
    /* Ensure consistent vertical spacing between columns */
    margin-bottom: 16px;
}
</style>
