<script setup lang="ts">
import { getToolName } from 'ai';
import type { ToolUIPart, DynamicToolUIPart } from 'ai';

interface Props {
    part: ToolUIPart | DynamicToolUIPart;
}

const props = defineProps<Props>();

const open = ref(false);

const toolName = computed(() => getToolName(props.part));

const state = computed(() => props.part.state);

const stateIcon = computed(() => {
    switch (state.value) {
        case 'input-streaming':
        case 'input-available': return 'mdi-cog';
        case 'output-available': return 'mdi-check-circle';
        case 'output-error': return 'mdi-close';
        case 'output-denied': return 'mdi-cancel';
        default: return 'mdi-cog';
    }
});

const stateColor = computed(() => {
    switch (state.value) {
        case 'input-streaming':
        case 'input-available': return 'primary';
        case 'output-available': return 'success';
        case 'output-error': return 'error';
        case 'output-denied': return 'warning';
        default: return 'primary';
    }
});

const stateLabel = computed(() => {
    switch (state.value) {
        case 'input-streaming': return 'Calling…';
        case 'input-available': return 'Running…';
        case 'output-available': return 'Done';
        case 'output-error': return 'Error';
        case 'output-denied': return 'Denied';
        default: return state.value;
    }
});

const isLoading = computed(() => state.value === 'input-streaming' || state.value === 'input-available');

const input = computed(() => {
    if ('input' in props.part) return props.part.input;
    return undefined;
});

const output = computed(() => {
    if ('output' in props.part) return props.part.output;
    return undefined;
});

const errorText = computed(() => {
    if ('errorText' in props.part) return props.part.errorText;
    return undefined;
});
</script>

<template>
    <v-card
        class="chat-tool-call my-4 pa-2"
        data-testid="chat-tool-call"
        elevation="0"
        color="grey"
        rounded="xl"
    >
        <!-- Header row -->

        <div
            class="chat-tool-call__header d-flex align-center ga-2"
            @click="open = !open"
        >
            <v-progress-circular
                v-if="isLoading"
                :size="16"
                :width="2"
                indeterminate
                :color="stateColor"
                class="chat-tool-call__spinner"
            />
            <v-icon
                v-else
                :color="stateColor"
                size="16"
            >
                {{ stateIcon }}
            </v-icon>

            <span class="chat-tool-call__name">{{ toolName }}</span>

            <span>{{ stateLabel }}</span>

            <v-icon
                size="14"
                class="chat-tool-call__chevron"
                :class="{ 'chat-tool-call__chevron--open': open }"
            >
                mdi-chevron-down
            </v-icon>
        </div>

        <!-- Expandable detail -->
        <v-expand-transition>
            <div
                v-if="open"
                class="d-flex flex-column ga-1 pa-3"
            >
                <template v-if="input !== undefined">
                    <p>
                        Input
                    </p>
                    <pre
                        class="chat-tool-call__json"
                        data-testid="chat-tool-call-input"
                    >{{ JSON.stringify(input, null, 2) }}</pre>
                </template>

                <template v-if="output !== undefined">
                    <p>
                        Output
                    </p>
                    <pre
                        class="chat-tool-call__json"
                        data-testid="chat-tool-call-output"
                    >{{ JSON.stringify(output, null, 2) }}</pre>
                </template>

                <template v-if="errorText">
                    <p class="chat-tool-call__label chat-tool-call__label--error">
                        Error
                    </p>
                    <pre
                        class="chat-tool-call__json chat-tool-call__json--error"
                        data-testid="chat-tool-call-error"
                    >{{ errorText }}</pre>
                </template>
            </div>
        </v-expand-transition>
    </v-card>
</template>

<style scoped>
.chat-tool-call {
    overflow: hidden;
    font-size: 0.8rem;
    max-width: 320px;
}

.chat-tool-call__header {
    padding: 6px 10px;
    cursor: pointer;
    user-select: none;
}

.chat-tool-call__name {
    font-weight: 600;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chat-tool-call__status {
    color: rgba(var(--v-theme-on-surface), 0.55);
    font-size: 0.75rem;
    white-space: nowrap;
}

.chat-tool-call__chevron {
    transition: transform 0.2s ease;
    opacity: 0.55;
}

.chat-tool-call__chevron--open {
    transform: rotate(180deg);
}

.chat-tool-call__label {
    margin: 0;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(var(--v-theme-on-surface), 0.55);
}

.chat-tool-call__label--error {
    color: rgb(var(--v-theme-error));
}

.chat-tool-call__json {
    font-family: monospace;
    font-size: 0.72rem;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 180px;
    overflow-y: auto;
}

.chat-tool-call__json--error {
    background: rgba(var(--v-theme-error), 0.08);
    color: rgb(var(--v-theme-error));
}
</style>
