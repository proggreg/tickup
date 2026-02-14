<script setup lang="ts">
import type { UIMessage } from 'ai';

interface Props {
    messages: UIMessage[];
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
});

const scrollContainer = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const SCROLL_THRESHOLD = 60; // px from bottom to consider "at bottom"

function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    const el = scrollContainer.value;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
}

function onScroll() {
    const el = scrollContainer.value;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottom.value = distanceFromBottom <= SCROLL_THRESHOLD;
}

// Auto-scroll when messages change, but only if already at the bottom
watch(
    () => props.messages,
    () => {
        if (isAtBottom.value) {
            nextTick(() => scrollToBottom());
        }
    },
    { deep: true },
);

// Scroll to bottom instantly on first load
onMounted(() => scrollToBottom('instant'));
</script>

<template>
    <div class="chat-message-list-wrapper">
        <!-- Scrollable message area -->
        <div
            ref="scrollContainer"
            class="chat-message-list"
            data-testid="chat-message-list"
            @scroll.passive="onScroll"
        >
            <div
                v-for="(m, index) in messages"
                :key="m.id ?? index"
                class="chat-message"
                :class="m.role === 'user' ? 'chat-message--user' : 'chat-message--assistant'"
                data-testid="chat-message"
            >
                <v-chip
                    class="mb-1"
                    :color="m.role === 'user' ? 'primary' : 'surface-variant'"
                    size="x-small"
                    label
                >
                    {{ m.role === 'user' ? 'You' : 'AI' }}
                </v-chip>

                <div
                    v-for="(part, partIndex) in m.parts"
                    :key="`${m.id}-${part.type}-${partIndex}`"
                >
                    <p
                        v-if="part.type === 'text'"
                        class="chat-message__text"
                        data-testid="chat-message-text"
                    >
                        {{ part.text }}
                    </p>
                </div>
            </div>

            <!-- Typing indicator -->
            <div
                v-if="loading"
                class="chat-message chat-message--assistant"
                data-testid="chat-message-loading"
            >
                <v-chip
                    class="mb-1"
                    color="surface-variant"
                    size="x-small"
                    label
                >
                    AI
                </v-chip>
                <v-progress-linear
                    indeterminate
                    color="primary"
                    height="2"
                    class="mt-1"
                    style="max-width: 80px;"
                />
            </div>

            <!-- Bottom anchor -->
            <div class="chat-message-list__anchor" />
        </div>

        <!-- Scroll to bottom button -->
        <Transition name="fade">
            <v-btn
                v-if="!isAtBottom"
                class="chat-scroll-btn"
                color="primary"
                icon="mdi-chevron-down"
                size="small"
                elevation="4"
                data-testid="chat-scroll-to-bottom"
                @click="scrollToBottom()"
            />
        </Transition>
    </div>
</template>

<style scoped>
.chat-message-list-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
}

.chat-message-list {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
}

.chat-message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
}

.chat-message--user {
    align-self: flex-end;
    align-items: flex-end;
}

.chat-message--assistant {
    align-self: flex-start;
    align-items: flex-start;
}

.chat-message__text {
    margin: 0;
    padding: 8px 12px;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-variant));
    color: rgb(var(--v-theme-on-surface-variant));
    white-space: pre-wrap;
    word-break: break-word;
    line-height: 1.5;
}

.chat-message--user .chat-message__text {
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.chat-message-list__anchor {
    height: 1px;
    flex-shrink: 0;
}

.chat-scroll-btn {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
