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

const stateColorVar = computed(() => {
    switch (state.value) {
        case 'input-streaming':
        case 'input-available': return '--v-theme-primary';
        case 'output-available': return '--v-theme-success';
        case 'output-error': return '--v-theme-error';
        case 'output-denied': return '--v-theme-warning';
        default: return '--v-theme-primary';
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
    <div
        class="chat-tool-call"
        data-testid="chat-tool-call"
    >
        <div
            class="chat-tool-call__header"
            @click="open = !open"
        >
            <span
                v-if="isLoading"
                class="spinner"
                :style="{ borderTopColor: `rgb(var(${stateColorVar}))` }"
            />
            <i
                v-else
                :class="`mdi ${stateIcon}`"
                :style="{ color: `rgb(var(${stateColorVar}))`, fontSize: '16px' }"
            />

            <span class="chat-tool-call__name">{{ toolName }}</span>

            <span class="chat-tool-call__status">{{ stateLabel }}</span>

            <i
                class="mdi mdi-chevron-down chat-tool-call__chevron"
                :class="{ 'chat-tool-call__chevron--open': open }"
                style="font-size: 14px;"
            />
        </div>

        <Transition name="expand">
            <div
                v-if="open"
                class="chat-tool-call__body"
            >
                <template v-if="input !== undefined">
                    <p class="chat-tool-call__label">
                        Input
                    </p>
                    <pre
                        class="chat-tool-call__json"
                        data-testid="chat-tool-call-input"
                    >{{ JSON.stringify(input, null, 2) }}</pre>
                </template>

                <template v-if="output !== undefined">
                    <p class="chat-tool-call__label">
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
        </Transition>
    </div>
</template>

<style scoped>
.chat-tool-call {
    overflow: hidden;
    font-size: 0.8rem;
    max-width: 320px;
    background: rgba(var(--v-border-color), 0.08);
    border-radius: 12px;
    margin: 16px 0;
    padding: 8px;
}

.chat-tool-call__header {
    display: flex;
    align-items: center;
    gap: 8px;
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

.chat-tool-call__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
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

.spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid transparent;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.expand-enter-active,
.expand-leave-active {
    transition: opacity 0.2s, max-height 0.25s;
    max-height: 400px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
}
</style>
